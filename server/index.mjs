import { request as https } from "node:https";
import { writeFile, readFile, mkdir } from "node:fs/promises";
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
  const [action, ...args] = url.pathname.slice(1).split("/");
  const route = `${req.method} ${action}`;
  const event = { req, res, url, args };

  switch (route) {
    case "POST run":
      return onRun(event);
    case "POST publish":
      return onPublish(event);
    case "POST components":
      return onSave(event);
    case "GET components":
      return onLoad(event);
    default:
      next();
  }
};

async function onRun({ req, res }) {
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

async function onPublish({ args, res }) {
  const id = args[0];

  if (!id) {
    badRequest('/publish/:id');
    return;
  }

  const sourcePath = join(storagePath, id);
  if (!existsSync(sourcePath)) {
    notFound(res);
    return;
  }

  const json = JSON.parse(await readFile(path, "utf-8"));
  const targetPath = join(storagePath, id + '.html');

  await writeFile(targetPath, json.snippet);
  res.end('OK');
}

async function onSave({ req, res, args }) {
  const body = await readStream(req);
  const fileId = args[0];

  if (!fileId) {
    badRequest('/component/:id');
    return;
  }

  const path = join(storagePath, fileId);
  await ensureFolder(dirname(path));
  await writeFile(path, body);
  res.writeHead(202);
  res.end();
}

async function onLoad({ res, args }) {
  const fileId = args[0];

  if (!fileId) {
    badRequest('/component/:id');
    return;
  }

  const path = join(storagePath, fileId);
  await ensureFolder(dirname(path));

  if (!existsSync(path)) {
    notFound(res);
    return;
  }

  const body = await readFile(path, "utf-8");
  res.writeHead(200, {
    "content-type": "application/json",
    "content-length": body.length,
  });
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

function notFound(res) {
  res.writeHead(404);
  res.end('Not found');
}

function badRequest(path) {
  res.writeHead(400);
  res.end(`Missing parameter: ${path}`);
}