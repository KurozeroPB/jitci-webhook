import express from "express";
import settings from "./settings"
import axios from "axios";
import { Client } from "eris";
import { JitCIBody } from "./JitCIBody";
import { HashDetails, HashItem } from "./HashDetails";

const server = express();
const port = process.env.PORT || 8080;
const client = new Client("");

async function getHashDetails(hash: string): Promise<HashItem | undefined> {
    const response = await axios.get<HashDetails>(`https://api.github.com/search/commits?q=hash:${hash}`, {
        headers: {
            "Accept": "application/vnd.github.cloak-preview"
        }
    });
    return response.data.items.length >= 1 ? response.data.items[0] : void 0;
}

server.enable("trust proxy");
server.disable("x-powered-by");

server.set("json spaces", 4);
server.set("env", settings.env);

server.use(express.json());

server.get("/", (_, res) => {
    res.status(200).json({
        statusCode: 200,
        statusMessage: "OK",
        message: "Welcome, this is an application to show JitCI's results in a discord webhook message. To use this add https://jitci.herokuapp.com/<discord-webhook-id>/<discord-webhook-token> to the JitCI settings."
    });
});

server.post("/:id/:token", async (req, res) => {
    const webhookId = req.params.id;
    const webhookToken = req.params.token;
    if (!webhookId || !webhookToken) {
        return res.status(400).json({
            statusCode: 400,
            statusMessage: "Bad Request",
            message: "Missing or invalid webhookId/webhookToken"
        });
    }

    const body = req.body as JitCIBody
    try {
        const details = await getHashDetails(body.commit);
        if (!details) return res.status(500).json({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: "Oops, something bad happened"
        });
        await client.executeWebhook(webhookId, webhookToken, {
            avatarURL: settings.avatar,
            embeds: [
                {
                    author: {
                        name: details.committer.login,
                        url: details.committer.html_url,
                        icon_url: details.committer.avatar_url
                    },
                    title: `[#${body.buildNr}] ${body.state === "pass" ? "passed" : "failed"} `,
                    url: body.buildUrl,
                    color: body.state === "pass" ? settings.colors.pass : settings.colors.fail,
                    fields: [
                        {
                            name: "Commit",
                            value: `[${body.commit.substring(0, 6)}](${details.commit.url})`,
                            inline: true
                        },
                        {
                            name: "Branch",
                            value: `[${body.branch}](${details.repository.html_url}/tree/${body.branch})`,
                            inline: true
                        }
                    ]
                }
            ]
        });
        res.sendStatus(200);
    } catch (error) {
        res.status(500).json({
            statusCode: 500,
            statusMessage: "Internal Server Error",
            message: error.message || "Oops, something bad happened"
        });
    }
});

server.get("*", (_, res) => {
    res.status(404).json({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "The page you are looking for does not exist"
    });
});

server.listen(port, () => {
    console.log(`Starting http server on port ${port}`);
});
