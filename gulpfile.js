const gulp = require("gulp");
const babel = require("gulp-babel");
const rename = require("gulp-rename");
const nodemon = require("gulp-nodemon");
const shell = require("gulp-shell");
const livereload = require("gulp-livereload");
const resolve = require("path").resolve;

// 2017-12-29: in response to gulp-util deprecation
// https://medium.com/gulpjs/gulp-util-ca3b1f9f9ac5
const log = require("fancy-log");
const PluginError = require("plugin-error");
const del = require("del");

const webpack = require("webpack");
const webpackConfig = require("./webpack.config");
const webpackCallback = function(cb) {
  var done = false;
  return function(err, stats) {
    if (err) {
      throw new PluginError("[webpack]", err);
    }

    log("[webpack]", stats.toString());
    livereload.reload();

    if (!done) {
      done = true;
      cb();
    }
  };
};
const nodemonOptions = function(extras) {
  return Object.assign({
    script: "./index.js",
    watch: [
      "./src/lib/",
      "./src/server/", 
      "./src/server.js",

      // core plugins
      "./node_modules/gbf-autopilot-core/build/index.js"
    ].map(function(path) {
      return resolve(__dirname, path);
    }),
  }, extras || {});
};

const globs = {
  server: [
    "./src/{server,lib}/**/*.js",
    "./src/server.js"
  ],
  extension: "./extension/pages/**/*.html"
};

gulp.task("clean:extension", function() {
  return del([
    "extension/dist/**/*.*",
    "!extension/dist/.gitignore"
  ]);
});

gulp.task("clean:server", function() {
  return del([
    "server/dist/**/*.*",
    "!server/dist/.gitignore"
  ]);
});

gulp.task("build:extension", gulp.series("clean:extension", function(cb) {
  webpack(webpackConfig, webpackCallback(cb));
}));

gulp.task("build:server", gulp.series("clean:server", function() {
  return gulp.src(globs.server)
    .pipe(babel())
    .pipe(gulp.dest("./server/dist"));
}));

gulp.task("watch:extension", function(cb) {
  const config = Object.assign({}, webpackConfig, {
    watch: true
  });
  webpack(config, webpackCallback(cb));
  livereload.listen();
});

gulp.task("watch:server", function(done) {
  gulp.watch(globs.server.src, gulp.series("build:server"));
  done();
});

gulp.task("build", gulp.series("build:server", "build:extension"));
gulp.task("watch", gulp.series("build:extension", "watch:extension"));
gulp.task("serve", gulp.series("build:server", function(done) {
  nodemon(nodemonOptions());
  done();
}));
gulp.task("serve:debug", gulp.series("build:server", function(done) {
  nodemon(nodemonOptions({
    exec: "node --inspect-brk",
    debug: true,
    verbose: true
  }));
  done();
}));

gulp.task("serve2", shell.task([
  "concurrently \"gulp serve\" \"python controller/controller.py\""
]));

gulp.task("config", function() {
  return gulp.src("./{extension,.}/*.sample.{json,ini}")
    .pipe(rename(function(path) {
      const suffix = ".sample";
      const index = path.basename.length - suffix.length;
      path.basename = path.basename.substr(0, index);
    }))
    .pipe(gulp.dest("."));
});

gulp.task("default", gulp.series("build"));
