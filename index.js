var args = require('minimist')(process.argv, {
	alias:{
		folder:'f',
		key:'k',
		glob:'g',
		etcd:'e',
		wait:'w'
	},
	default:{
		etcd:'127.0.0.1:4001'
	}
})
var async = require('async')
var globby = require('globby')
var etcdjs = require('etcdjs')
var fs = require('fs')
var path = require('path')
var flatten = require('etcd-flatten')
var resolve = require('cli-path-resolve')
var mkdirp = require('mkdirp')

function checkArg(name){
  if(!args[name]){
    console.error('[error] please provide a ' + name + ' argument')
    process.exit(1)
  }    
}

checkArg('folder')
checkArg('key')

var folderpath = resolve(args.folder)
var key = args.key.replace(/\/$/, '') + '/'
var etcd = etcdjs(args.etcd)

function push(){

	var globs = (args.glob || '**/*.*').split(',')

	globby(globs, {
		cwd:folderpath
	}, function(err, files){

		var fileCount = 0

		async.forEachSeries(files, function(file, nextFile){

			fs.readFile(path.join(folderpath, file), 'utf8', function(err, content){
				if(err) return nextFile(err)
				console.log('push: ' + file)
				fileCount++
				etcd.set(key + file, content, nextFile)
			})

		}, function(err){
			if(err){
				console.error(err)
				process.exit(1)
			}
			console.log('done: ' + fileCount + ' files pushed to ' + args.etcd)
		})

	})
}

function pull(){
	etcd.get(key, {
		recursive:true
	}, function(err, result){
		if(err){
			console.error(err)
			process.exit(1)
		}
		result = flatten(result.node)

		var files = Object.keys(result || {}).map(function(filekey){
			return {
				path:filekey.substr(key.length),
				content:result[filekey]
			}
		})

		var fileCount = 0

		async.forEachSeries(files, function(file, nextFile){

			var filepath = path.join(folderpath, file.path)
			mkdirp(path.dirname(filepath), function(err){
				if(err) return nextFile(err)
				console.log('push: ' + file.path)
				fileCount++
				fs.writeFile(filepath, file.content, 'utf8', nextFile)
			})

		}, function(err){
			if(err){
				console.error(err)
				process.exit(1)
			}
			console.log('done: ' + fileCount + ' files pulled from ' + args.etcd)
		})

	})
}

var commands = {
	push:push,
	pull:pull
}

var command = args._[2] || 'push'

if(!commands[command]){
	console.error(command + ' command not found')
	process.exit(1)
}

commands[command]()