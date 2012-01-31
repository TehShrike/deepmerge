fs = require 'fs'
path = require 'path'
{spawn, exec} = require 'child_process'
util = require 'util'

# Use executables installed with npm bundle.
process.env["PATH"] = "node_modules/.bin:#{process.env["PATH"]}"

srcDir = "src"
prodDir = "lib"
testDir = "spec"

# ANSI Terminal Colors.
bold  = "\033[0;1m"
red   = "\033[0;31m"
green = "\033[0;32m"
reset = "\033[0m"

# Log a message with a color.
log = (message, color, explanation) ->
  console.log color + message + reset + ' ' + (explanation or '')

# Handle error and kill the process.
onError = (err) ->
  if err
    process.stdout.write "#{red}#{err.stack}#{reset}\n"
    process.exit -1

task 'clean', 'Remove temporary files', -> 
	log 'Executing clean', green
	exec 'rm -rf lib reports logs/*.log', onError

task 'build', 'Compile CoffeeScript into Javascript', ->
	exec "coffee -o #{prodDir} -c #{srcDir}", (err, stdout, stderror) ->
		onError err

runTests = (dir) ->
	log "Running test suite for #{dir}...", green
	exec "jasmine-node --coffee --junitreport --verbose #{dir}", (err, stdout, stderr) ->
		console.log stdout if stdout
		console.error stderr if stderr
		process.stdout.on 'drain', -> 
			process.exit -1 if err

runOnChange = (task_to_invoke) ->
	exec "find #{srcDir} #{testDir}", (err, stdout, stderr) ->
		files = stdout.split '\n'
		files = files[0..files.length - 2]
		files.forEach (file) ->
			fs.stat file, (err, stats) ->
				if stats.isFile()
					fs.watch file, (event, filename) ->
						invoke task_to_invoke

task 'test', 'Run all tests', ->
	runTests "#{testDir}/"

task 'test:unit', 'Run unit tests', ->
	runTests "#{testDir}/unit/"

task 'test:integration', 'Run unit tests', ->
	runTests "#{testDir}/integration/"

task '~test:unit', 'Rebuild and rerun tests on changes to src', ->
	runOnChange 'test:unit'

task '~test:integration', 'Rebuild and rerun tests on changes to src', ->
	runOnChange 'test:integration'

task '~test', 'Rebuild and rerun tests on changes to src', ->
	runOnChange 'test'