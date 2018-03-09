import gulp from "gulp";
import clean from "gulp-clean";
import { merge } from "event-stream"
import sequence from "run-sequence";
import jshint from "gulp-jshint";
import mocha from "gulp-mocha";
import istanbul from "gulp-istanbul";
import webserver from "gulp-webserver";
import jsdoc from "gulp-jsdoc3";
import babel from "rollup-plugin-babel";
import babelrc from "babelrc-rollup";
import { rollup } from "rollup";
import uglify from 'rollup-plugin-uglify';

gulp.task("lint", () => {
    return gulp.src(["./src/**/*.js"])
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task("clean", () => {
    return merge(
        gulp.src(["./kuroshiro.js", "./kuroshiro.js.map"])
            .pipe(clean())
    );
});

gulp.task("build", () => {
    return rollup({
        input: './src/index.js',
        plugins: [
            babel(babelrc()),
            uglify()
        ]
    })
        .then(bundle => {
            return bundle.write({
                file: './kuroshiro.js',
                format: 'umd',
                name: 'kuroshiro',
                sourcemap: true
            });
        })
});

gulp.task("test", () => {
    return gulp.src("./test/**/*.js", { read: false })
        .pipe(mocha({ timeout: 30000, reporter: "list", exit: true }))
        .on('error', console.error);
});

gulp.task("coverage", (done) => {
    gulp.src(["./kuroshiro.js"])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on("finish", function () {
            gulp.src(["test/**/*.js"])
                .pipe(mocha({ timeout: 30000, reporter: "list" }))
                .pipe(istanbul.writeReports())
                .on("end", done);
        });
});

gulp.task("webserver", () => {
    gulp.src("./")
        .pipe(webserver({
            port: 8000,
            livereload: true,
            directoryListing: true
        }));
});

gulp.task("jsdoc", () => {
    gulp.src(["./src/**/*.js"])
        .pipe(jsdoc("./jsdoc"));
});

gulp.task("watch", () => {
    gulp.watch(["./src/**/*.js", "./test/**/*.js"], ["lint", "build", "jsdoc"]);
});

gulp.task("default", () => {
    sequence("lint", "clean", "build", "test");
});