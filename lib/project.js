var utils = require('./utils')
  , gulp = require('gulp')
  , path = require('path')
  , fs = require('fs');

/**
 * @constructor
 * @param {array} apps
 * @param {object} options
 */
function Project(apps, options) {
  this.apps = apps;
  this.options = Object.create({
    cwd: path.dirname(module.parent.parent.filename)
  }, options);
}

/**
 * Get dests from all apps if exists.
 * @param {string|array} glob
 * @return {array}
 */
Project.prototype.appsPath = function(glob) {
  var dests = [];
  var that = this;
  this.apps.forEach(function(app) {
    if (typeof glob == 'string') {
      var dest = that.appPath(app, glob);
      if (dest) dests.push(dest);
    } else {
      glob.forEach(function(dir) {
        var dest = that.appPath(app, dir);
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
 * @param {function} [cb]
 * @return {string|void}
 */
Project.prototype.appPath = function(app, dest, cb) {
  var dests = [
    utils.format('{dir}/{app}', {
      app: app.replace(/\./g, '/'),
      dir: this.options.cwd
    }),
    utils.format('{env}/lib/{python}/site-packages/{app}', {
      env: process.env['VIRTUAL_ENV'],
      app: app.replace(/\./g, '/'),
      python: 'python3.4'
    })
  ];
  for (var i=0; i<dests.length; i++) {
    var dest = path.join(dests[i], (dest ? dest : ''));
    if (fs.existsSync(dest)) {
      return cb ? cb(dest) : dest;
    }
  }
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
  this.apps.forEach(function(app) {
    that.appPath(app, 'gulpfile.js', function(gulpfile) {
      var appFn = require(gulpfile.replace('.js', ''));
      if (typeof appFn == 'function') {
        appFn(that);
      }
    });
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
  deps = deps.concat(this.innerTasks(task));
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
