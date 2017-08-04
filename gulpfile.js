var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json");

var paths = {
    node_modules: "node_modules",
    dist_lib: "dist/lib"
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
    }
};

gulp.task("deploy-libs", function() {
    for (var libName in libPaths) {
        if (libPaths.hasOwnProperty(libName)) {
            var lib = libPaths[libName];
            gulp.src(lib.source).pipe(gulp.dest(lib.target));
        }
    }
});

gulp.task("build", ["deploy-libs"], function() {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});