const Layout = require("./libs/layout");
const showLayout = require("./libs/show-layout");

hexo.on("generateBefore", () => {
  showLayout(hexo);
  Layout(hexo);
});
