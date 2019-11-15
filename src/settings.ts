import pkg from "../package.json"

export default {
    version: pkg.version,
    env: process.env.NODE_ENV || "development",
    avatar: "https://b.catgirlsare.sexy/Df0F.png",
    colors: {
        pass: 0x5cb85c,
        fail: 0xd9534f
    }
};
