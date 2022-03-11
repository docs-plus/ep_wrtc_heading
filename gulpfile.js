/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable node/no-unpublished-require */

const gulp = require('gulp');
const concat = require('gulp-concat');
const htmlmin = require('gulp-htmlmin');
const bump = require('gulp-bump');
const git = require('gulp-git');
const cleanCSS = require('gulp-clean-css');

const cssFiles = ['./static/css/**/*.css'];
const htmlFiles = ['./static/templates/*.html'];

gulp.task('html', () => gulp.src(htmlFiles)
    .pipe(htmlmin({collapseWhitespace: true, removeComments: true, minifyJS: true}))
    .pipe(concat('webrtcComponent.mini.html'))
    .pipe(gulp.dest('static/dist/templates')));

gulp.task('css', () => gulp.src(cssFiles)
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('static/dist/css')));

gulp.task('bump', () => gulp.src('./package.json')
    .pipe(bump())
    .pipe(gulp.dest('./')));

gulp.task('git:publish', () => gulp.src([
  './static/dist/',
  './package.json',
])
    .pipe(git.add())
    .pipe(git.commit('build, version')),
);

// Run git push
// branch is the current branch & remote branch to push to
gulp.task('git:push', () => git.push('origin', (err) => {
  if (err) throw err;
}));

gulp.task('watch', () => {
  gulp.watch([...cssFiles, ...htmlFiles], gulp.series(['css', 'html']));
});

gulp.task('build', gulp.series(['css', 'html']));

gulp.task(
    'build:publish',
    gulp.series(['css', 'html', 'bump', 'git:publish', 'git:push']),
);
