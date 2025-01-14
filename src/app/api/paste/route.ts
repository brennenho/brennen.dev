import hljs from "highlight.js";
import { customAlphabet } from "nanoid";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { savePasteText } from "~/server/queries";

const PasteSchema = z.object({
  text: z.string(),
});

type Extensions = Record<string, string>;

export const extensions: Extensions = {
  javascript: "js",
  typescript: "ts",
  java: "java",
  c: "c",
  cpp: "cpp",
  csharp: "cs",
  php: "php",
  python: "py",
  ruby: "rb",
  go: "go",
  rust: "rs",
  html: "html",
  xml: "xml",
  css: "css",
  scss: "scss",
  json: "json",
  yaml: "yml",
  bash: "sh",
  shell: "sh",
  diff: "diff",
  sql: "sql",
  powershell: "ps1",
  perl: "pl",
  scala: "scala",
  kotlin: "kt",
  swift: "swift",
  r: "r",
  objectivec: "m",
  vbnet: "vb",
  lua: "lua",
  dart: "dart",
  graphql: "graphql",
  dockerfile: "dockerfile",
};

export const generateId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  10,
);

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as z.infer<typeof PasteSchema>;
    const result = PasteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { text } = result.data;
    const { language } = hljs.highlightAuto(text);
    const fileName = `${generateId()}.${(language && extensions[language]) ?? "txt"}`;

    await savePasteText(fileName, text, new Date(Date.now() + 1000 * 60));

    return NextResponse.json(
      { success: true, fileName: fileName },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error saving paste:", error);
    return NextResponse.json(
      { success: false, error: "Unable to save paste text" },
      { status: 500 },
    );
  }
}
