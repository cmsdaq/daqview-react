var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var package = require("./package.json");

var paths = {
    node_modules: "node_modules",
    dist_lib: "dist/lib",
    release: "release"
};

var libPaths = {
    classnames: {
        source: paths.node_modules + "/classnames/index.js",
        target: paths.dist_lib + "/classnames/"
    },
    clipboard: {
        source: paths.node_modules + "/clipboard/dist/clipboard.min.js",
        target: paths.dist_lib + "/clipboard/"
    },
    jquery: {
        source: paths.node_modules + "/jquery/dist/jquery.min.js",
        target: paths.dist_lib + "/jquery/"
    },
    react: {
        source: paths.node_modules + "/react/dist/react.min.js",
        target: paths.dist_lib + "/react/"
    },
    react_dom: {
        source: paths.node_modules + "/react-dom/dist/react-dom.min.js",
        target: paths.dist_lib + "/react/"
    },
    bootstrap_js: {
        source: paths.node_modules + "/bootstrap/dist/js/bootstrap.min.js",
        target: paths.dist_lib + "/bootstrap/"
    },
    moment: {
        source: paths.node_modules + "/moment/min/moment.min.js",
        target: paths.dist_lib + "/moment/"
    },
    daterangepicker_js: {
        source: paths.node_modules + "/daterangepicker/daterangepicker.js",
        target: paths.dist_lib + "/daterangepicker/"
    },
    daterangepicker_css: {
        source: paths.node_modules + "/daterangepicker/daterangepicker.css",
        target: paths.dist_lib + "/daterangepicker/"
    }
};

var releaseContent = [
    "index.html",
    "index_fb.html",
    "index_fff.html",
    "fbtablehelp.html",
    "ffftablehelp.html",
    "link-configuration.js",
    ["dist/**/*", "dist"]
];

gulp.task("deploy-libs", function (cb) {
    for (var libName in libPaths) {
        if (libPaths.hasOwnProperty(libName)) {
            var lib = libPaths[libName];
            gulp.src(lib.source).pipe(gulp.dest(lib.target));
        }
    }
    cb();
});

gulp.task("build", ["deploy-libs"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist/js"));
});

gulp.task("release", ["build"], function (cb) {
    var releasePath = paths.release + "/" + package.version + "/";
    releaseContent.forEach(function (content) {
        if (Array.isArray(content)) {
            gulp.src(content[0]).pipe(gulp.dest(releasePath + content[1]))
        } else {
            gulp.src(content).pipe(gulp.dest(releasePath))
        }
    });
    cb();
});