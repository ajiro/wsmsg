var fs = require('fs')
  , url = require('url');

process.on('message', function(m){
	if(m.message == 'start'){
		var id = '';
		var dat = JSON.parse(m.data);
		if(dat.id==null){
			id = createPerson();
		}
		else
			id = dat.id;
		if(id==''){
			process.send({message: 'iderr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		var psn = '';
		try{
			psn = fs.readFileSync(__dirname + '/users/'+id+'/data.json');
		}catch(e){
			id = '';
		}
		if(id=='' || psn==''){
			process.send({message: 'dataerr'});
			return;
		}
		var pjson = JSON.parse(psn);
		pjson.chats = [];
		var clen = pjson.chatrooms.length;
		for(var i = 0; i < clen; i++){
			var chtid = pjson.chatrooms[i];
			var cht = getChat(chtid);
			if(cht==-1){
				process.send({message: 'roomerr'});
				return;
			}
			var c = JSON.parse(cht);
			pjson.chats.push({chtid: c.chtid, chtname: c.chtname});
		}
		process.send({message: 'startok', dat: pjson});
	}
	else if(m.message == 'newchat'){
		var dat = JSON.parse(m.data);
		var id = createChatRoom(dat.cname, dat.psnid);
		if(id==''){
			process.send({message: 'iderr'});
			return;
		}
		else if(id=='read person error'){
			process.send({message: 'readerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		var roomurl = 'http://sasaki.com/chat/'+id;
		process.send({message: 'maderoom', dat: {chtid: id, chtname: dat.cname, chturl: roomurl}});
	}
	else if(m.message == 'enter'){
		var dat = JSON.parse(m.data);
		var re = enterTheChatRoom(dat.cid, dat.psnid);
		if(re=='read person error'){
			process.send({message: 'personerr'});
			return;
		}
		else if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		var cht = JSON.parse(re);
		cht.mems = [];
		var mlen = cht.members.length;
		for(var i = 0; i < mlen; i++){
			var psnid = cht.members[i];
			var pstr = getPerson(psnid);
			if(pstr==-1){
				process.send({message: 'personerr'});
				return;
			}
			var p = JSON.parse(pstr);
			cht.mems.push({psnid: psnid, nickname: p.nickname, imgurl: p.imgurl});
		}
		process.send({message: 'chathistory', dat: cht});
	}
	else if(m.message == 'send'){
		var dat = JSON.parse(m.data);
		var re = addMessage(dat.psnid, dat.nickname, dat.cid, dat.txt, dat.wlist);
		if(re=='read person error'){
			process.send({message: 'personerr'});
			return;
		}
		else if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='get talk id error'){
			process.send({message: 'talkerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		var cht = JSON.parse(re);
		process.send({message: 'newmessage', dat: cht});
	}
	else if(m.message == 'personman'){
		var dat = JSON.parse(m.data);
		var re = managePerson(dat.psnid, dat.nickname, dat.file, dat.name, dat.type, dat.size);
		if(re=='read person error'){
			process.send({message: 'personerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'updateperson', nickname: dat.nickname, imgurl: re});
	}
	else if(m.message == 'upimg'){
		var dat = JSON.parse(m.data);
		var re = addDash(dat.psnid, dat.file, dat.name, dat.type, dat.size);
		if(re=='get dash id error'){
			process.send({message: 'dasherr'});
			return;
		}
		else if(re=='read person error'){
			process.send({message: 'personerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'updateperson', dat: JSON.parse(re)});
	}
	else if(m.message == 'check'){
		var dat = JSON.parse(m.data);
		var re = changeCheckpoint(dat.cid, dat.tid, dat.checked);
		if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'updatetalk', dat: JSON.parse(re)});
	}
	else if(m.message == 'good'){
		var dat = JSON.parse(m.data);
		var re = changeGood(dat.cid, dat.tid, dat.plus);
		if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'updatetalk', dat: JSON.parse(re)});
	}
	else if(m.message == 'alert'){
		var dat = JSON.parse(m.data);
		var re = changeAlert(dat.cid, dat.tid, dat.plus);
		if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'updatetalk', dat: JSON.parse(re)});
	}
	else if(m.message == 'delimg'){
		var dat = JSON.parse(m.data);
		var re = deleteDash(dat.psnid, dat.imgid);
		if(re=='read person error'){
			process.send({message: 'personerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'updateperson', dat: JSON.parse(re)});
	}
	else if(m.message == 'delmsg'){
		var dat = JSON.parse(m.data);
		var re = deleteMessage(dat.cid, dat.tid);
		if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		process.send({message: 'deletetalk', dat: JSON.parse(re)});
	}
	else if(m.message == 'exit'){
		var dat = JSON.parse(m.data);
		var re = exitTheChatRoom(dat.psnid, dat.cid);
		if(re=='read person error'){
			process.send({message: 'personerr'});
			return;
		}
		else if(re=='read room error'){
			process.send({message: 'roomerr'});
			return;
		}
		else if(re=='write data error'){
			process.send({message: 'writeerr'});
			return;
		}
		var cht = JSON.parse(re);
		var pjson = JSON.parse(getPerson(dat.psnid));
		process.send({message: 'exit', dat: {members: cht.members, psnid: dat.psnid, nickname: pjson.nickname, imgurl: pjson.imgurl, cid: dat.cid, chtname: cht.chtname}});
	}
});

function createPerson(){
	var id = getUniqueUserString(12);
	var psn = {};
	psn.psnid = id;
	psn.nickname = '';
	psn.imgurl = '';
	psn.chatrooms = [];
	psn.imgseq = 0;
	psn.dash = [];
	var json = JSON.stringify(psn);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/users/'+id+'/data.json', json);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return id;
}
function createChatRoom(cname, psnid){
	var id = getUniqueChatString(16);
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var pjson = JSON.parse(psn);
	pjson.chatrooms.push(id);
	psn = JSON.stringify(pjson);
	var cht = {};
	cht.chtid = id;
	cht.chtname = cname;
	cht.checkpoints = [];
	cht.talkseq = 0;
	cht.talk = [];
	cht.members = [psnid];
	var json = JSON.stringify(cht);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+id+'/chat.json', json);
			fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', psn);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return id;
}
function enterTheChatRoom(cid, psnid){
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var pjson = JSON.parse(psn);
	var cjson = JSON.parse(cht);
	var pt = arrayContains(cid, pjson.chatrooms);
	var ct = arrayContains(psnid, cjson.members);
	if(!pt)pjson.chatrooms.push(cid);
	if(!ct)cjson.members.push(psnid);
	if(pt && ct)return cht;
	psn = JSON.stringify(pjson);
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
			fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', psn);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return cht;
}
function addMessage(psnid, nickname, cid, txt, wlist){
	var talk = {};
	talk.id = getUniqueTalkString(cid);
	if(talk.id==''){
		return 'get talk id error';
	}
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var pjson = JSON.parse(psn);
	var cjson = JSON.parse(cht);
	
	var nck = nickname;
	if(nck==null || nck=='')nck = pjson.nickname;
	talk.psnid = psnid;
	talk.nickname = nck;
	talk.imgurl = pjson.imgurl;
	talk.timestamp = new Date().getTime();
	talk.texthtml = txt;
	talk.whitelist = (wlist==null || wlist=='')?[]:new String(wlist).split(',');
	talk.good = 0;
	talk.alert = 0;
	talk.checkpoint = false;
	cjson.talk.push(talk);
	
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	var reobj = {members: cjson.members, psnid: psnid, chtid: cid, talk: talk};
	return JSON.stringify(reobj);
}
function managePerson(psnid, nickname, file, name, type, size){
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var pjson = JSON.parse(psn);
	if(nickname!=null && nickname!='')pjson.nickname = nickname;
	if(name!=null && name!='')pjson.imgurl = '/users/'+psnid+'/'+name;
	psn = JSON.stringify(pjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			if(name!=null && name!='')fs.writeFileSync(__dirname + '/users/'+psnid+'/'+name, new Buffer(file.substring(file.indexOf(',')+1), 'base64'));
			fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', psn);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return pjson.imgurl;
}
function addDash(psnid, file, name, type, size){
	var imgid = getUniqueDashString(psnid);
	if(imgid==''){
		return 'get dash id error';
	}
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var pjson = JSON.parse(psn);
	var dimg = {};
	dimg.imgid = imgid;
	dimg.imgurl = '/users/'+psnid+'/dash/'+name;
	pjson.dash.push(dimg);
	psn = JSON.stringify(pjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/users/'+psnid+'/dash/'+name, new Buffer(file.substring(file.indexOf(',')+1), 'base64'));
			fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', psn);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return psn;
}
function changeCheckpoint(cid, tid, checked){
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var cjson = JSON.parse(cht);
	
	var tlen = cjson.talk.length;
	for(var i = 0; i < tlen; i++){
		var talk = cjson.talk[i];
		if(talk.id!=tid)continue;
		talk.checkpoint = checked;
		break;
	}
	if(checked){
		cjson.checkpoints.push(tid);
		cjson.checkpoints.sort(function(pv, nv){
			var pint = parseInt(pv);
			var nint = parseInt(nv);
			if(pint < nint)return -1;
			else if(pint > nint)return 1;
			return 0;
		});
	}
	else{
		var clen = cjson.checkpoints.length;
		for(var i = 0; i < clen; i++){
			if(cjson.checkpoints[i]==tid){
				cjson.checkpoints.splice(i, 1);
				break;
			}
		}
	}
	
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	var reobj = {members: cjson.members, talk: talk};
	return JSON.stringify(reobj);
}
function changeGood(cid, tid, plus){
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var cjson = JSON.parse(cht);
	
	var tlen = cjson.talk.length;
	for(var i = 0; i < tlen; i++){
		var talk = cjson.talk[i];
		if(talk.id!=tid)continue;
		talk.good += plus?1:-1;
		break;
	}
	
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	var reobj = {members: cjson.members, talk: talk};
	return JSON.stringify(reobj);
}
function changeAlert(cid, tid, plus){
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var cjson = JSON.parse(cht);
	
	var tlen = cjson.talk.length;
	for(var i = 0; i < tlen; i++){
		var talk = cjson.talk[i];
		if(talk.id!=tid)continue;
		talk.alert += plus?1:-1;
		break;
	}
	
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	var reobj = {members: cjson.members, talk: talk};
	return JSON.stringify(reobj);
}
function deleteDash(psnid, imgid){
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var pjson = JSON.parse(psn);
	var imlen = pjson.dash.length;
	var tgt = '';
	for(var i = 0; i < imlen; i++){
		var dimg = pjson.dash[i];
		if(dimg.imgid == imgid){
			tgt = __dirname + dimg.imgurl;
			pjson.dash.splice(i,1);
			break;
		}
	}
	psn = JSON.stringify(pjson);
	var count = 0;
	var updjson = false;
	while(true){
		count++;
		var sw = true;
		try{
			if(!updjson)fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', psn);
			updjson = true;
			fs.unlinkSync(tgt);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return psn;
}
function deleteMessage(cid, tid){
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var cjson = JSON.parse(cht);
	
	var tlen = cjson.talk.length;
	for(var i = 0; i < tlen; i++){
		var talk = cjson.talk[i];
		if(talk.id!=tid)continue;
		if(talk.checkpoint){
			var clen = cjson.checkpoints.length;
			for(var j = 0; j < clen; j++){
				if(cjson.checkpoints[j]==tid){
					cjson.checkpoints.splice(j, 1);
					break;
				}
			}
		}
		cjson.talk.splice(i,1);
		break;
	}
	
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	var reobj = {members: cjson.members, cid: cid, tid: tid};
	return JSON.stringify(reobj);
}
function exitTheChatRoom(psnid, cid){
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return 'read person error';
	}
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return 'read room error';
	}
	var pjson = JSON.parse(psn);
	var cjson = JSON.parse(cht);
	
	var plen = pjson.chatrooms.length;
	for(var i = 0; i < plen; i++){
		if(pjson.chatrooms[i]==cid){
			pjson.chatrooms.splice(i, 1);
			break;
		}
	}
	var clen = cjson.members.length;
	for(var i = 0; i < clen; i++){
		if(cjson.members[i]==psnid){
			cjson.members.splice(i, 1);
			break;
		}
	}
	
	psn = JSON.stringify(pjson);
	cht = JSON.stringify(cjson);
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+cid+'/chat.json', cht);
			fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', psn);
		}catch(e){
			if(count>=10){
				return 'write data error';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return cht;
}

function getPerson(psnid){
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return -1;
	}
	return psn;
}
function getChat(cid){
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+cid+'/chat.json');
	}catch(e){
		return -1;
	}
	return cht;
}

var useuniquechars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
function getUniqueUserString(digit){
	var l = useuniquechars.length;
	re = '';
	while(true){
		re += useuniquechars.charAt(Math.floor(Math.random()*l));
		if(re.length >= digit){
			if(fs.existsSync(__dirname + '/users/' + re)){
				re = '';
			}
			else{
				try{
					fs.mkdirSync(__dirname + '/users/' + re, '0777');
					fs.mkdirSync(__dirname + '/users/' + re + '/dash', '0777');
				}catch(e){
					re = '';
					continue;
				}
				break;
			}
		}
	}
	return re;
}
function getUniqueDashString(psnid){
	var psn = '';
	try{
		psn = fs.readFileSync(__dirname + '/users/'+psnid+'/data.json');
	}catch(e){
		return '';
	}
	var json = JSON.parse(psn);
	json.imgseq = parseInt(json.imgseq) + 1;
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/users/'+psnid+'/data.json', JSON.stringify(json));
		}catch(e){
			if(count>=10){
				return '';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return json.imgseq;
}
function getUniqueChatString(digit){
	var l = useuniquechars.length;
	re = '';
	while(true){
		re += useuniquechars.charAt(Math.floor(Math.random()*l));
		if(re.length >= digit){
			if(fs.existsSync(__dirname + '/room/' + re)){
				re = '';
			}
			else{
				try{
					fs.mkdirSync(__dirname + '/room/' + re, '0777');
				}catch(e){
					re = '';
					continue;
				}
				break;
			}
		}
	}
	return re;
}
function getUniqueTalkString(chatid){
	var cht = '';
	try{
		cht = fs.readFileSync(__dirname + '/room/'+chatid+'/chat.json');
	}catch(e){
		return '';
	}
	var json = JSON.parse(cht);
	json.talkseq = parseInt(json.talkseq) + 1;
	var count = 0;
	while(true){
		count++;
		var sw = true;
		try{
			fs.writeFileSync(__dirname + '/room/'+chatid+'/chat.json', JSON.stringify(json));
		}catch(e){
			if(count>=10){
				return '';
			}
			else
				sw = false;
		}
		if(sw)break;
	}
	return json.talkseq;
}



//Utilities
function arrayContains(needle, source){
	var len = source.length;
	for(var i = 0; i < len; i++){
		if(source[i] == needle){
			return true;
		}
	}
	return false;
}


