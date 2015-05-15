# gulp-util-django

Gulp helpers for django.

## Usage example

Create `django-project/gulpfile.js`:

```js
var gulp = require('gulp'),
    django = require('gulp-util-django');

// Initialize application list for processing.
var apps = ['blog', 'shop'];

// Initialize project with apps in current directory.
var project = new Django.porject(gulp, apps, __dirname);

// Load gulpfiles from declared apps.
project.discoverApps();

// Create a task which depends on the same tasks in apps.
project.task('js', function() {
  // Take all `.coffee` files from `django-project/static/main/`
  // and put it to `django-project/static/build`.
  project.src('static/main/*.coffee')
    .pipe(project.dest('static/build'));
});
```

Then create `django-project/blog/gulpfile.js`:

```js
var django = require('gulp-util-django');

module.exports = function(project) {
  // Initialize application in project.
  var app = new django.Application('blog', project);
  
  // Create task in application namespace.
  app.task('js', function() {
    // Take all `.coffee` files from `django-project/blog/static/blog/coffee`
    // and put it to `django-project/static/build`.
    app.src('static/blog/coffee/*.coffee')
      .pipe(project.dest('static/build'));
  });
};
```

Run:

```sh
gulp js
```
