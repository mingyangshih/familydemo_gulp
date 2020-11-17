let gulp = require('gulp')
let autoprefixer = require('autoprefixer');
const concat = require('gulp-concat');
// gulp相關套件可直接由這個載入
let $ = require('gulp-load-plugins')();
// 開啟dev server 的套件
let browserSync = require('browser-sync').create();
// 協助處理bower抓下來的js
let mainBowerFiles = require('main-bower-files');
// debug 可顯示位置
const sourcemaps = require('gulp-sourcemaps');
// 壓縮css
const cleanCSS = require('gulp-clean-css');
const minimist = require('minimist');
// 
let envOptions = {
  string : 'env',
  default : {
    env: 'develop' //預設環境為develop
  }
}
let options = minimist(process.argv.slice(2),envOptions)
// 用來看現在產出develop 還是production
console.log('run for  ' + options.env);

gulp.task('clean', function () {
  return gulp.src(['./tmp','./dist'], {read: false})
      .pipe($.clean());
});

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
  return gulp.src('./src/scss/*.scss').pipe(sourcemaps.init()).pipe($.plumber())
    .pipe($.sass({outputStyle: 'expanded'}).on('error', $.sass.logError))
    .pipe($.postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('./'))
    .pipe($.if(options.env === 'production', cleanCSS({compatibility: 'ie8'})))
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
  gulp.watch("./src/img/*", gulp.series('image'));
  gulp.watch("./src/*.jade").on('change', gulp.series('templates', browserSync.reload));
}));

// bower
gulp.task('bower', function() {
  return gulp.src(mainBowerFiles())
      .pipe(gulp.dest('./tmp/vendors'))
});
// 把bower component 的js 併起來

gulp.task('vendorJS', function() {
  return gulp.src('./tmp/vendors/**/**.js')
    .pipe(concat('vendor.js'))
    // 縮減js內容
    // 用gulp if 判斷是否要縮減
    .pipe($.if(options.env === 'production',$.uglify()))
    .pipe(gulp.dest('./dist/js'))
})
// gulp-image
gulp.task('image', function (done) {
  gulp.src('./src/img/*')
    // 用gulp if 判斷是否要壓縮圖片
    .pipe($.if(options.env === 'production',$.image()))
    .pipe(gulp.dest('./dist/img/'));
    done()
});


// 產出production用
gulp.task('build', gulp.series('clean','templates', 'sass', 'bower', 'vendorJS'))
// 開發用
gulp.task('default', gulp.series('templates', 'sass', 'bower','vendorJS', 'image', 'browser-sync'))





