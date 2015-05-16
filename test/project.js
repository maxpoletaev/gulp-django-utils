var Project = require('../lib/project')
  , assert = require('assert')
  , path = require('path')
  , gulp = require('gulp');

describe('project', function() {
  var cwd = path.join(__dirname, 'fixtures/django-project');

  var appName = 'mainapp';
  var project = new Project([appName], { cwd: cwd });

  it('appPath()', function() {
    var actual = project.appPath(appName, 'gulpfile.js');
    var expected = path.join(cwd, appName, 'gulpfile.js');
    assert.equal(actual, expected);
  });

  it('appsPath()', function() {
    var actual = project.appsPath('gulpfile.js');
    var expected = [path.join(cwd, appName, 'gulpfile.js')];
    assert.deepEqual(actual, expected);
  });
});
