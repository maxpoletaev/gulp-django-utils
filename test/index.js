var Project = require('../lib/project')
  , Application = require('../lib/application')
  , assert = require('assert')
  , path = require('path')
  , gulp = require('gulp');

var appName = 'mainapp';
var emptyFn = (function() {});
var cwd = path.join(__dirname, 'fixtures/django-project');

var project = new Project([appName], { cwd: cwd });
var app = new Application(appName, project);

describe('app', function() {
  it('task()', function() {
    var expected = [appName, appName + ':' + 'task']

    app.task('default', emptyFn);
    assert.ok(expected[0] in gulp.tasks);

    app.task('task', emptyFn);
    assert.ok(expected[1] in gulp.tasks);
  });
});

describe('project', function() {
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
