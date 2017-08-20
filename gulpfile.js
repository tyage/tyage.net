const gulp = require('gulp');
const less = require('gulp-less');
const watch = require('gulp-watch');

const CSS_SRC = 'src/css';
const CSS_DIST = 'public_html/css';

gulp.task('less', () => (
  gulp.src(CSS_SRC + '/style.less')
    .pipe(less({
      compress: true
    }))
    .pipe(gulp.dest(CSS_DIST))
));
gulp.task('watch', () => {
  gulp.watch([CSS_SRC + '/**'], ['less'])
});
gulp.task('default', ['less']);
