const Layout = require("./libs/layout");

hexo.on("generateBefore", () => {
  Layout(hexo);
});
