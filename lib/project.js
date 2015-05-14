var utils = require('./utils');
var path = require('path');
var fs = require('fs');

function Project(gulp, apps, dirname) {
  this.dirname = dirname;
  this.apps = apps;
  this.gulp = gulp;
}

Project.prototype.appsPath = function(input, apps) {
  var out = [];
  var that = this;
  this.apps.forEach(function(app) {
    if (typeof input == 'string') {
      var dest = that.appPath(app, input);
      if (dest) out.push(dest);
    } else {
      input.forEach(function(dir) {
        var dest = that.appPath(app, dir);
        if (dest) out.push(dest);
      });
    }
  });
  return out;
};

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

Project.prototype.innerTask = function(task) {
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

Project.prototype.src = function(source, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.gulp.src(source, options);
};

Project.prototype.dest = function(dest, options) {
  options || (options = {});
  options.cwd = this.dirname;
  return this.gulp.dest(dest, options);
};

Project.prototype.task = function(task, deps, fn) {
  if (typeof deps == 'function') {
    fn = deps;
    deps = [];
  }

  deps = deps.concat(this.innerTask(task));
  return this.gulp.task(task, deps, fn);
};

module.exports = Project;
