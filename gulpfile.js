const gulp = require('gulp');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const mode = require('gulp-mode')();
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const rename = require("gulp-rename");

const jsfiles = [
	"./static/js/lib/adapter.js",
	"./static/js/lib/getUserMediaPolyfill.js",
	"./static/js/lib/jquery.tmpl.min.js",
	"./static/js/lib/clientShare.js",
	"./static/js/lib/copyPasteEvents.js",
	"./static/js/lib/codecsHandler.js",
	"./static/js/lib/textChat.js",
	"./static/js/lib/videoChat.js",
	"./static/js/lib/webrtcRoom.js",
	"./static/js/lib/webrtc.js",
]


const gulpifyJs = function () {    
	return gulp.src(jsfiles)
		.pipe(mode.production(sourcemaps.init()))
		.pipe(mode.production(uglify(/* options */)))
		.pipe(concat('wrtc.heading.mini.js'))
		.pipe(mode.production(sourcemaps.write('.')))
		.pipe(gulp.dest('static/js'));
}

gulp.task('js', gulpifyJs);

gulp.task('watch', function() {
	gulp.watch(jsfiles, gulp.series(['js']));
})

