import express from "express";
import settings from "./settings"
import axios from "axios";
import { WebhookClient } from "discord.js";
import { JitCIBody } from "./JitCIBody";
import { HashDetails, HashItem } from "./HashDetails";

const server = express();
const port = process.env.PORT || 8080;

async function getHashDetails(hash: string): Promise<HashItem | undefined> {
    const response = await axios.get<HashDetails>(`https://api.github.com/search/commits?q=hash:${hash}`, {
        headers: {
            "Accept": "application/vnd.github.cloak-preview"
        }
    });
    return response.data.items.length >= 1 ? response.data.items[0] : void 0;
}

async function main(): Promise<void> {
    server.enable("trust proxy");
    server.disable("x-powered-by");

    server.set("json spaces", 4);
    server.set("env", settings.env);

    server.use(express.json());

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

        const client = new WebhookClient(webhookId, webhookToken);
        const body = req.body as JitCIBody
        try {
            const details = await getHashDetails(body.commit);
            await client.send({
                avatarURL: settings.avatar,
                embeds: [
                    {
                        author: {
                            name: details?.committer?.login,
                            url: details?.committer?.html_url,
                            icon_url: details?.committer?.avatar_url
                        },
                        url: body.buildUrl,
                        color: body.state === "pass" ? settings.colors.pass : settings.colors.fail,
                        description: `Build: \`${body.state}\`\n` +
                            `Nr: \`${body.buildNr}\`\n` +
                            `Commit: \`[${body.commit.substring(0, 6)}](${details?.commit.url})\`\n` +
                            `Branch: \`${body.branch}\``
                    }
                ]
            });
            res.sendStatus(200);
        } catch(error) {
            res.status(500).json({
                statusCode: 500,
                statusMessage: "Internal Server Error",
                message: error.message || "Oops, something bad happened"
            });
        }
    });

    server.listen(port, () => {
        console.log(`Starting http server on port ${port}`);
    });
}

main().catch(console.error);
