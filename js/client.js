var Wsmsg = function(args){
	this.host = args.host;
	this.port = args.port;
	this.socket = null;
	
	this.personid = '';
	this.roomid = '';
	this.defnickname = '';
};
Wsmsg.prototype.open = function(){
	this.socket = io.connect('http://'+this.host+':'+this.port);
	this.socket.on('err', function(data){
		alert(data.message);
	});
	this.socket.on('startok', function(data){
		this.personid = data.psnid;
		this.defnickname = data.nickname;
		document.getElementById('dsppsnid').innerHTML = this.personid;
		document.getElementById('dspnickname').innerHTML = this.defnickname;
		if(data.imgurl!=null && data.imgurl!='')document.getElementById('dsppsnimg').setAttribute('src', data.imgurl);
		
		var rlen = data.chats.length;
		var rm = document.getElementById('dsprooms');
		rm.innerHTML = '';
		var ul = document.createElement('ul');
		for(var i = 0; i < rlen; i++){
			var crm = data.chats[i];
			var li = document.createElement('li');
			li.setAttribute('id', 'crm'+crm.chtid);
			var aa = document.createElement('a');
			aa.setAttribute('href', '#');
			aa.setAttribute('onclick', 'server.exit(\''+this.personid+'\', \''+crm.chtid+'\');');
			aa.innerHTML = '[削除]'+crm.chtname;
			li.appendChild(aa);
			ul.appendChild(li);
		}
		rm.appendChild(ul);
		var len = data.dash.length;
		var finput = document.getElementById('dspdashimgs');
		finput.innerHTML = '';
		for(var i = 0; i < len; i++){
			var img = document.createElement('img');
			img.src = data.dash[i].imgurl;
			img.setAttribute('id', data.dash[i].imgid);
			finput.appendChild(img);
			var delb = document.createElement('input');
			delb.setAttribute('type', 'button');
			delb.setAttribute('psnid', data.psnid);
			delb.setAttribute('imgid', data.dash[i].imgid);
			delb.onclick = function(){
				server.delimg(this.getAttribute('psnid'), this.getAttribute('imgid'));
			};
			delb.value = '前の画像を削除';
			finput.appendChild(delb);
			var br = document.createElement('br');
			finput.appendChild(br);
		}
	});
	this.socket.on('maderoom', function(data){
		this.roomid = data.chtid;
		document.getElementById('dsproomid').innerHTML = this.roomid+'&nbsp;'+data.chtname;
		alert(data.chtid + ' ' + data.chturl);
	});
	this.socket.on('chathistory', function(data){
		this.roomid = data.chtid;
		document.getElementById('dsproomid').innerHTML = this.roomid;
		
		if(document.getElementById('crm'+data.chtid)==null){
			var ul = document.getElementById('dsprooms').firstChild;
			var li = document.createElement('li');
			li.setAttribute('id', 'crm'+data.chtid);
			var aa = document.createElement('a');
			aa.setAttribute('href', '#');
			aa.setAttribute('onclick', 'server.exit(\''+this.personid+'\', \''+data.chtid+'\');');
			aa.innerHTML = '[削除]'+data.chtname;
			li.appendChild(aa);
			ul.appendChild(li);
		}
		
		var mems = '';
		var memlen = data.mems.length;
		for(var i = 0; i < memlen; i++){
			mems += '<li>'+data.mems[i].psnid+':'+data.mems[i].nickname+' <img src="'+data.mems[i].imgurl+'"/></li>';
		}
		document.getElementById('dspmates').innerHTML = '<ul>'+mems+'</ul>';
		
		this.roomid = data.chtid;
		var tt = data.talk;
		for(var i = 0; i < tt.length; i++){
			var talk = tt[i];
			document.getElementById('dsproomid').innerHTML += '<div id="talk'+talk.id+'" style="margin: 0 0 5px 0;">'+talk.nickname+(talk.imgrul==null || talk.imgrul==''?'':'<img src="'+talk.imgrul+'"/>')+'<span style="margin: 0 5px 0 5px;color:#44FF44;"><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="good'+talk.id+'">'+talk.good+'</span><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><span style="margin: 0 5px 0 5px;color:#FF4444;"><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="alert'+talk.id+'">'+talk.alert+'</span><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><div><input type="checkbox" onclick="server.check(\''+this.roomid+'\', \''+talk.id+'\', this.checked);" '+(talk.checkpoint?'checked':'')+' />'+talk.texthtml+'<input type="button" onclick="server.delmsg(\''+this.roomid+'\', \''+talk.id+'\');" value="×"/></div></div>';
		}
	});
	this.socket.on('chatmembers', function(data){
		var has = false;
		var len = data.receivers.length;
		for(var i = 0; i < len; i++){
			if(data.receivers[i] == this.personid){
				has = true;
				break;
			}
		}
		if(has){
			var mems = '';
			var mhtml = '';
			var memlen = data.dat.members.length;
			for(var i = 0; i < memlen; i++){
				mems += data.dat.members[i].psnid+':'+data.dat.members[i].nickname+' src='+data.dat.members[i].imgurl+'\n';
				mhtml += '<li>'+data.dat.members[i].psnid+':'+data.dat.members[i].nickname+' <img src="'+data.dat.members[i].imgurl+'"/></li>';
			}
			alert(data.dat.chtid+' was joined '+mems);
			document.getElementById('dspmates').firstChild.innerHTML = mhtml;
		}
	});
	this.socket.on('newmessage', function(data){
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == this.personid){
				has = true;
				break;
			}
		}
		if(has){
			var talk = data.dat;
			document.getElementById('dsproomid').innerHTML += '<div id="talk'+talk.id+'" style="margin: 0 0 5px 0;">'+talk.nickname+(talk.imgrul==null || talk.imgrul==''?'':'<img src="'+talk.imgrul+'"/>')+'<span style="margin: 0 5px 0 5px;color:#44FF44;"><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="good'+talk.id+'">'+talk.good+'</span><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><span style="margin: 0 5px 0 5px;color:#FF4444;"><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="alert'+talk.id+'">'+talk.alert+'</span><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><div><input type="checkbox" onclick="server.check(\''+this.roomid+'\', \''+talk.id+'\', this.checked);" '+(talk.checkpoint?'checked':'')+' />'+talk.texthtml+'<input type="button" onclick="server.delmsg(\''+this.roomid+'\', \''+talk.id+'\');" value="×"/></div></div>';
		}
	});
	this.socket.on('personimage', function(data){
		this.defnickname = data.nickname;
		document.getElementById('dspnickname').innerHTML = this.defnickname;
		document.getElementById('dsppsnimg').setAttribute('src', data.imgurl);
	});
	this.socket.on('dashimage', function(data){
		var len = data.dash.length;
		var finput = document.getElementById('dspdashimgs');
		finput.innerHTML = '';
		for(var i = 0; i < len; i++){
			var img = document.createElement('img');
			img.src = data.dash[i].imgurl;
			img.setAttribute('id', data.dash[i].imgid);
			finput.appendChild(img);
			var delb = document.createElement('input');
			delb.setAttribute('type', 'button');
			delb.setAttribute('psnid', data.psnid);
			delb.setAttribute('imgid', data.dash[i].imgid);
			delb.onclick = function(){
				server.delimg(this.getAttribute('psnid'), this.getAttribute('imgid'));
			};
			delb.value = '前の画像を削除';
			finput.appendChild(delb);
			var br = document.createElement('br');
			finput.appendChild(br);
		}
	});
	this.socket.on('updatetalk', function(data){
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == this.personid){
				has = true;
				break;
			}
		}
		if(has){
			var talk = data.dat;
			var tgt = document.getElementById('talk'+talk.id);
			tgt.innerHTML = talk.nickname+(talk.imgrul==null || talk.imgrul==''?'':'<img src="'+talk.imgrul+'"/>')+'<span style="margin: 0 5px 0 5px;color:#44FF44;"><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="good'+talk.id+'">'+talk.good+'</span><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><span style="margin: 0 5px 0 5px;color:#FF4444;"><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="alert'+talk.id+'">'+talk.alert+'</span><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><div><input type="checkbox" onclick="server.check(\''+this.roomid+'\', \''+talk.id+'\', this.checked);" '+(talk.checkpoint?'checked':'')+' />'+talk.texthtml+'<input type="button" onclick="server.delmsg(\''+this.roomid+'\', \''+talk.id+'\');" value="×"/></div>';
		}
	});
	this.socket.on('deletetalk', function(data){
		if(this.roomid!=data.cid){
			alert('this room is not a target.');
			return;
		}
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == this.personid){
				has = true;
				break;
			}
		}
		if(has){
			document.getElementById('talk'+data.tid).style.display = 'none';
		}
	});
	this.socket.on('exit', function(data){
		document.getElementById('crm'+data.cid).style.display = 'none';
	});
	this.socket.on('someoneexit', function(data){
		var has = false;
		var len = data.receivers.length;
		var mem = '';
		for(var i = 0; i < len; i++){
			mem += data.receivers[i]+' ';
			if(data.receivers[i] == this.personid){
				has = true;
				break;
			}
		}
		if(has){
			alert('exit '+data.nickname+' '+data.imgurl);
		}
	});
};
Wsmsg.prototype.start = function(id){
	this.socket.emit('start', {id: id});
};
Wsmsg.prototype.newchat = function(cname, psnid){
	this.socket.emit('newchat', {cname: cname, psnid: psnid});
};
Wsmsg.prototype.enter = function(cid, psnid){
	this.socket.emit('enter', {cid: cid, psnid: psnid});
};
Wsmsg.prototype.send = function(psnid, nickname, cid, txt, wlist){
	this.socket.emit('send', {psnid: psnid, nickname: nickname, cid: cid, txt: txt, wlist: wlist});
};
Wsmsg.prototype.personman = function(psnid, nickname, file, name, type, size){
	this.socket.emit('personman', {psnid: psnid, nickname: nickname, file: file, name: name, type: type, size: size});
};
Wsmsg.prototype.upimg = function(upimg){
	this.socket.emit('upimg', {psnid: upimg.psnid, file: upimg.file, name: upimg.name, type: upimg.type, size: upimg.size});
};
Wsmsg.prototype.check = function(cid, tid, checked){
	this.socket.emit('check', {cid: cid, tid: tid, checked: checked});
};
Wsmsg.prototype.good = function(cid, tid, plus){
	this.socket.emit('good', {cid: cid, tid: tid, plus: plus});
};
Wsmsg.prototype.alert = function(cid, tid, plus){
	this.socket.emit('alert', {cid: cid, tid: tid, plus: plus});
};
Wsmsg.prototype.delimg = function(psnid, imgid){
	this.socket.emit('delimg', {psnid: psnid, imgid: imgid});
};
Wsmsg.prototype.delmsg = function(cid, tid){
	this.socket.emit('delmsg', {cid: cid, tid: tid});
};
Wsmsg.prototype.exit = function(psnid, cid){
	this.socket.emit('exit', {psnid: psnid, cid: cid});
};

