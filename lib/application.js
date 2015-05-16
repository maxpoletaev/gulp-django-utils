var gulp = require('gulp');

/**
 * @constructor
 * @param {string} gulp
 * @param {Project} project
 * @param {object} options
 */
function Application(name, project, options) {
  this.name = name;
  this.options = Object.create({
    cwd: project.appPath(name)
  }, options || {});
}

/**
 * Wrapper for `gulp.src` with app working directory.
 * @param {string|array} glob
 * @param {object} options
 */
Application.prototype.src = function(source, options) {
  options || (options = {});
  options.cwd = this.options.cwd;
  return gulp.src(source, options);
};

/**
 * Wrapper for `gulp.dest` with app working directory.
 * @param {string|array} glob
 * @param {object} options
 */
Application.prototype.dest = function(glob, options) {
  options || (options = {});
  options.cwd = this.options.cwd;
  return gulp.dest(glob, options);
};

/**
 * Wrapper for `gulp.task` with app working directory.
 * @param {string|array} glob
 * @param {object} options
 */
Application.prototype.task = function(task, deps, fn) {
  if (typeof deps == 'function') {
    fn = deps;
    deps = [];
  }
  for (var i=0; i<deps.length; i++) {
    deps[i] = this.name + ':' + deps[i];
  }
  var taskName = (task == 'default') ? this.name : this.name + ':' + task;
  return gulp.task(taskName, deps, fn);
};

/**
 * Wrapper for `gulp.watch` with app working directory.
 * @param {string|array} glob
 * @param {object} [options]
 * @param {array} tasks
 */
Application.prototype.watch = function(glob, options, tasks) {
  if (Array.isArray(options)) {
    tasks = options;
    options = {};
  }
  if (!options.cwd) {
    options.cwd = this.options.cwd;
  }
  if (tasks) {
    for (var i=0; i<tasks.length; i++) {
      tasks[i] = this.name + ':' + tasks[i];
    }
  }
  return gulp.watch(glob, options, tasks);
};

/**
 * Expose `Application`.
 */
module.exports = Application;
