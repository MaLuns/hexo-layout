const fs = require("fs");
const path = require("path");

if (process.env.RELEASE_VERSION) {
  const version = process.env.RELEASE_VERSION.split("/").reverse()[0];
  console.log("当前版本：", version);
  const pkg = require("../package.json");
  pkg.version = version.replace("v", "");
  fs.writeFileSync(path.resolve(__dirname, "../package.json"), JSON.stringify(pkg, null, 4), "utf-8");
}
