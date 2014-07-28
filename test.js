var tape = require('tape')
var etcdjs = require('etcdjs')

var etcd = etcdjs('127.0.0.1:4001')

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