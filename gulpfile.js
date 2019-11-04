/* eslint-disable node/no-unpublished-require */
const gulp = require("gulp");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
/* eslint-enable node/no-unpublished-require */

gulp.task("scripts", () => {
    gulp
        .src([
            "public/js/auth.js",
            "public/js/task.js"
        ])
        .pipe(concat("scripts.js"))
        .pipe(uglify())
        .pipe(gulp.dest("public/js"))
    return new Promise((resolve, reject) => {
        console.log("Task Scripts Completed!");
        resolve();
    });
});

gulp.task("default", gulp.series(["scripts"]), () => {
    gulp.watch("dev/js/**/*.js", ['scripts']);
});