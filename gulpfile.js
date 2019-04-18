const gulp = require('gulp');
const srcDir = './src';
const compileDir = './lib';
const buildDir = './build';
const testDir = './test';
const concat = require('gulp-concat');
const esLint = require('gulp-eslint');
const babel = require('gulp-babel');
const sourceMaps = require('gulp-sourcemaps');
const mocha = require('gulp-mocha');
const insert = require('gulp-insert');
const del = require('del');

function stream() {
  gulp.watch(`${srcDir}/*.js`,gulp.series(clean, lint, transpile, build, transform, test));
}

function getHeader() {
  return `/** Author: S Latham */\n\nconst axios = require('axios');\nconst qtree = require('@slatham/quadtree');\nconst haversine = require('haversine');\n\n`;
}

function clean() {
  return del([`${compileDir}/*`, `${buildDir}/*`])
}

function lint() {
  return gulp.src([`${srcDir}/*.js`]) // src dir
    .pipe(esLint())			// pipe the src dir into eslint 	
    .pipe(esLint.format())          // print out results to console
    .pipe(esLint.failAfterError())  // exit with error code 1 on any linting error
}

function transpile() {
  return gulp.src([`${srcDir}/*.js`]) // src dir
    .pipe(sourceMaps.init())	// initialise source maps
    .pipe(babel())			// transpile the src to the compile dir
    .pipe(sourceMaps.write('.'))	// write the source map files
    .pipe(gulp.dest(compileDir))	// compile dir
}

function test() {
  return gulp.src([`${testDir}/*.js`], {read: false})
    .pipe(mocha({reporter: 'progress'}))

}

function build() {
  return gulp.src([`${compileDir}/settings.js`, `${compileDir}/datapoint.js`])	// compile dir
	.pipe(concat('index.js'))		// concat all js file into one file
	.pipe(gulp.dest(buildDir))		// store in the build directory
};

function transform() {
  return gulp.src([`${buildDir}/*.js`])
	.pipe(insert.transform(function(contents,file){
	  contents = contents.replace(/^module.*$/mg, '');
		contents = contents.replace(/^const.*require.*$/mg, '');
		return getHeader() + contents + getExport()
	}))
	.pipe(gulp.dest(buildDir))
}

function getExport() {
  return `\nif (typeof module !== 'undefined') {
	module.exports = new Datapoint();
	}`
}

exports.fullBuild = gulp.series(clean, lint, transpile, build, transform, test);
exports.fullBuildNoTest = gulp.series(clean, transpile, build, transform);
exports.fullBuildAndWatch = gulp.series(clean, lint, transpile, build, transform, test, stream);
exports.clean = gulp.series(clean);
