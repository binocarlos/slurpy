var tape = require('tape')
var etcdjs = require('etcdjs')
var flatten = require('etcd-flatten')
var cp = require('child_process')
var path = require('path')
var wrench = require('wrench')
var async = require('async')
var fs = require('fs')

var etcdAddress = process.env.ETCD_ADDRESS || '127.0.0.1:4001'

var etcd = etcdjs(etcdAddress)
var script = path.join(__dirname, 'index.js')

function resetEtcd(t, done){
	etcd.del('/test', {
		recursive:true
	}, function(err){
		done()
	})
}

tape('check the etcd connection', function(t){

	resetEtcd(t, function(){
		etcd.set('/test/hello', 10, function(){
			setTimeout(function(){
				etcd.get('/test/hello', function(err, result){
					if(err){
						t.fail(err, 'load value')
						t.end()
						return
					}
					t.equal(result.node.value, '10', 'value is set')
					t.end()
				})	
			}, 100)
			
		})
	})
	

})

tape('push the local files', function(t){

	resetEtcd(t, function(){
		
		var data = path.join(__dirname, 'test')

		cp.exec('node ' + script + ' push --folder ' + data + ' --key /test --etcd ' + etcdAddress, function(err, stdout, stderr){
			if(err || stderr){
				t.fail(err || stderr.toString(), 'push')
				t.end()
				return
			}
			console.log(stdout.toString())
			setTimeout(function(){
				etcd.get('/', {
					recursive:true
				}, function(err, result){
					if(err){
						t.fail(err, 'load error')
						t.end()
						return
					}
					result = flatten(result.node)
					t.ok(result['/test/config/config.json'], 'config.json')
					t.equal(result['/test/data/tag.txt', 'this is some text'])
					t.end()
				})
			}, 100)
			
			
		})
	})

})


tape('pull keys to files', function(t){

	var outputfolder = path.join(__dirname, '/testoutput')
	wrench.rmdirSyncRecursive(outputfolder, true)
	wrench.mkdirSyncRecursive(outputfolder)

	async.series([
		function(next){
			resetEtcd(t, next)
		},
		function(next){
			etcd.set('/test/config/config.json', '{"a":10}', next)
		},
		function(next){
			etcd.set('/test/data/tag.txt', 'hello', next)
		},
		function(next){
			setTimeout(next, 100)
		},
		function(next){
			cp.exec('node ' + script + ' pull --folder ' + outputfolder + ' --key /test --etcd ' + etcdAddress, function(err, stdout, stderr){
				if(err || stderr){
					t.fail(err || stderr.toString(), 'push')
					t.end()
					return
				}

				console.log(stdout.toString())

				t.ok(fs.existsSync(path.join(__dirname, 'testoutput', 'config', 'config.json')), 'config exists')
				t.ok(fs.existsSync(path.join(__dirname, 'testoutput', 'data', 'tag.txt')), 'tag exists')

				wrench.rmdirSyncRecursive(outputfolder, true)
				
				t.end()
			})
		}
	])

})