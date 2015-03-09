var gulp = require('gulp');
var gp = require('gulp-load-plugins')();

var options = {
    port    : '8889',
    livereload: false
};

gulp.task( 'default', function() {
    gulp.src('./')
        .pipe(gp.webserver(options))
}
);