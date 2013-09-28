// コンテントスクリプトはページのロード後（多分）に読み込まれる。
// タブの切り替えなどでは再度実行されず、その場合はpopupかbackgroundから
// 処理のトリガーとなる関数を呼ぶような形にしなければならない


// 以下にglobal変数。
// スコープは表示しているページ全体になる（はずな）ので注意
// var _wsmsg_bd = document.getElementsByTagName('body').item(0);
// var _wsmsg_port = null;

// 危険回避のためにも以下のように全体を定義するクラスを作ってスコープを限定した方がよい
function ContentWsmsg(arg){
	this.bd = null;
	this.msg = null;
	this.port = null;
}

// 関数をいくつか登録するならreadyの処理も関数にして最後に呼び出すとよい
ContentWsmsg.prototype.start_page = function(){
	// 以下にコンテンツ初期表示後に一度だけ実行したい処理を記述
	this.init();
	
	var contentid = '_wsmsg_on_content_load';// この名前でbackgroundと接続を確立
	this.port = chrome.extension.connect({name: contentid});
	
	// リスナーを登録
	var _wsmsg_object = this;//リスナー内で参照できるスコープの変数に全体クラスオブジェクトを保持
	this.port.onMessage.addListener(function(msg) {
		// ポップアップが上がったので、データ転送を行う
		// 普通はこれが正常な表示を実現する
		if (msg.name=="_wsmsg_on_popup_to_content"){
			// ポップアップが開いた時にコンテンツの状況が変わっている可能性があるなら毎回readyした方が良い
			_wsmsg_object.ready();
			
			// データをポップアップに転送する
			_wsmsg_object.prove_data();
		}
		// コンテンツ側の準備完了後、backgroundの準備が完了したためデータ転送を行う
		// コンテンツロード中にポップアップが上がった時はこれが正常な表示を実現する
		else if(msg.name == "_wsmsg_prove_content_data"){
			// 基本的にはreadyの内容によってreadyの再実行が必要か変わる
			// ここではコンテンツロード直後にreadyの再呼び出しは不要という判断で
			// もし準備できていなければ実行するという判断になっている
			if(_wsmsg_object.something == null){
				_wsmsg_object.ready();
			}
			
			// データをポップアップに転送する
			_wsmsg_object.prove_data();
		}
		// popup.jsから呼び出され、コンテンツスクリプトにメッセージをポストする。
		// ここで受け取り、処理を実行する
		else if (msg.name == "_wsmsg_notify_message"){
//			send_message(msg.msg);
		}
	});
}

// コンテンツロード後一回だけ実行すればよい処理
ContentWsmsg.prototype.init = function(){
	this.bd = document.getElementsByTagName('body').item(0);
	this.msg = document.createElement('div');
	this.msg.setAttribute('id', '__wsmsg_msg_div');
	this.msg.setAttribute('class', '__wsmsg_msg_class');
//	this.bd.appendChild(this.msg);
}

// ポップアップからデータ取得を指示された時など、
// 現状を整理してデータを再作成する等をする処理
ContentWsmsg.prototype.ready = function(){
}

// データをbackground経由でポップアップに送信する処理
ContentWsmsg.prototype.prove_data = function(){
	// this.bdのようなオブジェクトは送れない。jsonなら大丈夫
//	this.port.postMessage({name: "_wsmsg_on_ready", "dbody": null, "something": this.something, "status":"start"});
}

// 例）ポップアップから指示が来た時に実行される関数
ContentWsmsg.prototype.popup_element_clicked_handler = function(idx){
	// ここにポップアップから指示されたタイミングで実行する処理を書く
	// this.port.postMessageを使えばさらに処理完了後にbackground、popupに
	// 処理を返すことも可能
}
var _wsmsg = new ContentWsmsg();
_wsmsg.start_page();

var messaging_now = '';
function send_message(mess){
	if(messaging_now!=''){
		_wsmsg.msg.innerHTML += '<br/>'+mess;
		return;
	}
	messaging_now = mess;
	
	_wsmsg.msg.style.webkitAnimationName = '__wsmsg_msg_animate';
	_wsmsg.msg.style.webkitAnimationDuration = "3000ms";
	_wsmsg.msg.style.webkitAnimationIterationCount = 1;
	_wsmsg.msg.style.webkitAnimationTimingFunction = "linear";
	setTimeout(function(){
		_wsmsg.msg.innerHTML = '';
		messaging_now='';
	}, 3000);
}
