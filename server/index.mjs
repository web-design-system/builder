import { request as https } from "node:https";
import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";

const storagePath = resolve(process.env.STORAGE_PATH);
const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;
const apiModel = process.env.API_MODEL;
const systemMessage = process.env.API_SYSTEM_MESSAGE;
const completionOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
  },
};

export default async (req, res, next) => {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "POST" && url.pathname === "/run") {
    return onRun(req, res);
  }

  if (req.method === "POST" && url.pathname === "/components") {
    return onSave(req, res, url);
  }

  if (req.method === "GET" && url.pathname === "/components") {
    return onLoad(req, res, url);
  }

  next();
};

async function onRun(req, res) {
  try {
    const { history, code, instruction } = JSON.parse(await readStream(req));
    const remote = https(apiUrl, completionOptions);
    const body = JSON.stringify({
      model: apiModel,
      messages: [
        systemMessage && { role: "system", content: systemMessage },
        ...history.map((m) => ({ role: "user", content: m })),
        { role: "assistant", content: code },
        { role: "user", content: instruction },
      ].filter(Boolean),
    });

    remote.on("response", async (incoming) => {
      const body = await readStream(incoming);
      const answer = JSON.parse(body).choices[0]?.message.content ?? "";
      res.end(answer);
    });

    remote.write(body);
    remote.end();
  } catch (error) {
    console.log(error);
    res.writeHead(500);
    res.end();
  }
}

async function onSave(req, res, url) {
  const body = await readStream(req);
  const fileId = url.searchParams.get("id");

  if (!fileId) {
    res.writeHead(400);
    res.end("Missing parameter: /component?id=?");
    return;
  }

  const path = join(storagePath, fileId);
  await ensureFolder(dirname(path));
  writeFile(path, body);
}

async function onLoad(_req, res, url) {
  const fileId = url.searchParams.get("id");

  if (!fileId) {
    res.writeHead(400);
    res.end("Missing parameter: /component?id=?");
    return;
  }

  const path = join(storagePath, fileId);
  await ensureFolder(dirname(path));

  if (!existsSync(path)) {
    res.writeHead(404);
    res.end();
    return;
  }

  const body = await readFile(path, "utf-8");
  res.writeHead(200, { "content-length": body.length });
  res.end(body);
}

function readStream(stream) {
  return new Promise((resolve) => {
    const a = [];
    stream.on("data", (c) => a.push(c));
    stream.on("end", () => {
      const buffer = Buffer.concat(a).toString("utf-8");
      resolve(buffer);
    });
  });
}

async function ensureFolder(folder) {
  return existsSync(folder) || (await mkdir(folder, { recursive: true }));
}
