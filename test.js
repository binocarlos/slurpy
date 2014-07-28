var tape = require('tape')
var etcdjs = require('etcdjs')
var flatten = require('etcd-flatten')
var cp = require('child_process')
var path = require('path')

var etcdAddress = process.env.ETCD_ADDRESS || '127.0.0.1:4001'

var etcd = etcdjs(etcdAddress)

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
		var script = path.join(__dirname, 'index.js')
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