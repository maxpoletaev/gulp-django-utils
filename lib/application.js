/**
 * @constructor
 * @param {string} name
 * @param {Project} project
 */
function Application(name, project) {
  this.dirname = project.appPath(name)
  this.project = project;
  this.name = name;
}

/**
 * Wrapper for `gulp.src` with app working directory.
 *
 * @param {string|array} glob
 * @param {object} options
 */
Application.prototype.src = function(source, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.project.gulp.src(source, options);
};

/**
 * Wrapper for `gulp.dest` with app working directory.
 *
 * @param {string|array} glob
 * @param {object} options
 */
Application.prototype.dest = function(glob, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.project.gulp.dest(glob, options);
};

/**
 * Wrapper for `gulp.task` with app working directory.
 *
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
  return this.project.gulp.task(taskName, deps, fn);
};

/**
 * Wrapper for `gulp.watch` with app working directory.
 *
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
    options.cwd = this.dirname;
  }
  if (tasks) {
    for (var i=0; i<tasks.length; i++) {
      tasks[i] = this.name + ':' + tasks[i];
    }
  }
  return this.project.gulp.watch(glob, options, tasks);
};

/**
 * Expose `Application`.
 */
module.exports = Application;
