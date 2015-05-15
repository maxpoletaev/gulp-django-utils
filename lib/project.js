var utils = require('./utils');
var path = require('path');
var fs = require('fs');

/**
 * @constructor
 * @param {gulp} gulp  Gulp instance
 * @param {array} apps  Application list
 * @param {string} dirname  Project working directory
 */
function Project(gulp, apps, dirname) {
  this.dirname = dirname;
  this.apps = apps;
  this.gulp = gulp;
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
 *
 * @param {string} app
 * @param {string} [dest]
 * @param {function} [cb]
 * @return {string|void}
 */
Project.prototype.appPath = function(app, dest, cb) {
  var dests = [
    utils.format('{dir}/{app}/', {
      app: app.replace(/\./g, '/'),
      dir: this.dirname
    }),
    utils.format('{env}/lib/{python}/site-packages/{app}/', {
      env: process.env['VIRTUAL_ENV'],
      app: app.replace(/\./g, '/'),
      python: 'python3.4'
    })
  ];
  for (var i=0; i<dests.length; i++) {
    var dest = dests[i] + (dest ? dest : '');
    if (fs.existsSync(dest)) {
      return cb ? cb(dest) : dest;
    }
  }
};

/**
 * Get application-specified tasks by name.
 *
 * @param {string} task
 * @return {array}
 */
Project.prototype.innerTasks = function(task) {
  var tasks = [];
  var that = this;
  this.apps.forEach(function(app) {
    var taskName = app + ':' + task;
    if (taskName in that.gulp.tasks) {
      tasks.push(taskName);
    }
  });
  return tasks;
};

/**
 * Find and require gulpfiles from applications.
 *
 * @return {void}
 */
Project.prototype.discoverApps = function() {
  var that = this;
  this.apps.forEach(function(app) {
    that.appPath(app, 'gulpfile.js', function(gulpfile) {
      var appFn = require(gulpfile.replace('.js', ''));
      if (typeof appFn == 'function') {
        appFn(that, that.gulp);
      }
    });
  });
};

/**
 * Wrapper for `gulp.src` with project working directory.
 *
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.src = function(glob, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.gulp.src(glob, options);
};

/**
 * Wrapper for `gulp.dest` with project working directory.
 *
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.dest = function(glob, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.gulp.dest(glob, options);
};

/**
 * Wrapper for `gulp.task` with project working directory.
 *
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.task = function(task, deps, fn) {
  if (typeof deps == 'function') {
    fn = deps;
    deps = [];
  }
  deps = deps.concat(this.innerTasks(task));
  return this.gulp.task(task, deps, fn);
};

/**
 * Wrapper for `gulp.watch` with project working directory.
 *
 * @param {string|array} glob
 * @param {object} options
 */
Project.prototype.watch = function(glob, options, fn) {
  if (typeof options == 'function') {
    fn = options;
    options = {};
  }
  if (!options.cwd) {
    options.cwd = this.dirname;
  }
  return this.project.gulp.watch(glob, options, fn);
};

/**
 * Expose `Project`.
 */
module.exports = Project;
