const { red, yellow } = require("picocolors");

module.exports = (hexo) => {
  const { alias } = hexo.extend.console;
  if (alias[hexo.env.cmd] === "server" && hexo.env.args.showlayout) {
    const { theme } = hexo;

    for (const key in theme.views) {
      hexo.log.info(red("Current theme layout: %s"), yellow(key));
      const views = theme.views[key];
      for (const key in views) {
        const view = views[key];
        view.data._content = `<!--${key} START -->${view.data._content.replace(/<!--.*-->/g, "")}<!--${key} END -->`;
        view._precompile();
      }
    }
  }
};
