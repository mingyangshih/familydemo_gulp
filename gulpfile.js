let gulp = require('gulp')
let autoprefixer = require('autoprefixer');
// gulp相關套件可直接由這個載入
let $ = require('gulp-load-plugins')();
// 開啟dev server 的套件
let browserSync = require('browser-sync').create();
let mainBowerFiles = require('main-bower-files');
// run gulp jade
gulp.task('templates', function(done) {
  gulp.src('./src/*.jade').pipe($.plumber())
    .pipe($.jade({
      pretty: true
    }))
    .pipe(gulp.dest('./dist/'))
    done()
});
// run gullp scss
gulp.task('sass', function () {
  return gulp.src('./src/scss/*.scss').pipe($.plumber())
    .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
    .pipe($.postcss([ autoprefixer() ]))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(browserSync.stream());
});


// browser sync
gulp.task('browser-sync',gulp.series('sass','templates', function(){
  browserSync.init({
    server: {
        baseDir: "./dist"
    }
  });
  // 有變動時自動更新
  gulp.watch("./src/scss/*.scss", gulp.series('sass'));
  // gulp.watch("./src/img/*", gulp.series('image'));
  gulp.watch("./src/*.jade").on('change', gulp.series('templates', browserSync.reload));
}));

// bower
gulp.task('bower', function() {
  return gulp.src(mainBowerFiles())
      .pipe(gulp.dest('./tmp/vendors'))
});

// gulp-image
gulp.task('image', function (done) {
  gulp.src('./src/img/*')
    .pipe($.image())
    .pipe(gulp.dest('./dist/img/'));
    done()
});

gulp.task('default', gulp.series('templates', 'sass', 'bower', 'image', 'browser-sync'))
// gulp.task('default', gulp.series('templates', 'sass', 'bower', 'browser-sync'))