var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    notify = require('gulp-notify'),
    SOURCE = './main.js',
    DEST = './dist',
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    browserifyTask,
    bundle;


browserifyTask = function (isWatch) {
    var stream = isWatch
        ? watchifyStream
        : browserifyStream;

    bundle = function (stream) {
        stream()
            .bundle()
            .on('error', function (e) {
                new message.error(e, 'Browserify Failed!');
                this.emit('end');
            })
            .pipe(source('email-verifier.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(DEST));

        stream()
            .bundle()
            .on('error', function (e) {
                new message.error(e, 'Browserify Failed!');
                this.emit('end');
            })
            .pipe(source('email-verifier.min.js'))
            .pipe(buffer())
            .pipe(uglify())
            .pipe(gulp.dest(DEST))
            .pipe(message.send('Browserify Compiled!'));
    };

    return bundle(stream);
};


/**
 * Get a standard Browserify stream.
 */
var browserifyStream = function () {
    return browserify(SOURCE, {
        debug: true,
        standalone: 'EmailVerifier'
    });
};

/**
 * Get a Browserify stream, wrapped in Watchify.
 */
var watchifyStream = function () {
    var browserify = watchify(
        browserifyStream()
    );

    browserify.on('log', gutil.log);
    browserify.on('update', function () {
        bundle(browserify);
    });

    return browserify;
};

var message = {
    send: function (message) {
        return notify({
            title: 'Build',
            message: message,
            onLast: true
        });
    },
    error: function (e, message) {
        notify.onError({
            title: "Build error",
            message: message + ': <%= error.message %>',
            onLast: true
        })(e);

        // We'll spit out the error, just in
        // case it is useful for the user.
        console.log(e);
    }
};

gulp.task('default', function () {
    browserifyTask(false);
});

gulp.task('watch', function () {
    browserifyTask(true);
});