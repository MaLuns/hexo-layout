const { resolve, extname } = require("path");
const { statSync, readdirSync, readFileSync, watch, existsSync } = require("hexo-fs");
const { magenta } = require("picocolors");

const escapeBackslash = (path) => {
  // Replace backslashes on Windows
  return path.replace(/\\/g, "/");
};

class Layout {
  watcher = null;
  viewMap = new Map();
  config = {
    path: "layout",
    prefix: "_hexo_layout_",
    custom: {},
  };

  constructor(hexo) {
    this.hexo = hexo;

    this.config = {
      ...this.config,
      ...(hexo.config.layout || {}),
    };

    const layout_dir = (this.layout_dir = escapeBackslash(resolve(hexo.base_dir, this.config.path)));

    if (!existsSync(layout_dir)) return;

    const isDir = statSync(layout_dir).isDirectory();

    if (isDir) {
      this.initViewMap();
      this.loadDir(layout_dir);

      const { alias } = hexo.extend.console;

      if (alias[hexo.env.cmd] === "server") {
        this.watch();
        hexo.log.debug("Watch layou path: %s", magenta(layout_dir));
      }
    }
  }

  /**
   * init the view map
   */
  initViewMap() {
    const custom = this.config.custom;
    for (const key in custom) {
      if (Object.hasOwnProperty.call(custom, key)) {
        const val = custom[key];
        this.viewMap.set(key, val);
        this.viewMap.set(val, key);
      }
    }
  }

  isWatching() {
    return Boolean(this.watcher);
  }

  /**
   * unwatch view folder
   */
  unwatch() {
    if (!this.isWatching()) return;

    this.watcher.close();
    this.watcher = null;
  }

  /**
   * watch view folder
   */
  watch() {
    if (this.isWatching()) {
      return this.hexo.log.warn("Watcher has already started.");
    }

    watch(this.layout_dir, {
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 200,
      },
    }).then((watcher) => {
      this.watcher = watcher;

      watcher.on("add", (path) => this.setView(escapeBackslash(path)));
      watcher.on("change", (path) => this.setView(escapeBackslash(path)));
      watcher.on("unlink", (path) => this.removeView(escapeBackslash(path)));
      watcher.on("addDir", (path) => this.loadDir(escapeBackslash(path)));
    });
  }

  /**
   * Replace the new view and return the original view
   * @param {string} path
   * @param {View} view
   * @returns
   */
  setOriView(path, view) {
    // Replace backslashes on Windows
    path = path.replace(/\\/g, "/");

    const ext = extname(path);
    const name = path.substring(0, path.length - ext.length);
    const views = this.hexo.theme.views[name];

    if (!views) return;

    if (ext) {
      const oriView = views[ext];
      views[ext] = view;
      return oriView;
    } else {
      const oriView = views[Object.keys(views)[0]];
      views[Object.keys(views)[0]] = view;
      return oriView;
    }
  }

  /**
   * Set the mapping between old and new views
   * @param {string} fullpath
   */
  setView(fullpath) {
    const path = fullpath.replace(this.layout_dir, "");
    const prefixPath = this.config.prefix + path;

    const oriViewName = this.viewMap.get(path);
    const viewName = oriViewName ? `_/${oriViewName}` : prefixPath;

    const viewText = readFileSync(fullpath, { encoding: "utf8" });

    this.hexo.theme.setView(viewName, viewText);
    const view = this.hexo.theme.getView(viewName);
    // Fixed the original file path
    view.source = fullpath;
    view._precompile();

    //
    if (oriViewName) {
      const oriView = this.setOriView(oriViewName, view);
      oriView && this.setOriView(viewName, oriView);
    }
  }

  /**
   * Remove mappings between old and new views
   * @param {string} fullpath
   */
  removeView(fullpath) {
    const path = fullpath.replace(this.layout_dir, "");
    const prefixPath = this.config.prefix + path;
    const oriViewName = this.viewMap.get(path);
    const viewName = oriViewName ? `_/${oriViewName}` : prefixPath;

    if (oriViewName) {
      const oriView = this.setOriView(viewName, null);
      oriView && this.setOriView(oriViewName, oriView);
    }

    this.hexo.theme.removeView(viewName);
  }

  /**
   * Load view folder
   * @param {string} base
   */
  loadDir(base) {
    let dirs = readdirSync(base);
    dirs.forEach((path) => {
      const fullpath = escapeBackslash(resolve(base, path));
      const stats = statSync(fullpath);
      if (stats.isDirectory()) {
        this.loadDir(fullpath);
      } else if (stats.isFile()) {
        this.setView(fullpath);
      }
    });
  }
}

module.exports = (function () {
  let instance;
  return function (hexo) {
    if (!instance) instance = new Layout(hexo);
    return instance;
  };
})();
