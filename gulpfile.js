const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const gutil = require('gulp-util');
const browserSync = require('browser-sync');
const eslint = require('gulp-eslint');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const del = require('del');

const ignoredFiles = ['./www/!index.html'];
const deleteFiles = ['./www/css', './www/js'];

const webpackBuild = (config, cb) => {
  webpack(config, (err, stats) => {
        if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString({
            colors: true
        }));
        cb();
    });
}

gulp.task('clean', (done) => {
  del([...ignoredFiles, ...deleteFiles]);
  done();
});

gulp.task('build', (done) => {
  webpackBuild(webpackConfig, done);
});

gulp.task('lint', (done) => {
  gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .on('finish', () => done());
});

gulp.task('styles', (done) => {
  gulp.src('styles/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('./tmp'))
    .pipe(concat('bundle.css'))
    .pipe(autoprefixer())
    .pipe(gulp.dest('./www/css'))
    .on('finish', () => done());
});

gulp.task('build:production', (done) => {
  const webpackProdConfig =  Object.assign({}, webpackConfig);
  webpackProdConfig.plugins = [
    new webpack.optimize.UglifyJsPlugin()
  ];
  webpackBuild(webpackProdConfig, done);
});

gulp.task('server', () => {
    browserSync.init({
        server: {
            baseDir: "./www"
        }
    });
});

gulp.task('reload', () => browserSync.reload());

gulp.task('default', ['clean', 'lint', 'build', 'styles', 'server'], () => {
  gulp.watch([path.join(__dirname, 'src', '*.*'), path.join(__dirname, 'styles', '*.*')], ['clean', 'lint', 'build', 'styles', 'reload']);
});

gulp.task('release', ['clean', 'lint', 'build:production', 'styles'], () => { });
