import { spawn } from "node:child_process";
import { randomBytes, randomUUID } from "node:crypto";
import { readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const REDIRECT_URI = "http://127.0.0.1:8888/callback";
export const SPOTIFY_SCOPES = [
  "user-read-currently-playing",
  "user-read-recently-played",
];

const CALLBACK_HOST = "127.0.0.1";
const CALLBACK_PORT = 8888;
const CALLBACK_PATH = "/callback";
const CALLBACK_TIMEOUT_MS = 5 * 60 * 1000;

class ReauthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ReauthorizationError";
  }
}

export function getSpotifyConfiguration(environment = process.env) {
  const required = ["SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET"];
  const missing = required.filter((key) => !environment[key]);

  if (missing.length > 0) {
    throw new ReauthorizationError(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    clientId: environment.SPOTIFY_CLIENT_ID,
    clientSecret: environment.SPOTIFY_CLIENT_SECRET,
  };
}

export function buildAuthorizationUrl({ clientId, state }) {
  const url = new URL("https://accounts.spotify.com/authorize");
  url.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SPOTIFY_SCOPES.join(" "),
    state,
    show_dialog: "true",
  }).toString();

  return url.toString();
}

export function parseAuthorizationCallback(requestUrl, expectedState) {
  const url = new URL(requestUrl, REDIRECT_URI);

  if (url.pathname !== CALLBACK_PATH) {
    throw new ReauthorizationError("Unexpected callback path.");
  }

  if (url.searchParams.get("state") !== expectedState) {
    throw new ReauthorizationError("Spotify callback state did not match.");
  }

  const oauthError = url.searchParams.get("error");
  if (oauthError) {
    throw new ReauthorizationError("Spotify authorization was denied.");
  }

  const code = url.searchParams.get("code");
  if (!code) {
    throw new ReauthorizationError(
      "Spotify callback did not include an authorization code.",
    );
  }

  return code;
}

export async function exchangeAuthorizationCode({
  clientId,
  clientSecret,
  code,
  fetchImpl = fetch,
}) {
  let response;

  try {
    response = await fetchImpl("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });
  } catch {
    throw new ReauthorizationError("Could not reach Spotify's token service.");
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ReauthorizationError(
      "Spotify's token service returned an unreadable response.",
    );
  }

  if (!response.ok) {
    throw new ReauthorizationError(
      `Spotify token exchange failed with status ${response.status}.`,
    );
  }

  if (
    typeof payload.access_token !== "string" ||
    typeof payload.refresh_token !== "string"
  ) {
    throw new ReauthorizationError(
      "Spotify's token response did not include the required tokens.",
    );
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
  };
}

export async function validateSpotifyAccessToken({
  accessToken,
  fetchImpl = fetch,
}) {
  let response;

  try {
    response = await fetchImpl(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
  } catch {
    throw new ReauthorizationError(
      "Could not validate the new Spotify authorization.",
    );
  }

  if (!response.ok) {
    throw new ReauthorizationError(
      `Spotify authorization validation failed with status ${response.status}.`,
    );
  }
}

export function replaceEnvVariable(contents, key, value) {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^${escapedKey}=.*$`, "m");

  if (!pattern.test(contents)) {
    throw new ReauthorizationError(`${key} is missing from .env.`);
  }

  return contents.replace(pattern, `${key}=${value}`);
}

export async function updateLocalEnv({
  envPath = resolve(".env"),
  refreshToken,
}) {
  const fileInfo = await stat(envPath);
  const currentContents = await readFile(envPath, "utf8");
  const updatedContents = replaceEnvVariable(
    currentContents,
    "SPOTIFY_REFRESH_TOKEN",
    refreshToken,
  );
  const temporaryPath = `${envPath}.${process.pid}.${randomUUID()}.tmp`;

  try {
    await writeFile(temporaryPath, updatedContents, {
      encoding: "utf8",
      mode: fileInfo.mode & 0o777,
    });
    await rename(temporaryPath, envPath);
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

function htmlPage(title, message) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><main><h1>${title}</h1><p>${message}</p></main></body></html>`;
}

export async function createCallbackListener({
  expectedState,
  host = CALLBACK_HOST,
  port = CALLBACK_PORT,
  timeoutMs = CALLBACK_TIMEOUT_MS,
  serverFactory = createServer,
}) {
  let callbackResolve;
  let callbackReject;
  let pendingResponse;
  let settled = false;
  let closed = false;

  const callback = new Promise((resolveCallback, rejectCallback) => {
    callbackResolve = resolveCallback;
    callbackReject = rejectCallback;
  });

  const server = serverFactory((request, response) => {
    const requestUrl = request.url ?? "/";
    const pathname = new URL(requestUrl, REDIRECT_URI).pathname;

    if (pathname !== CALLBACK_PATH) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (settled) {
      response.writeHead(409, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Callback already received");
      return;
    }

    settled = true;

    try {
      const code = parseAuthorizationCallback(requestUrl, expectedState);
      pendingResponse = response;
      callbackResolve(code);
    } catch (error) {
      response.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      response.end(
        htmlPage(
          "Spotify authorization failed",
          "Return to the terminal for details.",
        ),
      );
      callbackReject(error);
    }
  });

  await new Promise((resolveListen, rejectListen) => {
    server.once("error", rejectListen);
    server.listen(port, host, () => {
      server.off("error", rejectListen);
      resolveListen();
    });
  });

  const timer = setTimeout(() => {
    if (settled) return;
    settled = true;
    callbackReject(
      new ReauthorizationError(
        "Spotify authorization timed out. Run the command again.",
      ),
    );
  }, timeoutMs);

  function respond(status, title, message) {
    if (!pendingResponse || pendingResponse.writableEnded) return;
    pendingResponse.writeHead(status, {
      "Content-Type": "text/html; charset=utf-8",
    });
    pendingResponse.end(htmlPage(title, message));
  }

  async function close() {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    respond(
      500,
      "Spotify authorization stopped",
      "Return to the terminal for details.",
    );

    if (!server.listening) return;
    await new Promise((resolveClose) => server.close(resolveClose));
  }

  function cancel() {
    if (!settled) {
      settled = true;
      callbackReject(
        new ReauthorizationError("Spotify authorization stopped."),
      );
    }
  }

  return {
    callback,
    cancel,
    close,
    port: server.address().port,
    respondFailure() {
      respond(
        500,
        "Spotify authorization failed",
        "Return to the terminal for details.",
      );
    },
    respondSuccess() {
      respond(
        200,
        "Spotify authorization complete",
        "You can close this window and return to the terminal.",
      );
    },
  };
}

export async function openBrowser(url, spawnImpl = spawn) {
  if (process.platform !== "darwin") return false;

  return new Promise((resolveOpen) => {
    const child = spawnImpl("open", [url], {
      detached: true,
      stdio: "ignore",
      shell: false,
    });

    child.once("error", () => resolveOpen(false));
    child.once("spawn", () => {
      child.unref();
      resolveOpen(true);
    });
  });
}

export function installSignalCleanup(cancel, processRef = process) {
  const handler = () => cancel();
  processRef.once("SIGINT", handler);
  processRef.once("SIGTERM", handler);

  return () => {
    processRef.off("SIGINT", handler);
    processRef.off("SIGTERM", handler);
  };
}

export async function runReauthorization({
  environment = process.env,
  logger = console,
  envPath = resolve(".env"),
  dependencies = {},
} = {}) {
  const configuration = getSpotifyConfiguration(environment);
  const state = (
    dependencies.randomState ?? (() => randomBytes(32).toString("hex"))
  )();
  const listener = await (
    dependencies.createCallbackListener ?? createCallbackListener
  )({ expectedState: state });
  const removeSignalHandlers = installSignalCleanup(listener.cancel);
  const authorizationUrl = buildAuthorizationUrl({
    clientId: configuration.clientId,
    state,
  });

  logger.log("Authorize Spotify using this URL:");
  logger.log(authorizationUrl);

  const didOpen = await (dependencies.openBrowser ?? openBrowser)(
    authorizationUrl,
  );
  if (!didOpen) {
    logger.log("Open the authorization URL above in your browser.");
  }

  try {
    const code = await listener.callback;
    const tokens = await (
      dependencies.exchangeAuthorizationCode ?? exchangeAuthorizationCode
    )({
      ...configuration,
      code,
    });

    await (
      dependencies.validateSpotifyAccessToken ?? validateSpotifyAccessToken
    )({ accessToken: tokens.accessToken });
    await (dependencies.updateLocalEnv ?? updateLocalEnv)({
      envPath,
      refreshToken: tokens.refreshToken,
    });

    listener.respondSuccess();
    logger.log("Spotify authorization succeeded and .env was updated.");
    logger.log(`SPOTIFY_REFRESH_TOKEN=${tokens.refreshToken}`);
    logger.log(
      "Update SPOTIFY_REFRESH_TOKEN in Vercel with the value above, then redeploy.",
    );
  } catch (error) {
    listener.respondFailure();
    throw error;
  } finally {
    removeSignalHandlers();
    await listener.close();
  }
}

const isMain =
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).toString();

if (isMain) {
  runReauthorization().catch((error) => {
    const message =
      error instanceof Error ? error.message : "Unknown authorization error.";
    console.error(`Spotify reauthorization failed: ${message}`);
    process.exitCode = 1;
  });
}
