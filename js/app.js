var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app, {'log level': 1})
  , cproc = require('child_process');
 
io.configure('production', function(env){
  io.set('transports', [
	'websocket',
	'htmlfile',
	'xhr-polling',
	'jsonp-polling'
  ]);
//  io.set('origins', 'xxxx.jp:80??記述方未調査');
});
io.configure('develop', function(env){
  io.set('transports', [
	'websocket',
	'htmlfile',
	'xhr-polling',
	'jsonp-polling',
	'flashsocket'
  ]);
});

var port = process.env.NODE_PORT || process.argv[2] || 80;
app.listen(port);

function handler(req, res) {
	if(req.url!='/test.html' && req.url!='/client.js' && req.url!='/roomlist' && req.url!='/socket.io/socket.io.js' && req.url.indexOf('/users/')!=0){
		var re = '404 Not found.';
		res.writeHead(404, {
			'Content-Type': 'text/plain',
			'Content-Length': re.length
		});
		res.end(re);
		return;
	}
	
	var task = cproc.fork(__dirname + '/down.js', [req.url]);
	task.send({message: 'response', url: req.url});
	task.on('message', function(m){
		if(m.message == 'gotimage'){
			if(m.ext == 'html'){
				res.writeHead(200, {
					'Content-Type': 'text/html',
					'Content-Length': Buffer.byteLength(m.dat, 'utf8')
				});
				res.end(new Buffer(m.dat));
			}
			else if(m.ext == 'js'){
				res.writeHead(200, {
					'Content-Type': 'text/javascript',
					'Content-Length': Buffer.byteLength(m.dat, 'utf8')
				});
				res.end(new Buffer(m.dat));
			}
			else{
				res.writeHead(200, {
					'Content-Type': 'image/'+m.ext,
					'Content-Length': m.dat.length
				});
				res.end(new Buffer(m.dat));
			}
		}
		else if(m.message == 'norfound'){// 無かったら404
			var re = '404 Not found.';
			res.writeHead(404, {
				'Content-Type': 'text/plain',
				'Content-Length': re.length
			});
			res.end(re);
		}
		task.kill();
	});
}

//以下、それぞれ送信データ内容のチェックを行う事
io.sockets.on('connection', function (socket) {
	socket.on('start', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'start', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'startok'){
				socket.emit('startok', m.dat);
			}
			else if(m.message == 'iderr'){
				socket.emit('err', {message: 'creating person id failure.'});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			else if(m.message == 'dataerr'){
				socket.emit('err', {message: 'creating user data failure.'});
			}
			task.kill();
		});
	});
	socket.on('newchat', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'newchat', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'maderoom'){
				socket.emit('maderoom', m.dat);
			}
			else if(m.message == 'iderr'){
				socket.emit('err', {message: 'creating chat id failure.'});
			}
			else if(m.message == 'readerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('enter', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'enter', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'chathistory'){
				socket.emit('chathistory', m.dat);
				var cmem = {};
				cmem.chtid = m.dat.chtid;
				cmem.chtname = m.dat.chtname;
				cmem.members = m.dat.mems;
				socket.broadcast.emit('chatmembers', {receivers: m.dat.members, dat: cmem});
			}
			else if(m.message == 'personerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('send', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'send', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'newmessage'){
				var talk = m.dat.talk;
				socket.emit('newmessage', {receivers: m.dat.members, psnid: m.dat.psnid, chtid: m.dat.chtid, dat: talk});
				socket.broadcast.emit('newmessage', {receivers: m.dat.members, psnid: m.dat.psnid, chtid: m.dat.chtid, dat: talk});
			}
			else if(m.message == 'personerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'talkerr'){
				socket.emit('err', {message: 'creating talk id failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
//	socket.on('down', function(data){
//	});
	socket.on('personman', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'personman', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'updateperson'){
				socket.emit('personimage', {nickname: m.nickname, imgurl: m.imgurl});
			}
			else if(m.message == 'personerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('upimg', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'upimg', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'updateperson'){
				socket.emit('dashimage', m.dat);
			}
			else if(m.message == 'dasherr'){
				socket.emit('err', {message: 'creating dashboard id failure.'});
			}
			else if(m.message == 'personerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('check', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'check', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'updatetalk'){
				var talk = m.dat.talk;
				socket.emit('updatetalk', {receivers: m.dat.members, dat: talk});
				socket.broadcast.emit('updatetalk', {receivers: m.dat.members, dat: talk});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('good', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'good', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'updatetalk'){
				var talk = m.dat.talk;
				socket.emit('updatetalk', {receivers: m.dat.members, dat: talk});
				socket.broadcast.emit('updatetalk', {receivers: m.dat.members, dat: talk});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('alert', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'alert', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'updatetalk'){
				var talk = m.dat.talk;
				socket.emit('updatetalk', {receivers: m.dat.members, dat: talk});
				socket.broadcast.emit('updatetalk', {receivers: m.dat.members, dat: talk});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('delimg', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'delimg', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'updateperson'){
				socket.emit('dashimage', m.dat);
			}
			else if(m.message == 'personerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('delmsg', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'delmsg', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'deletetalk'){
				socket.emit('deletetalk', {receivers: m.dat.members, cid: m.dat.cid, tid: m.dat.tid});
				socket.broadcast.emit('deletetalk', {receivers: m.dat.members, cid: m.dat.cid, tid: m.dat.tid});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
	socket.on('exit', function(data){
		var task = cproc.fork(__dirname + '/ws.js');
		task.send({message: 'exit', data: JSON.stringify(data)});
		task.on('message', function(m){
			if(m.message == 'exit'){
				socket.emit('exit', {receivers: m.dat.members, psnid: m.dat.psnid, nickname: m.dat.nickname, imgurl: m.dat.imgurl, cid: m.dat.cid, chtname: m.dat.chtname});
				socket.broadcast.emit('someoneexit', {receivers: m.dat.members, psnid: m.dat.psnid, nickname: m.dat.nickname, imgurl: m.dat.imgurl, cid: m.dat.cid, chtname: m.dat.chtname});
			}
			else if(m.message == 'personerr'){
				socket.emit('err', {message: 'reading person data failure.'});
			}
			else if(m.message == 'roomerr'){
				socket.emit('err', {message: 'reading room data failure.'});
			}
			else if(m.message == 'writeerr'){
				socket.emit('err', {message: 'writing data failure.'});
			}
			task.kill();
		});
	});
//	socket.on('uncheck', function(data){
//	});
//	socket.on('ungood', function(data){
//	});
//	socket.on('unalert', function(data){
//	});
});