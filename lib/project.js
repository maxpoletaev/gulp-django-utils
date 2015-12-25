var extend = require('util')._extend;
var utils = require('./utils')
var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

/**
 * @constructor
 * @param {array} apps
 * @param {object} options
 */
function Project(apps, options) {
  this.apps = apps || [];
  this.options = extend({
    cwd: path.dirname(module.parent.parent.filename),
    gulpfile: 'gulpfile.js',
  }, options);

  this.discoverApps();
}

/**
 * Get path from all apps if exist.
 * @param {string|array} glob
 * @return {array}
 */
Project.prototype.appsPath = function(glob) {
  var dests = [];
  var that = this;
  this.apps.forEach(function(app) {
    if (typeof glob == 'string') {
      var dest = that.appPath(app,
        utils.format(glob, { app: app })
      );
      if (dest) dests.push(dest);
    } else {
      glob.forEach(function(dir) {
        var dest = that.appPath(app,
          utils.format(dir, { app: app })
        );
        if (dest) dests.push(dest);
      });
    }
  });
  return dests;
};

/**
 * Get absolute path for application file if it exists.
 * @param {string} app
 * @param {string} [dest]
 * @param {function} [fn]
 * @return {string|void}
 */
Project.prototype.appPath = function(app, dest, fn) {
  var appPath = utils.format('{cwd}/{app}', {
    app: app.replace(/\./g, '/'),
    cwd: this.options.cwd,
  });
  var found = path.join(appPath, (dest ? dest : ''));
  if (fs.existsSync(found)) return found;
};

/**
 * Get application-specified tasks by name.
 * @param {string} task
 * @return {array}
 */
Project.prototype.innerTasks = function(task) {
  var tasks = [];
  var that = this;
  this.apps.forEach(function(app) {
    var taskName = app + ':' + task;
    if (taskName in gulp.tasks) {
      tasks.push(taskName);
    }
  });
  return tasks;
};

/**
 * Find and require gulpfiles from applications.
 * @return {void}
 */
Project.prototype.discoverApps = function() {
  var that = this;
  this.appsPath(this.options.gulpfile).forEach(function(gulpfile) {
    var appFn = require(gulpfile.replace('.js', ''));
    if (typeof appFn == 'function') {
      appFn(that);
    }
  });
};

/**
 * Wrapper for `gulp.src` with project working directory.
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.src = function(glob, options) {
  options || (options = {});
  options.cwd = this.options.cwd;
  return gulp.src(glob, options);
};

/**
 * Wrapper for `gulp.dest` with project working directory.
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.dest = function(glob, options) {
  options || (options = {});
  options.cwd = this.options.cwd;
  return gulp.dest(glob, options);
};

/**
 * Wrapper for `gulp.task` with project working directory.
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.task = function(task, deps, fn) {
  if (typeof deps == 'function') {
    fn = deps;
    deps = [];
  }
  if (task != 'default') {
    gulp.task('root:' + task, fn);
  }
  if (deps) {
    deps = deps.concat(this.innerTasks(task));
  }
  return gulp.task(task, deps, fn);
};

/**
 * Wrapper for `gulp.watch` with project working directory.
 * @param {string|array} glob
 * @param {object} [options]
 * @param {array} tasks
 */
Project.prototype.watch = function(glob, options, tasks) {
  if (Array.isArray(options)) {
    tasks = options;
    options = {};
  }
  if (!options.cwd) {
    options.cwd = this.options.cwd;
  }
  if (tasks) {
    for (var i=0; i<tasks.length; i++) {
      tasks[i] = 'root:' + tasks[i];
    }
  }
  return gulp.watch(glob, options, tasks);
};

/**
 * Expose `Project`.
 */
module.exports = Project;
