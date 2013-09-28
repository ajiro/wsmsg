//このスクリプトはpopup.html内で宣言する事
var server = null;
var bg = chrome.extension.getBackgroundPage();
var settingmode = false;
var psnid = null;
jQuery.event.props.push('dataTransfer');
//var host = '192.168.3.128';
//var port = 3000;
//var baseUrl = 'http://192.168.3.128:3000';
var host = '192.168.11.5';
var port = 3000;
var baseUrl = 'http://192.168.11.5:3000';
var imgroll = null;
var chtroll = null;

document.getElementById('chttitle').innerHTML = '<a href="'+baseUrl+'/roomlist" target="_blank">チャットルーム</a>';

//ポップアップ表示したら
chrome.tabs.getSelected(null,function(tab){
	// 以下、background.jsとアプリケーションパイプのような接続を確立する方法
	// ポップアップは画面の表示中が１つのライフサイクルになっている様子
	// コネクションのスコープはどうやらエクステンション内のようなので
	// 接続名はbackground.jsの中で一意であれば良いと思われる。
	// tabsのgetSelectedを使っているが、tabオブジェクトを使わないのであれば
	// Globalに直書きでも構わない
	// http://dev.screw-axis.com/doc/chrome_extensions/ref/api/tabs/Tab/
	var popupid = '_wsmsg_on_popup';//この名前で接続を確立します。
	var port = chrome.extension.connect({name: popupid});
	port.onMessage.addListener(function(msg) {
//		//このリスナーは接続先がpostMessageした時のコールバック関数です。
//		if(msg.name=='_wsmsg_on_ready_to_popup'){//コンテントスクリプト側の準備が完全に整った事を表すメッセージ
//			document.getElementById('_wsmsg_body').innerHTML = msg.something;
//		}
	});
});

// 以下の感じでbackground.jsのリソースを利用できます
// var bg = chrome.extension.getBackgroundPage();
// bg.[function or field name];

// 例）以下のようにbackground.jsを通してコンテンツスクリプトに書かれている
// 処理を実行できる。ポップアップ側のアクション（例えばイベントハンドラ）で
// 下記のような関数を呼び出す。
//function _on_element_click(e){
//	// イベントハンドラならeventオブジェクトから例えばこのように要素のid属性を取得したりして
//	var idx = e.currentTarget.getAttribute('id');
//	
//	// background.jsのリソースへの参照を取り出し
//	var bg = chrome.extension.getBackgroundPage();
//	
//	// 関数などを直接呼び出せる
//	bg._on_popup_element_click(idx);
//}

function getMemberIconDIV(mem){
	var div = document.createElement('div');
	div.setAttribute('id', 'memdiv'+mem.psnid);
	div.setAttribute('class', 'memdiv');
	if(mem.imgurl!=null && mem.imgurl!=''){
		var img = document.createElement('img');
		img.setAttribute('id', 'memimg'+mem.psnid);
		img.setAttribute('class', 'memimg');
		img.setAttribute('src', baseUrl+mem.imgurl);
		div.appendChild(img);
	}
	else{
		var spn = document.createElement('span');
		spn.setAttribute('id', 'memspn'+mem.psnid);
		spn.setAttribute('class', 'memspn');
		spn.innerHTML = mem.nickname;
		div.appendChild(spn);
	}
	return div;
}
function getTalkDIV(talk){
	var div = document.createElement('div');
	div.setAttribute('id', 'talk'+talk.id);
	div.setAttribute('class', 'talkitem');
	var pdiv = document.createElement('div');
	pdiv.setAttribute('class', 'clearfix');
	
	var gdiv = document.createElement('div');
	gdiv.setAttribute('class', 'talkgood');
	var gimg = document.createElement('img');
	gimg.setAttribute('src', 'img/good.png');
	gimg.setAttribute('class', 'gimg');
	gimg.setAttribute('tag', talk.id);
	gimg.addEventListener('click', function(){
		server.good(this.getAttribute('tag'), true);
	});
	gdiv.appendChild(gimg);
	var gspn = document.createElement('span');
	gspn.setAttribute('id', 'gspn'+talk.id);
	gspn.setAttribute('class', 'gspn');
	gspn.innerHTML = talk.good;
	gdiv.appendChild(gspn);
	var adiv = document.createElement('div');
	adiv.setAttribute('class', 'talkalert');
	var aimg = document.createElement('img');
	aimg.setAttribute('src', 'img/alert.png');
	aimg.setAttribute('class', 'aimg');
	aimg.setAttribute('tag', talk.id);
	aimg.addEventListener('click', function(){
		server.alert(this.getAttribute('tag'), true);
	});
	adiv.appendChild(aimg);
	var aspn = document.createElement('span');
	aspn.setAttribute('id', 'aspn'+talk.id);
	aspn.setAttribute('class', 'aspn');
	aspn.innerHTML = talk.alert;
	adiv.appendChild(aspn);
	pdiv.appendChild(adiv);
	pdiv.appendChild(gdiv);
	
	if(talk.imgurl!=null && talk.imgurl!=''){
		var igdiv = document.createElement('div');
		igdiv.setAttribute('class', 'talkimgframe');
		var pimg = document.createElement('img');
		pimg.setAttribute('src', baseUrl+talk.imgurl);
		pimg.setAttribute('class', 'talkimg whenloadtobottom');
//		pimg.addEventListener('load', function(evt){
//			toBottom();
//		});
		igdiv.appendChild(pimg);
		pdiv.appendChild(igdiv);
	}
	var nndiv = document.createElement('div');
	nndiv.setAttribute('class', 'talknickname');
	nndiv.innerHTML = talk.nickname;
	pdiv.appendChild(nndiv);
	div.appendChild(pdiv);
	
	var tdiv = document.createElement('div');
	tdiv.setAttribute('class', 'talkmessage');
	tdiv.innerHTML = talk.texthtml;
	div.appendChild(tdiv);
	
	return div;
	//'<div id="+'" style="">'+talk.nickname+(talk.imgrul==null || talk.imgrul==''?'':'<img src="'+talk.imgrul+'"/>')+'<span style="margin: 0 5px 0 5px;color:#44FF44;"><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="good'+talk.id+'">'+talk.good+'</span><span style="cursor:pointer;" onclick="server.good(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><span style="margin: 0 5px 0 5px;color:#FF4444;"><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', false);event.preventDefault();">▼</span><span id="alert'+talk.id+'">'+talk.alert+'</span><span style="cursor:pointer;" onclick="server.alert(\''+this.roomid+'\', \''+talk.id+'\', true);event.preventDefault();">▲</span></span><div><input type="checkbox" onclick="server.check(\''+this.roomid+'\', \''+talk.id+'\', this.checked);" '+(talk.checkpoint?'checked':'')+' />'+talk.texthtml+'<input type="button" onclick="server.delmsg(\''+this.roomid+'\', \''+talk.id+'\');" value="×"/></div></div>'
}
function getRoomLI(chtid, chtname){
	var li = document.createElement('li');
	li.setAttribute('id', 'crm'+chtid);
	var lbl = document.createElement('label');
	var rd = document.createElement('input');
	rd.setAttribute('type', 'radio');
	rd.setAttribute('name', 'rooms');
	rd.setAttribute('id', 'crmsel'+chtid);
	rd.setAttribute('tag', chtid);
	if(bg.getNowChatId()==chtid){
		rd.checked = true;
		document.getElementById('chatid').innerHTML = chtid;
		document.getElementById('chatname').innerHTML = chtname;
//		server.enter(chtid);
	}
	lbl.appendChild(rd);
	var cnmspn = document.createElement('span');
	cnmspn.innerHTML = chtname;
	lbl.appendChild(cnmspn);
	lbl.appendChild(document.createElement('br'));
	var cidspn = document.createElement('span');
	cidspn.innerHTML = chtid;
	lbl.appendChild(cidspn);
	rd.addEventListener('click', function(evt){
		var iidd = this.getAttribute('tag');
		var dlbtn = document.getElementById('crmdel'+iidd);
		var inps = document.getElementsByTagName('input');
		for(var i = 0; i < inps.length; i++){
			var ti = inps[i];
			if(ti.getAttribute('type')=='button' && ti.getAttribute('id').indexOf('crmdel')==0){
				ti.style.display = 'inline';
			}
		}
		if(this.checked){
			server.enter(iidd);
			$('#settingicon').trigger('click');
			dlbtn.style.display = 'none';
		}
	});
	li.appendChild(lbl);
	var del = document.createElement('input');
	del.setAttribute('id', 'crmdel'+chtid);
	del.setAttribute('type', 'button');
	del.setAttribute('value', '×');
	del.setAttribute('tag', chtid);
	del.addEventListener('click', function(evt){
		server.exit(function(data){
			var tgt = document.getElementById('crm'+data.cid);
			tgt.parentNode.removeChild(tgt);
		}, this.getAttribute('tag'));
	});
	if(chtid==bg.getNowChatId())del.style.display = 'none';
	li.appendChild(del);
	return li
};
function getDashIcon(imgurl, imgid){
	var frm = document.createElement('div');
	frm.setAttribute('class', 'imgicon');
	var img = document.createElement('img');
	img.src = baseUrl+imgurl;
	img.setAttribute('id', imgid);
	frm.appendChild(img);
	return frm;
	
	
//		var delb = document.createElement('input');
//		delb.setAttribute('type', 'button');
//		delb.setAttribute('psnid', data.psnid);
//		delb.setAttribute('imgid', data.dash[i].imgid);
//		delb.onclick = function(){
//			server.delimg(this.getAttribute('psnid'), this.getAttribute('imgid'));
//		};
//		delb.value = '前の画像を削除';
//		finput.appendChild(delb);
//		var br = document.createElement('br');
//		finput.appendChild(br);
};

var galleryfirsttime = true;
function newRoller(len){
	if(len>3){
		imgroll = new Roller({
			id: 'imgview',
			cntid: 'imgcntn',
			displacement: 70,
			autoadjustheight: false,
			autoadjustwidth: false,
			framerate: 60});
		imgroll.setWidth(true);
		imgroll.setOnSkip(function(inertia, fchild, containerx){
			//$('#stat1').html(fchild.attr('tag'));
		});
		imgroll.setOnStop(function(disp, just){
			//$('#stat1').html(disp.attr('tag')+' stopped. just position is '+just);
		});
		imgroll.pretime = new Date().getTime();
	}
	else if(imgroll==null){
		imgroll = {};
		imgroll.pretime = new Date().getTime();
	}
	if(galleryfirsttime){
		$('body').on('mousemove', '#imgview .container', function(evt){
			//ドラッグ時の範囲選択を抑制
			evt.preventDefault();
		});
		$('body').on('mousedown', '#imgview .container img', function(evt){
			//画像ドラッグ時で保存する機能を抑制
			evt.preventDefault();
		});
		$('body').on('touchstart', '#imgview .container img', function(evt){
			//タッチデバイスのclick時に出るカーソルが出なくなるようにclickイベントを出させないため
			evt.preventDefault();
		});
		$('body').on('mouseup', '#imgview .container img', function(evt){
			//click動作をエミュレート（マウス）
			var nowtime = new Date().getTime();
			if(nowtime - imgroll.pretime <= 210){
				if(imgroll==null || !imgroll.moved)onClickDashImage(this);
			}
			imgroll.pretime = nowtime;
		});
		$('body').on('touchend', '#imgview .container img', function(evt){
			//click動作をエミュレート（タッチ）
			var nowtime = new Date().getTime();
			if(nowtime - imgroll.pretime <= 210){
				if(imgroll==null || !imgroll.moved)onClickDashImage(this);
			}
			imgroll.pretime = nowtime;
		});
		galleryfirsttime = false;
	}
}

$(document).ready(function(){
	$('#settingicon').on('click', function(){
		var bd = $('#setting');
		if(settingmode){
			bd.animate({marginLeft: -200},{duration: 200});
		}
		else{
			bd.animate({marginLeft: 0},{duration: 200});
		}
		settingmode = !settingmode;
	});
	$('#usericon').on('dragover', function(evt){
		dragOver(evt);
	});
	$('#usericon').on('drop', function(evt){
		dropPersonImage(evt);
	});
	$('#nickname').on('focusout', function(evt){
		blurNickname(evt);
	});
	$('#newchat').on('click', function(evt){
		clickNewChat(evt);
	});
	$('#imgview').on('dragover', function(evt){
		dragOver(evt);
	});
	$('#imgview').on('drop', function(evt){
		dropDashImage(evt);
	});
	$('#sendnewmessage').on('click', function(evt){
		var nt = document.getElementById('newtext');
		if(nt.value=='')return;
		server.send('', nt.value, '');
		nt.value = '';
		nt.focus();
	});
	$('#enterchat').on('click', function(evt){
		var t = document.getElementById('enterchatid');
		if(t.value=='')return;
		server.enter(t.value);
		t.value = '';
		$('#settingicon').trigger('click');
	});
	$('body').on('load', '.whenloadtobottom', function(evt){
		toBottom();
	});
	$('#newtext').on('keydown', function(evt){
		if(evt.keyCode==0x0d || evt.keyCode==0x0a){
			$('#sendnewmessage').trigger('click');
		}
	});
	
	startChat();
});
function startChat(){
	psnid = bg.getPersonId();
	server = new Wsmsg({host: host, port: port, entercallback: onEnter, newmessagecallback: onNewMessage, notify: onNotify, onupdatetalkcallback: onUpdateTalk, chatmembercallback: onChatMembers});
	server.open();
	if(psnid==null || psnid==''){
		server.start(onStart);
	}
	else
		server.start(onStart, psnid);
}
function onStart(data){
	bg.setPersonId(data.psnid);
	document.getElementById('nickname').value = data.nickname;//!=null&&data.nickname!=''?data.nickname:data.psnid;
	if(data.imgurl!=null && data.imgurl!=''){
		var imgp = document.getElementById('usericon');
		imgp.innerHTML = '';
		var micon = document.createElement('img');
		micon.setAttribute('src', baseUrl + data.imgurl);
		micon.style.width = '70px';
		imgp.appendChild(micon);
	}
	
	var rlen = data.chats.length;
	var rm = document.getElementById('rooms');
	rm.innerHTML = '';
	var ul = document.createElement('ul');
	for(var i = 0; i < rlen; i++){
		var crm = data.chats[i];
		var li = getRoomLI(crm.chtid, crm.chtname);
		ul.appendChild(li);
	}
	rm.appendChild(ul);
	
	var len = data.dash.length;
	if(len>0){
		var finput = document.getElementById('imgcntn');
		finput.innerHTML = '';
		for(var i = 0; i < len; i++){
			var frm = getDashIcon(data.dash[i].imgurl, data.dash[i].imgid);
			finput.appendChild(frm);
		}
		newRoller(len);
	}
	if(bg.getNowChatId()!=null)server.enter(bg.getNowChatId());
}
function dragOver(evt){
	evt.preventDefault();
}
function dropPersonImage(evt){
	var files = evt.dataTransfer.files;
	var disp = document.getElementById("usericon");
	disp.innerHTML = '';
	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		if (!f.type.match('image.*'))continue;
		var reader = new FileReader();
		reader.onerror = function (evt) {
			disp.innerHTML += "error";
		}
		reader.onload = function (evt) {
//			var img = document.createElement('img');
//			img.src = evt.target.result;
//			img.style.width = '70px';
//			disp.appendChild(img);
			
			server.pfile = evt.target.result;
			server.personman(function(data){
				var imgp = document.getElementById('usericon');
				var micon = document.createElement('img');
				micon.setAttribute('src', baseUrl + data.imgurl);
				micon.style.width = '70px';
				imgp.innerHTML = '';
				imgp.appendChild(micon);
			});
		};
		server.pfname = f.name;
		server.pftype = f.type;
		server.pfsize = f.size;
		reader.readAsDataURL(f);
//		disp.innerHTML = "ファイル名 :" + f.name + "ファイルの型:" + f.type + "ファイルサイズ:" + f.size / 1000 + " KB " + "<br />";
	}
	evt.preventDefault();
}
function blurNickname(evt){
	var nick = document.getElementById('nickname');
	server.pnickname = nick.value;
	server.personman(function(data){
		var nick = document.getElementById('nickname');
		nick.value = data.nickname;
	});
}
function clickNewChat(evt){
	var nm = document.getElementById('newchatname');
	if(nm.value=='')return;
	server.newchat(function(data){
		bg.setNowChatId(data.chtid);
		var rm = document.getElementById('rooms');
		var ul = rm.firstChild;
		var li = getRoomLI(data.chtid, data.chtname);
		ul.appendChild(li);
		document.getElementById('newchatname').value = '';
		document.getElementById('chatid').innerHTML = data.chtid;
		document.getElementById('chatname').innerHTML = data.chtname;
		onEnter(data);
	}, nm.value);
	$('#settingicon').trigger('click');
}
function dropDashImage(evt){
	var files = evt.dataTransfer.files;
	for (var i = 0; i < files.length; i++) {
		var f = files[i];
		if (!f.type.match('image.*'))continue;
		var reader = new FileReader();
		reader.onerror = function (evt) {
			alert("error");
		}
		reader.onload = function (evt) {
//			var img = document.createElement('img');
//			img.src = evt.target.result;
//			finput.appendChild(img);
			
			server.dfile = evt.target.result;
			server.upimg(function(data){
				var len = data.dash.length;
				if(len>0){
					var finput = document.getElementById('imgcntn');
					finput.innerHTML = '';
					for(var i = 0; i < len; i++){
						var frm = getDashIcon(data.dash[i].imgurl, data.dash[i].imgid);
						finput.appendChild(frm);
					}
					newRoller(len);
				}
			});
		};
		server.dfname = f.name;
		server.dftype = f.type;
		server.dfsize = f.size;
		reader.readAsDataURL(f);
	}
	evt.preventDefault();
};
function onEnter(data){
	bg.setNowChatId(data.chtid);
	document.getElementById('chatid').innerHTML = data.chtid;
	document.getElementById('chatname').innerHTML = data.chtname;
	var rdo = document.getElementById('crmsel'+data.chtid);
	if(rdo==null){
		var rm = document.getElementById('rooms');
		var ul = rm.firstChild;
		var li = getRoomLI(data.chtid, data.chtname);
		ul.appendChild(li);
	}
	document.getElementById('crmsel'+data.chtid).checked = true;
	
	var cmems = document.getElementById('chatmembers');
	cmems.innerHTML = '';
	if(data.mems!=null){
		var mmlen = data.mems.length;
		for(var i = 0; i < mmlen; i++){
			cmems.appendChild(getMemberIconDIV(data.mems[i]));
		}
	}
	
	var rm = document.getElementById('chatcontainer');
	rm.innerHTML = '';
	if(data.talk!=null){
		var tt = data.talk;
		for(var i = 0; i < tt.length; i++){
			var tdiv = getTalkDIV(tt[i]);
			rm.appendChild(tdiv);
		}
	}
	
	if(chtroll==null){
		chtroll = new Scroller({
			id:'chats',
			cntid:'chatcontainer',
//			barclass: 'bar',
			stopborder: false,
//			handlemode: 0,
			framerate: 60});
		$('#chats').on('touchmove', function(evt){
			evt.preventDefault();
		});
	}
	toBottom();
};
function onNewMessage(data){
	document.getElementById('chatcontainer').appendChild(getTalkDIV(data.dat));
	toBottom();
};
function onClickDashImage(tgt){
	var txt = '<a href="'+tgt.getAttribute('src')+'" target="_blank" class="talkimga"><img src="'+tgt.getAttribute('src')+'" style="height:80px;margin: 4px 0 5px 10px;" class="whenloadtobottom" />';
	server.send('', txt, '');
};
function onUpdateTalk(data){
	talk = data.dat;
	document.getElementById('gspn'+talk.id).innerHTML = talk.good;
	document.getElementById('aspn'+talk.id).innerHTML = talk.alert;
};
function onChatMembers(data, newcommer){
	if(bg.getNowChatId()==data.dat.chtid){
//		var cmems = document.getElementById('chatmembers');
//		cmems.appendChild(getMemberIconDIV(newcommer));
		
		var cmems = document.getElementById('chatmembers');
		var mmlen = server.roommembers.length;
		cmems.innerHTML = '';
		for(var i = 0; i < mmlen; i++){
			cmems.appendChild(getMemberIconDIV(server.roommembers[i]));
		}
	}
	var msg = data.dat.chtname+' [ '+data.dat.chtid+' ] に'+newcommer.nickname+'さんが入室しました';
	onNotify(msg);
}
function onNotify(msg){
//	alert(msg);
//	bg.notify_message(msg);
	send_message(msg);
}
function toBottom(){
	chtroll.setBar();
	chtroll.scrollBottom(2000);
}

var messaging_now = '';
function send_message(mess, dur){
	var d = dur?dur:3000;
	if(messaging_now!=''){
		$('#msg').html($('#msg').html()+'<br/>'+mess);
		return;
	}
	messaging_now = mess;
	$('#msg').css({opacity: "1"}).html(mess).animate({left: '10%'}, {duration:'fast',easing:'easeInCubic',complete: function(){}}).animate({left: '8%'}, {duration:'fast',easing:'easeOutCubic',complete: function(){}}).animate({left: '10%'}, {duration:'fast',easing:'easeInCubic',complete: function(){}});
	setTimeout(function(){$('#msg').animate({opacity:0.01}, {duration:500}).animate({left:'-100%'}, {duration:'fast', complete:function(){$('#msg').html('');messaging_now='';}})}, d);
}

