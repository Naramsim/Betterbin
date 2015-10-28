var gulp = require('gulp');
var shell = require('gulp-shell')

gulp.task('default', function() {
	// place code for your default task here
});

gulp.task('build', shell.task([
	'echo building project',
	'meteor build betterbin',
	'echo build finished',
	'echo installing app',
	'cd betterbin',
	'tar -xzvf betterbin',
	'cd bundle',
	'(cd programs/server && npm install)',
	'echo app installed',
]))