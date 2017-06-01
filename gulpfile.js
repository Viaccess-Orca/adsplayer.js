var gulp = require('gulp'),
    // node packages
    del = require('del'),
    fs = require('fs'),
    runSequence = require('run-sequence'),
    browserify = require('browserify'),
    watchify = require('watchify'),
    merge = require('utils-merge'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    // gulp packages
    footer = require('gulp-footer'),
    header = require('gulp-header'),
    git = require('gulp-git'),
    gulpif = require('gulp-if'),
    jsdoc = require('gulp-jsdoc3'),
    jshint = require('gulp-jshint'),
    //rename = require('gulp-rename'),
    replace = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    // custom import
    pkg = require('./package.json'),
    ts = require("gulp-typescript");

var tsProject = ts.createProject("tsconfig.json");

var sources = {
    main: './src/AdsPlayer.js',
    all: [
        './src/AdsPlayer.js',
        './src/**/*.js'
    ]
};

var outName = "csadsplugin.js";
var outDir = './dist';

var browserifyArgs = {
    entries: './index.js',
    transform: [['babelify', { 'presets': ['es2015'] }]],
    debug: true
};

var banner = ['<%= pkg.copyright %>\n\n/* Last build : <%= pkg.gitDate %>_<%= pkg.gitTime %> / git revision : <%= pkg.gitRevision %> */\n\n'].join('\n');

var jshint_ignore_start = '/* jshint ignore:start */\n';
var jshint_ignore_end = '\n/* jshint ignore:end */';

var jsdocConfig = {
    'tags': {
        'allowUnknownTags': true
    },
    'opts': {
        'destination': './dist/doc'
    },
    'plugins': [
        'plugins/markdown'
    ],
    'templates': {
        'cleverLinks': false,
        'monospaceLinks': false,
        'default': {
            'outputSourceFiles': true
        },
        'path': 'ink-docstrap',
        'theme': 'united',
        'navType': 'vertical',
        'linenums': true,
        'dateFormat': 'MMMM Do YYYY, h:mm:ss a'
    }
};

gulp.task('clean', function(done) {
    return (function() {
        del([outDir + '**/*'], {
            force: true,
            dot: true
        });
        done();
    })();
});

gulp.task('clean-temp', function(done) {
    return (function() {
        del([outDir + 'temp/*'], {
            force: true,
            dot: true
        });
        done();
    })();
});

gulp.task('gitRevision', function() {
    // Get last abbreviated commit hash
    git.exec({args: 'log -1 --format=%h', quiet: true}, function (err, stdout) {
        pkg.gitRevision = stdout.replace(/(\r\n|\n|\r)/gm,'');
    });
});

gulp.task('gitDate', function() {
    // Get last commit date
    git.exec({args: 'log -1 --format=%cD', quiet: true}, function (err, stdout) {
        var date = new Date(stdout);
        pkg.gitDate = (date.getFullYear()) + '-' + (date.getMonth() + 1) + '-' + (date.getDate());
        pkg.gitTime = (date.getHours()) + ':' + (date.getMinutes()) + ':' + (date.getSeconds());
    });
});

gulp.task('copyright', function() {
    // Get copyright
    fs.readFile('./COPYRIGHT', null, function(err, _data) {
        pkg.copyright = _data;
    });
});

// Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive **/
gulp.task('gitTag', function() {
    // Get current branch name
    git.exec({args: 'describe --all', quiet: true}, function (err, stdout) {
        currentBranchDir = stdout.replace(/(\r\n|\n|\r)/gm, '').split('/').reverse();
        currentBranch =currentBranchDir[0];
        // if branch "master", set pkg.gitTag value with the last tag name
        if (currentBranch == "master") {
            //Get last tag information
            git.exec({args: 'describe --tags --dirty', quiet: true}, function (err, stdout) {
                pkg.gitTag = stdout.replace(/(\r\n|\n|\r)/gm, "");
            });
        } else {
            pkg.gitTag = outName.replace(".js", "-") + currentBranch;
        }
    });
});

gulp.task('package-info', function() {
    runSequence('gitRevision','gitTag', 'gitDate', 'copyright');
});
//end

gulp.task('lint', function() {
    return gulp.src(sources.all)
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});


function bundle_js(bundler, name, build) {
    return bundler.bundle()
        .pipe(source(name))
        .pipe(buffer())
        .pipe(gulpif(build, replace(/VERSION[\s*]=[\s*]['\\](.*)['\\]/g, 'VERSION = \'' + pkg.version + '\'')))
        .pipe(gulpif(build, replace(/@@GITTAG/, pkg.gitTag)))
        .pipe(gulpif(build, replace(/@@TIMESTAMP/, pkg.gitDate + '_' + pkg.gitTime)))
        .pipe(gulpif(build, replace(/@@REVISION/, pkg.gitRevision)))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(gulpif(build, uglify()))
        .pipe(gulpif(build, header(jshint_ignore_start)))
        .pipe(gulpif(build, footer(jshint_ignore_end)))
        .pipe(gulpif(build, header(banner, { pkg : pkg })))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(outDir));
}

gulp.task('watch', function () {
    var args = merge(watchify.args, browserifyArgs),
        bundler = watchify(browserify(args));

    bundler.on('error', function (error) {
        console.log(error);
        this.end();
    });

    bundler.on('update', function () {
        bundle_js(bundler, outName, false);
    });

    bundle_js(bundler, outName, false);
});

gulp.task("compile-typescript", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest(function (file) {  //generate the js file in the same directory
            return file.base;
        }));
});

gulp.task('build', ['package-info', 'lint'], function() {

    return bundle_js(browserify(browserifyArgs), outName, true);
});

// Copyright (C) 2016 VIACCESS S.A and/or ORCA Interactive **/
// sample build
gulp.task('build-samples', function() {
    // copy all samples directory in dist and perform replaceSourcesByBuild function
    gulp.src(['samples/**'])
        .pipe(replaceSourcesByBuild())
        .pipe(gulp.dest(outDir + '/samples/'));
});

var replaceSourcesByBuild = function() {
    //In all *.html file,  replace path where to get csadsplugin.js file
    return gulpif('**/*.html', replace(/<!-- sources modify by gulp.replaceSourcesByBuild -->([\s\S]*?)<!-- endsources -->/,
                                    '<script type="text/javascript" src="../../' + outName + '"></script>'));
    //return gulpif('*.html',replace('src="../../dist/csadsplugin.js"', 'src="../../csadsplugin.js"'));

};

gulp.task('build-voAdsPlayer', function() {
    /* copie le rep voAdsPlayer dans dist/samples et modifie l'acces au fichier csadsplugin.js */
    gulp.src(['samples/voAdsPlayer/**']) //  , '!samples/voAdsPlayer/*.html'])
        .pipe(replaceSourcesByBuild())
        .pipe(gulp.dest(outDir + '/samples/voAdsPlayer/'));
    /* copie le rep ads dans dist/samples */
    gulp.src(['samples/ads/**'])
        .pipe(gulp.dest(outDir + '/samples/ads'));
    /* copie le fichier hasplayer.min.js dans dist/samples */
    return gulp.src(['samples/hasplayer.min.js'])
        .pipe(gulp.dest(outDir + '/samples/'));
});

// end

gulp.task('releases-notes', function() {
    return gulp.src('./RELEASES NOTES.txt')
        .pipe(gulp.dest(outDir));
});

gulp.task('zip', function() {
    return gulp.src(outDir + '/**/*')
        .pipe(zip(outName + '.zip'))
        .pipe(gulp.dest(outDir));
});

gulp.task('doc', function () {
    gulp.src(['README.md', sources.main], {read: false})
        .pipe(jsdoc(jsdocConfig));
});

gulp.task('version', function() {
    fs.writeFileSync(outDir + '/version.properties', 'GITTAG=' + pkg.gitTag+'\nVERSION_'+ pkg.name+'=' + pkg.version);
});

gulp.task('default', function(cb) {
    runSequence('clean','compile-typescript','build', ['build-samples', 'doc'],
        'releases-notes',
        'zip',
        'version',
        cb);
});
