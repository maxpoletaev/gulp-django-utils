# gulp-django-utils

Gulp helpers for Django.

## Usage

Create `django-project/gulpfile.js`:

```js
var django = require('gulp-django-utils');
var concat = require('gulp-concat');

// Initialize application list for processing.
var apps = ['blog', 'shop'];

// Initialize project with apps in current directory.
var project = new django.Project(apps);

// Load gulpfiles from declared apps.
project.discoverApps();

// Create a task which depends on the same tasks in apps.
project.task('js', function() {
  // Take all `.js` files from `django-project/static/main/js`,
  // concatenate it and put to `django-project/static/build`.
  project.src('static/main/js/*.js')
    .pipe(concat('main.js'))
    .pipe(project.dest('static/build'));
});
```

Then create `django-project/blog/gulpfile.js`:

```js
var django = require('gulp-django-utils');
var concat = require('gulp-concat');

module.exports = function(project) {
  // Initialize application in project.
  var app = new django.Application('blog', project);

  // Create task in application namespace.
  app.task('js', function() {
    // Take all `.js` files from `django-project/blog/static/blog/js`,
    // concatenate it and put to `django-project/static/build`.
    app.src('static/blog/js/*.js')
      .pipe(concat('blog.js'))
      .pipe(project.dest('static/build'));
  });
};
```

## API

### Application

#### .task(name [, deps, fn])

#### .src(glob [, opts])

#### .static(glob [, opts])

#### .watch(glob [, opts, tasks])

#### .dest(path [, opts])

### Project

#### .appsPath(path)

#### .appPath(appName, path, fn)

#### .innerTasks(taskName)

#### .discoverApps()

#### .src(glob [, opts])

#### .dest(path [, opts])

#### .task(name [, deps, fn])

#### .watch(glob [, opts, tasks])
