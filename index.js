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
var resolve = require('cli-path-resolve')



function checkArg(name){
  if(!args[name]){
    console.error('[error] please provide a ' + name + ' argument')
    process.exit(1)
  }    
}

checkArg('folder')
checkArg('key')

var folderpath = resolve(args.folder)

function push(){
	var globs = args.glob.split(',') || '**/*.*'

	globby(globs, {
		cwd:folderpath
	}, function(err, files){

		var fileCount = 0

		async.forEachSeries(files, function(file, nextFile){

			console.log(file)
			nextFile()

		}, function(err){
			if(err){
				console.error(err)
				process.exit(1)
			}
			console.log(fileCount + ' files pushed to ' + args.etcd)
		})

	})
}

function pull(){

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