import { createServer } from "node:http";
import { request } from "node:https";

const apiUrl = process.env.API_URL;
const apiKey = process.env.API_KEY;
const apiModel = process.env.API_MODEL;
const completionOptions = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + apiKey,
  },
};


createServer(async (req, res, next) => {
  if (!(req.method === "POST" && req.url === "/run")) {
    next();
  }

  try {
    const messages = JSON.parse(await readBody(request));
    const remote = request(apiUrl, completionOptions);
    const body = JSON.stringify({
      model: apiModel,
      messages,
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
}).listen(Number(process.env.PORT));

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
