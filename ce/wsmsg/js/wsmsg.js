var Wsmsg = function(args){
	this.host = args.host;
	this.port = args.port;
	this.socket = null;
	
	this.personid = '';
	this.roomid = '';
	this.roomname = '';
	this.defnickname = '';
	this.roommembers = null;
	
	this.pnickname = null;
	this.pfile = null;
	this.pfname = null;
	this.pftype = null;
	this.pfsize = null;
	
	this.dfile = null;
	this.dfname = null;
	this.dftype = null;
	this.dfsize = null;
	
	this.startokcallback = null;
	this.personimagecallback = null;
	this.newchatcallback = null;
	this.entercallback = args.entercallback;
	this.chatmembercallback = args.chatmembercallback;
	this.exitcallback = null;
	this.dashimagecallback = null;
	this.newmessagecallback = args.newmessagecallback;
	this.onupdatetalkcallback = args.onupdatetalkcallback;
	this.ondeletetalkcallback = args.ondeletetalkcallback;
	this.notify = args.notify;
};
Wsmsg.prototype.open = function(){
	this.socket = io.connect('http://'+this.host+':'+this.port);
	this.socket.__source_object = this;
	this.socket.on('err', function(data){
		var t = this.__source_object;
		t.notify(data.message);
	});
	this.socket.on('startok', function(data){
		var t = this.__source_object;
		t.personid = data.psnid;
		t.defnickname = data.nickname;
		t.startokcallback(data);
	});
	this.socket.on('maderoom', function(data){
		var t = this.__source_object;
		t.roomid = data.chtid;
		t.roomname = data.chtname;
		t.newchatcallback(data);
	});
	this.socket.on('chathistory', function(data){
		var t = this.__source_object;
		t.roomid = data.chtid;
		t.roomname = data.chtname;
		t.roommembers = data.mems
		
		t.entercallback(data);
	});
	this.socket.on('chatmembers', function(data){
		var t = this.__source_object;
		var has = false;
		var len = data.receivers.length;
		for(var i = 0; i < len; i++){
			if(data.receivers[i] == t.personid){
				has = true;
				break;
			}
		}
		if(has){
			var mems = '';
			var mhtml = '';
			var nlen = t.roommembers.length;
			var newcommer = null;
			var msg = '';
			var memlen = data.dat.members.length;
			for(var i = 0; i < memlen; i++){
				newcommer = data.dat.members[i];
				var ext = false;
				for(var x = 0; x < nlen; x++){
					var older = t.roommembers[x];
					if(older.psnid == newcommer.psnid){
						ext = true;
						break;
					}
				}
				if(!ext){
					t.roommembers.push(newcommer);
					break;
				}
			}
			t.chatmembercallback(data, newcommer);
		}
	});
	this.socket.on('newmessage', function(data){
		var t = this.__source_object;
		if(data.chtid!=t.roomid)return;
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == t.personid){
				has = true;
				break;
			}
		}
		if(has){
			t.newmessagecallback(data);
		}
	});
	this.socket.on('personimage', function(data){
		var t = this.__source_object;
		t.defnickname = data.nickname;
		t.pnickname = null;
		t.pfile = null;
		t.pfname = null;
		t.pftype = null;
		t.pfsize = null;
		t.personimagecallback(data);
	});
	this.socket.on('dashimage', function(data){
		var t = this.__source_object;
		t.dfile = null;
		t.dfname = null;
		t.dftype = null;
		t.dfsize = null;
		t.dashimagecallback(data);
	});
	this.socket.on('updatetalk', function(data){
		var t = this.__source_object;
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == t.personid){
				has = true;
				break;
			}
		}
		if(has){
			t.onupdatetalkcallback(data);
		}
	});
	this.socket.on('deletetalk', function(data){
		var t = this.__source_object;
		if(t.roomid!=data.cid){
			alert('this room is not a target.');
			return;
		}
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == t.personid){
				has = true;
				break;
			}
		}
		if(has){
			t.ondeletetalkcallback(data);
		}
	});
	this.socket.on('exit', function(data){
		var t = this.__source_object;
		t.exitcallback(data);
	});
	this.socket.on('someoneexit', function(data){
		var t = this.__source_object;
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == t.personid){
				has = true;
				break;
			}
		}
		if(has){
			t.notify(data.nickname);
		}
	});
};
Wsmsg.prototype.start = function(callback, id){
	this.startokcallback = callback;
	this.socket.emit('start', {id: id});
};
Wsmsg.prototype.newchat = function(callback, cname){
	this.newchatcallback = callback;
	this.socket.emit('newchat', {cname: cname, psnid: this.personid});
};
Wsmsg.prototype.enter = function(cid){
	this.socket.emit('enter', {cid: cid, psnid: this.personid});
};
Wsmsg.prototype.send = function(nickname, txt, wlist){
	this.socket.emit('send', {psnid: this.personid, nickname: (nickname!=null&&nickname!='')?nickname:this.defnickname, cid: this.roomid, txt: txt, wlist: wlist});
};
Wsmsg.prototype.personman = function(callback){
	this.personimagecallback = callback;
	this.socket.emit('personman', {psnid: this.personid, nickname: this.pnickname, file: this.pfile, name: this.pfname, type: this.pftype, size: this.pfsize});
};
Wsmsg.prototype.upimg = function(callback){
	this.dashimagecallback = callback;
	this.socket.emit('upimg', {psnid: this.personid, file: this.dfile, name: this.dfname, type: this.dftype, size: this.dfsize});
};
Wsmsg.prototype.check = function(tid, checked){
	this.socket.emit('check', {cid: this.roomid, tid: tid, checked: checked});
};
Wsmsg.prototype.good = function(tid, plus){
	this.socket.emit('good', {cid: this.roomid, tid: tid, plus: plus});
};
Wsmsg.prototype.alert = function(tid, plus){
	this.socket.emit('alert', {cid: this.roomid, tid: tid, plus: plus});
};
Wsmsg.prototype.delimg = function(callback, psnid, imgid){
	this.socket.emit('delimg', {psnid: psnid, imgid: imgid});
};
Wsmsg.prototype.delmsg = function(callback, cid, tid){
	this.socket.emit('delmsg', {cid: cid, tid: tid});
};
Wsmsg.prototype.exit = function(callback, cid){
	this.exitcallback = callback;
	this.socket.emit('exit', {psnid: this.personid, cid: cid});
};


