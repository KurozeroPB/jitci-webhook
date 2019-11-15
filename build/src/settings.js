"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
exports.default = {
    version: package_json_1.default.version,
    env: process.env.NODE_ENV || "development",
    avatar: "https://b.catgirlsare.sexy/Df0F.png",
    colors: {
        pass: 0x5cb85c,
        fail: 0xd9534f
    }
};
