
var packageName = 'gilbertwat:deepmerge';
var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));
Package.describe({
  name : packageName,
  version: packageJson.version,
  // Brief, one-line summary of the package.
  summary: packageJson.description,
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/gilbertwat/deepmerge',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.markdown'
});

Package.onUse(function(api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
  api.export('deepmerge');
  api.addFiles([
      'index.js',
      'meteor/export.js'
  ]);
});

Package.onTest(function(api) {
  api.use(packageName);
  api.use('tinytest');
  api.addFiles('meteor/tests.js');
});
