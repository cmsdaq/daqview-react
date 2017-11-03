const gulp = require("gulp");
const rename = require("gulp-rename");
const replace = require('gulp-replace');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");

const packageInfo = require("./package.json");

const paths = {
    node_modules: "node_modules",
    dist_lib: "dist/lib",
    release: "release"
};

const libPaths = {
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

const configurations = {
    "dev": {
        name: "dev",
        linkConfiguration: "configuration/link-configuration.dev.js"
    },
    "pro": {
        name: "pro",
        linkConfiguration: "configuration/link-configuration.pro.js"
    },
    "904": {
        name: "904",
        linkConfiguration: "configuration/link-configuration.904.js"
    }
};

const defaultConfiguration = configurations.pro;

const releaseContent = [
    "index.html",
    "index_fb.html",
    "index_fb_dt.html",
    "index_fff.html",
    "fbtablehelp.html",
    "ffftablehelp.html",
    ["dist/**/*", "dist"]
];

gulp.task("deploy-libs", function (cb) {
    for (let libName in libPaths) {
        if (libPaths.hasOwnProperty(libName)) {
            let lib = libPaths[libName];
            gulp.src(lib.source)
                .pipe(gulp.dest(lib.target));
        }
    }
    cb();
});

gulp.task("build", ["deploy-libs"], function () {
    return tsProject.src()
        .pipe(tsProject())
        .js
        .pipe(gulp.dest("dist/js"));
});

gulp.task("release", ["build"], function (cb) {
    let configuration = null;
    for (let configurationName in configurations) {
        if (configurations.hasOwnProperty(configurationName)) {
            let commandLineParam = process.argv.indexOf("--" + configurationName);
            if (commandLineParam !== -1) {
                configuration = configurations[configurationName];
                break;
            }
        }
    }
    if (configuration === null) {
        configuration = defaultConfiguration;
    }

    let releasePath = paths.release + "/" + packageInfo.version + "-" + configuration.name + "/";
    releaseContent.forEach(function (content) {
        if (Array.isArray(content)) {
            gulp.src(content[0])
                .pipe(gulp.dest(releasePath + content[1]));
        } else {
            gulp.src(content)
                .pipe(replace('{[DAQVIEW_VERSION]}', packageInfo.version))
                .pipe(gulp.dest(releasePath));
        }
    });

    gulp.src(configuration.linkConfiguration)
        .pipe(rename("link-configuration.js"))
        .pipe(gulp.dest(releasePath));

    cb();
});