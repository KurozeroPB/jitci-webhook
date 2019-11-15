"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_1 = __importDefault(require("./settings"));
const discord_js_1 = require("discord.js");
const server = express_1.default();
const port = process.env.PORT || 8080;
async function main() {
    server.enable("trust proxy");
    server.disable("x-powered-by");
    server.set("json spaces", 4);
    server.set("env", settings_1.default.env);
    server.use(express_1.default.json());
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
        const client = new discord_js_1.WebhookClient(webhookId, webhookToken);
        const body = req.body;
        client.send({
            avatarURL: settings_1.default.avatar,
            embeds: [
                {
                    url: body.buildUrl,
                    color: body.state === "pass" ? settings_1.default.colors.pass : settings_1.default.colors.fail,
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
