"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const settings_1 = __importDefault(require("./settings"));
const axios_1 = __importDefault(require("axios"));
const eris_1 = require("eris");
const server = express_1.default();
const port = process.env.PORT || 8080;
const client = new eris_1.Client("");
async function getHashDetails(hash) {
    const response = await axios_1.default.get(`https://api.github.com/search/commits?q=hash:${hash}`, {
        headers: {
            "Accept": "application/vnd.github.cloak-preview"
        }
    });
    return response.data.items.length >= 1 ? response.data.items[0] : void 0;
}
server.enable("trust proxy");
server.disable("x-powered-by");
server.set("json spaces", 4);
server.set("env", settings_1.default.env);
server.use(express_1.default.json());
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
    const body = req.body;
    try {
        const details = await getHashDetails(body.commit);
        if (!details)
            return res.status(500).json({
                statusCode: 500,
                statusMessage: "Internal Server Error",
                message: "Oops, something bad happened"
            });
        await client.executeWebhook(webhookId, webhookToken, {
            avatarURL: settings_1.default.avatar,
            embeds: [
                {
                    author: {
                        name: details.committer.login,
                        url: details.committer.html_url,
                        icon_url: details.committer.avatar_url
                    },
                    title: `[#${body.buildNr}] ${body.state === "pass" ? "passed" : "failed"} `,
                    url: body.buildUrl,
                    color: body.state === "pass" ? settings_1.default.colors.pass : settings_1.default.colors.fail,
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
    }
    catch (error) {
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
