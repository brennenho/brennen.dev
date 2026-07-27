import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  buildAuthorizationUrl,
  createCallbackListener,
  exchangeAuthorizationCode,
  parseAuthorizationCallback,
  REDIRECT_URI,
  replaceEnvVariable,
  runReauthorization,
  SPOTIFY_SCOPES,
  updateLocalEnv,
  validateSpotifyAccessToken,
} from "./spotify-reauthorize.mjs";

const temporaryDirectories = [];

async function makeTemporaryEnv(contents) {
  const directory = await mkdtemp(join(tmpdir(), "spotify-reauthorize-"));
  temporaryDirectories.push(directory);
  const envPath = join(directory, ".env");
  await writeFile(envPath, contents, { mode: 0o640 });
  return envPath;
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function fakeListener(callback = Promise.resolve("test-code")) {
  return {
    callback,
    cancel: vi.fn(),
    close: vi.fn().mockResolvedValue(undefined),
    respondFailure: vi.fn(),
    respondSuccess: vi.fn(),
  };
}

class FakeHttpServer extends EventEmitter {
  constructor(handler) {
    super();
    this.handler = handler;
    this.listening = false;
    this.port = 4321;
  }

  address() {
    return { port: this.port };
  }

  close(callback) {
    this.listening = false;
    callback();
  }

  listen(port, _host, callback) {
    this.listening = true;
    this.port = port === 0 ? 4321 : port;
    callback();
  }

  request(url) {
    const response = {
      body: "",
      status: 0,
      writableEnded: false,
      end: (body = "") => {
        response.body = body;
        response.writableEnded = true;
      },
      writeHead: (status) => {
        response.status = status;
      },
    };

    this.handler({ url }, response);
    return response;
  }
}

function fakeServerFactory() {
  let server;

  return {
    create(handler) {
      server = new FakeHttpServer(handler);
      return server;
    },
    get server() {
      return server;
    },
  };
}

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(
    temporaryDirectories.splice(0).map(async (directory) => {
      await rm(directory, { recursive: true, force: true });
    }),
  );
});

describe("Spotify authorization URL", () => {
  it("contains the exact redirect, scopes, state, and no client secret", () => {
    const authorizationUrl = buildAuthorizationUrl({
      clientId: "test-client-id",
      state: "test-state",
    });
    const url = new URL(authorizationUrl);

    expect(url.origin + url.pathname).toBe(
      "https://accounts.spotify.com/authorize",
    );
    expect(url.searchParams.get("client_id")).toBe("test-client-id");
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT_URI);
    expect(url.searchParams.get("scope")).toBe(SPOTIFY_SCOPES.join(" "));
    expect(url.searchParams.get("state")).toBe("test-state");
    expect(url.searchParams.get("show_dialog")).toBe("true");
    expect(authorizationUrl).not.toContain("test-client-secret");
  });

  it("accepts the code while ignoring unrelated callback parameters", () => {
    expect(
      parseAuthorizationCallback(
        "/callback?code=test-code&state=test-state&ubi=ignored",
        "test-state",
      ),
    ).toBe("test-code");
  });

  it("rejects a state mismatch and OAuth denial", () => {
    expect(() =>
      parseAuthorizationCallback(
        "/callback?code=test-code&state=wrong-state",
        "test-state",
      ),
    ).toThrow("state did not match");
    expect(() =>
      parseAuthorizationCallback(
        "/callback?error=access_denied&state=test-state",
        "test-state",
      ),
    ).toThrow("authorization was denied");
  });
});

describe("Spotify token exchange", () => {
  it("returns tokens from a valid response", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        access_token: "test-access-token",
        refresh_token: "test-refresh-token",
      }),
    );

    await expect(
      exchangeAuthorizationCode({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        code: "test-code",
        fetchImpl,
      }),
    ).resolves.toEqual({
      accessToken: "test-access-token",
      refreshToken: "test-refresh-token",
    });
  });

  it("fails safely for invalid_grant and malformed success responses", async () => {
    const invalidGrantFetch = vi
      .fn()
      .mockResolvedValue(
        jsonResponse(
          { error: "invalid_grant", error_description: "sensitive detail" },
          400,
        ),
      );

    await expect(
      exchangeAuthorizationCode({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        code: "test-code",
        fetchImpl: invalidGrantFetch,
      }),
    ).rejects.toThrow("status 400");

    const malformedFetch = vi
      .fn()
      .mockResolvedValue(jsonResponse({ access_token: "only-one-token" }));
    await expect(
      exchangeAuthorizationCode({
        clientId: "test-client-id",
        clientSecret: "test-client-secret",
        code: "test-code",
        fetchImpl: malformedFetch,
      }),
    ).rejects.toThrow("required tokens");
  });

  it("validates the access token using recently played", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response("", { status: 200 }));

    await validateSpotifyAccessToken({
      accessToken: "test-access-token",
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.spotify.com/v1/me/player/recently-played?limit=1",
      { headers: { Authorization: "Bearer test-access-token" } },
    );
  });
});

describe("local environment persistence", () => {
  it("replaces only the requested environment value", () => {
    const original = [
      "SPOTIFY_CLIENT_ID=test-client-id",
      "SPOTIFY_REFRESH_TOKEN=old-token",
      "UNRELATED=value",
      "",
    ].join("\n");

    expect(
      replaceEnvVariable(original, "SPOTIFY_REFRESH_TOKEN", "new-token"),
    ).toBe(
      [
        "SPOTIFY_CLIENT_ID=test-client-id",
        "SPOTIFY_REFRESH_TOKEN=new-token",
        "UNRELATED=value",
        "",
      ].join("\n"),
    );
  });

  it("atomically updates .env while preserving unrelated content and mode", async () => {
    const envPath = await makeTemporaryEnv(
      "SPOTIFY_REFRESH_TOKEN=old-token\nUNRELATED=value\n",
    );

    await updateLocalEnv({ envPath, refreshToken: "new-token" });

    await expect(readFile(envPath, "utf8")).resolves.toBe(
      "SPOTIFY_REFRESH_TOKEN=new-token\nUNRELATED=value\n",
    );
    expect((await stat(envPath)).mode & 0o777).toBe(0o640);
  });
});

describe("reauthorization orchestration", () => {
  it("validates before persisting and prints the refresh token once", async () => {
    const events = [];
    const logs = [];
    const listener = fakeListener();

    await runReauthorization({
      environment: {
        SPOTIFY_CLIENT_ID: "test-client-id",
        SPOTIFY_CLIENT_SECRET: "test-client-secret",
      },
      logger: { log: (message) => logs.push(message) },
      dependencies: {
        randomState: () => "test-state",
        createCallbackListener: vi.fn().mockResolvedValue(listener),
        openBrowser: vi.fn().mockResolvedValue(true),
        exchangeAuthorizationCode: vi.fn().mockResolvedValue({
          accessToken: "test-access-token",
          refreshToken: "test-refresh-token",
        }),
        validateSpotifyAccessToken: vi.fn().mockImplementation(async () => {
          events.push("validate");
        }),
        updateLocalEnv: vi.fn().mockImplementation(async () => {
          events.push("persist");
        }),
      },
    });

    expect(events).toEqual(["validate", "persist"]);
    expect(logs.filter((line) => line.includes("test-refresh-token"))).toEqual([
      "SPOTIFY_REFRESH_TOKEN=test-refresh-token",
    ]);
    expect(logs.join("\n")).not.toContain("test-access-token");
    expect(logs.join("\n")).not.toContain("test-client-secret");
    expect(logs.join("\n")).not.toContain("test-code");
    expect(listener.respondSuccess).toHaveBeenCalledOnce();
    expect(listener.close).toHaveBeenCalledOnce();
  });

  it("leaves .env unchanged when validation fails", async () => {
    const envPath = await makeTemporaryEnv(
      "SPOTIFY_REFRESH_TOKEN=old-token\nUNRELATED=value\n",
    );
    const listener = fakeListener();

    await expect(
      runReauthorization({
        envPath,
        environment: {
          SPOTIFY_CLIENT_ID: "test-client-id",
          SPOTIFY_CLIENT_SECRET: "test-client-secret",
        },
        logger: { log: vi.fn() },
        dependencies: {
          randomState: () => "test-state",
          createCallbackListener: vi.fn().mockResolvedValue(listener),
          openBrowser: vi.fn().mockResolvedValue(true),
          exchangeAuthorizationCode: vi.fn().mockResolvedValue({
            accessToken: "test-access-token",
            refreshToken: "new-refresh-token",
          }),
          validateSpotifyAccessToken: vi
            .fn()
            .mockRejectedValue(new Error("validation failed")),
        },
      }),
    ).rejects.toThrow("validation failed");

    await expect(readFile(envPath, "utf8")).resolves.toBe(
      "SPOTIFY_REFRESH_TOKEN=old-token\nUNRELATED=value\n",
    );
    expect(listener.respondFailure).toHaveBeenCalledOnce();
    expect(listener.close).toHaveBeenCalledOnce();
  });
});

describe("callback listener cleanup", () => {
  it("closes after a successful callback", async () => {
    const serverFactory = fakeServerFactory();
    const listener = await createCallbackListener({
      expectedState: "test-state",
      port: 0,
      timeoutMs: 1000,
      serverFactory: (handler) => serverFactory.create(handler),
    });
    const response = serverFactory.server.request(
      "/callback?code=test-code&state=test-state",
    );

    await expect(listener.callback).resolves.toBe("test-code");
    listener.respondSuccess();
    expect(response.status).toBe(200);
    expect(response.writableEnded).toBe(true);
    await listener.close();
    expect(serverFactory.server.listening).toBe(false);
    await expect(listener.close()).resolves.toBeUndefined();
  });

  it("closes after denial, timeout, and interruption", async () => {
    const deniedServerFactory = fakeServerFactory();
    const denied = await createCallbackListener({
      expectedState: "test-state",
      port: 0,
      timeoutMs: 1000,
      serverFactory: (handler) => deniedServerFactory.create(handler),
    });
    const denialResponse = deniedServerFactory.server.request(
      "/callback?error=access_denied&state=test-state",
    );
    await expect(denied.callback).rejects.toThrow("authorization was denied");
    expect(denialResponse.status).toBe(400);
    await denied.close();
    expect(deniedServerFactory.server.listening).toBe(false);

    const timeoutServerFactory = fakeServerFactory();
    const timedOut = await createCallbackListener({
      expectedState: "test-state",
      port: 0,
      timeoutMs: 10,
      serverFactory: (handler) => timeoutServerFactory.create(handler),
    });
    await expect(timedOut.callback).rejects.toThrow("timed out");
    await timedOut.close();
    expect(timeoutServerFactory.server.listening).toBe(false);

    const interruptedServerFactory = fakeServerFactory();
    const interrupted = await createCallbackListener({
      expectedState: "test-state",
      port: 0,
      timeoutMs: 1000,
      serverFactory: (handler) => interruptedServerFactory.create(handler),
    });
    interrupted.cancel();
    await expect(interrupted.callback).rejects.toThrow("stopped");
    await interrupted.close();
    expect(interruptedServerFactory.server.listening).toBe(false);
  });
});
