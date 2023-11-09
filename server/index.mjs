import { request as https } from "node:https";

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
  if (!(req.method === "POST" && req.url === "/run")) {
    return next();
  }

  try {
    const messages = JSON.parse(await readBody(req));
    const remote = https(apiUrl, completionOptions);
    const body = JSON.stringify({
      model: apiModel,
      messages: [
        systemMessage && { role: "system", message: systemMessage },
        ...messages,
      ].filter(Boolean),
    });

    remote.on("response", async (incoming) => {
      const body = JSON.parse(await readBody(incoming));
      const answer = body.choices[0].message.content;
      res.end(answer);
    });

    remote.write(body);
    remote.end();
  } catch (error) {
    console.log(error);
    res.writeHead(500);
    res.end();
  }
};

function readBody(stream) {
  return new Promise((resolve) => {
    const a = [];
    stream.on("data", (c) => a.push(c));
    stream.on("end", () => {
      const buffer = Buffer.concat(a).toString("utf-8");
      resolve(buffer);
    });
  });
}
