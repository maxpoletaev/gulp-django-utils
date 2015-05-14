function Application(name, project) {
  this.dirname = project.appPath(name)
  this.project = project;
  this.name = name;
}

Application.prototype.src = function(source, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.project.gulp.src(source, options);
};

Application.prototype.dest = function(glob, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.project.gulp.dest(glob, options);
};

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

Application.prototype.watch = function(glob, options, fn) {
  if (typeof options == 'function') {
    fn = options;
    options = {};
  }
  if (!options.cwd) {
    options.cwd = this.dirname;
  }
  return this.project.gulp.watch(glob, options, fn);
};

module.exports = Application;
