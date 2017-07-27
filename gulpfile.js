var gulp = require('gulp'),
    rollup = require('rollup'),
    rollupTypescript = require('rollup-plugin-typescript2');

var fs = require('fs');

gulp.task('mvc', function () {
    return rollup.rollup({
        entry: "./src/MVC.ts",
        plugins: [
            rollupTypescript({
                tsconfig: './tsconfig.mvc.json'
            })
        ]
    }).then(function (bundle) {
        bundle.write({
            format: "umd",
            moduleName: "cmpxs.cmpx-mvc",
            dest: "./dist/index.js",
            sourceMap: true
        });
    })
});

gulp.task('tonpm', function () {
    fs.renameSync('./dist/MVC.d.ts', './dist/index.d.ts')
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../cmpx-npm/cmpx-mvc'));
});

gulp.task('todemo', function () {
    return gulp.src(['dist/**'])
        .pipe(gulp.dest('../cmpx-mvc-demo/node_modules/cmpx-mvc'));
});
