import express from "express";
import settings from "./settings"
import { WebhookClient } from "discord.js";
import { IBody } from "./IBody";

const server = express();
const port = process.env.PORT || 8080;

async function main(): Promise<void> {
    server.enable("trust proxy");
    server.disable("x-powered-by");

    server.set("json spaces", 4);
    server.set("env", settings.env);

    server.use(express.json());

    server.post("/:id/:token", (req, res) => {
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
        const body = req.body as IBody
        client.send({
            avatarURL: settings.avatar,
            embeds: [
                {
                    url: body.buildUrl,
                    color: body.state === "pass" ? settings.colors.pass : settings.colors.fail,
                    description: `Build: \`${body.state}\`\n` +
                        `Nr: \`${body.buildNr}\`\n` +
                        `Commit: \`${body.commit}\`\n` +
                        `Branch: \`${body.branch}\``
                }
            ]
        }).then(() => {
            res.sendStatus(200);
        }).catch((error) => {
            res.status(500).json({
                statusCode: 500,
                statusMessage: "Internal Server Error",
                message: error.message || "Oops, something bad happened"
            });
        });
    });

    server.listen(port, () => {
        console.log(`Starting http server on port ${port}`);
    });
}

main().catch(console.error);
