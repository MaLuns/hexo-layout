const { red, yellow } = require("picocolors");

module.exports = (hexo) => {
  const { alias } = hexo.extend.console;
  if (alias[hexo.env.cmd] === "server" && hexo.env.args.showlayout) {
    const { theme } = hexo;

    for (const viewName in theme.views) {
      hexo.log.info(red("Current theme layout: %s"), yellow(viewName));
      const views = theme.views[viewName];
      for (const key in views) {
        const view = views[key];
        view.data._content = `<!--${viewName} [START] -->${view.data._content.replace(/<!--.*-->/g, "")}<!--${viewName} [END] -->`;
        view._precompile();
      }
    }
  }
};
