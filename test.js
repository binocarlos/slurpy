var tape = require('tape')
var etcdjs = require('etcdjs')
var flatten = require('etcd-flatten')
var cp = require('child_process')
var path = require('path')

var etcdAddress = process.env.ETCD_ADDRESS || '127.0.0.1:4001'

var etcd = etcdjs(etcdAddress)

tape('check the etcd connection', function(t){

	etcd.set('/test/hello', 10, function(){
		setTimeout(function(){
			etcd.get('/test/hello', function(err, result){
				if(err){
					t.fail(err, 'load value')
					t.end()
					return
				}
				t.equal(result.node.value, '10', 'value is set')
				etcd.del('/test', {
					recursive:true
				}, function(err){
					if(err){
						t.fail(err, 'delete')
						t.end()
						return
					}
					t.end()
				})
			})	
		}, 100)
		
	})

})

tape('push the local files', function(t){

	var script = path.join(__dirname, 'index.js')
	var data = path.join(__dirname, 'test')

	cp.exec('node ' + script + ' push --folder ' + data + ' --key /test --etcd ' + etcdAddress, function(err, stdout, stderr){
		if(err || stdout){
			t.fail(err || stdout.toString(), 'push')
			t.end()
			return
		}
		console.log(stdout.toString())
		t.end()
	})

})