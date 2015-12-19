var path = require('path');
var gulp = require('gulp');
var assert = require('assert');
var streamAssert = require('stream-assert');

var Application = require('../lib/application');
var Project = require('../lib/project')

var appName = 'mainapp';
var emptyFn = (function() {});
var cwd = path.join(__dirname, 'fixtures/django-project');

var project = new Project([appName], { cwd: cwd });
var app = new Application(appName, project);

describe('Application', function() {
  it('task()', function() {
    var expected = [appName, appName + ':' + 'task'];

    app.task('default', emptyFn);
    assert.ok(expected[0] in gulp.tasks);

    app.task('task', emptyFn);
    assert.ok(expected[1] in gulp.tasks);
  });

  it('static()', function(done) {
    app.static('index.css')
      .pipe(streamAssert.length(1))
      .pipe(streamAssert.first(function(d) {
        assert.equal(d.contents.toString(), '/* index.css */\n');
      }))
      .pipe(streamAssert.end(done))
    ;
  });
});

describe('Project', function() {
  it('appPath()', function() {
    var actual = project.appPath(appName, 'gulpfile.js');
    var expected = path.join(cwd, appName, 'gulpfile.js');
    assert.equal(actual, expected);
  });

  it('appsPath()', function() {
    var actual = project.appsPath(['gulpfile.js', 'static/{app}/index.css']);
    var expected = [
      path.join(cwd, appName, 'gulpfile.js'),
      path.join(cwd, appName, 'static', appName, 'index.css')
    ];
    assert.deepEqual(actual, expected);
  });

  it('innerTasks()', function() {
    var actual = project.innerTasks('task');
    var expected = [appName + ':' + 'task'];
    assert.deepEqual(actual, expected);
  });

  it('task()', function() {
    project.task('default', emptyFn);
    assert.ok('default' in gulp.tasks);
  });
});
