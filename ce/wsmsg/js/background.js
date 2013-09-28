var _storage = window.localStorage;
var _psnid_key = '_wsmsg_psnid_key_';
var _now_chtid_key = '_wsmsg_chtid_key_';
function setPersonId(obj){
	_storage.setItem(_psnid_key, obj);
}
function getPersonId(){
	var tgt = _storage.getItem(_psnid_key);
	return tgt;
}
function setNowChatId(obj){
	_storage.setItem(_now_chtid_key, obj);
}
function getNowChatId(){
	var tgt = _storage.getItem(_now_chtid_key);
	return tgt;
}

var cport = {};
var tabId = -1;//現在正面にあるタブのID

// 以下のコードでbackground.js側から今正面にあるタブのIDを確認できる
chrome.tabs.onSelectionChanged.addListener(function(tid){
	tabId = tid;
});


// background.jsにjson等のデータをロードしたければ以下のように書く
// このサンプルコードはbackgroundでjqueryを読み込んでおく必要がある
//var jsonData = null;
//$(function(){
//	$.getJSON("loadfile/css.json",function(data){
//		jsonData = data;
//	});
//});

chrome.browserAction.onClicked.addListener(function(){
	window.open('popup.html', 'pop', 'innerWidth = 300, innerHeight = 540, top = 100, left = 200, resizable = no');
});

chrome.extension.onConnect.addListener(function(port) {
	// 接続名を取得し、それによって処理を書き分ける形にする
	var pname = port.name;
	var tid = tabId;
	if(pname=="_wsmsg_on_popup"){//ポップアップ側から接続があった時の処理をここに記述できる
		// ポップアップ側との接続をtabIdの'_'付きで保持しておく
		cport[tid + '_'] = port;
		
		// 例えばポップアップが立ち上がった時にコンテンツスクリプトを発動したい時はこのタイミングでpostMessageする
		// ここでnullチェックを行っているのは、コンテンツスクリプト側で確立するbackground.jsとの接続がまだされて
		// ない場合があるため。
		if(cport[tid]!=null)cport[tid].postMessage({name: "_wsmsg_on_popup_to_content", "result": ''});
		
		// ここでは確立した接続に対してaddListenerをしていない。
		// 理由はポップアップからのbackgroundリソースの利用はpostMessageしなくても
		// 直接呼び出す事が出来るため。
		// 事情により必要であればここでaddListenerをするとよい
	}
	else if(pname=="_wsmsg_on_content_load"){//コンテンツスクリプト側から接続があった時の処理をここに記述できる
		// リスナーの登録が必要
		port.onMessage.addListener(function(msg) {
			if(msg.name=="_wsmsg_on_ready"){//メッセージ名毎に処理をかき分ける。双方コンテンツ
				// 値の保持など必要であればMessageオブジェクトから取得できる
				var dbody = msg.dbody;
				var something = msg.something;
				//ポップアップにコンテントスクリプト側の準備が整った事を表すメッセージを送信
				if(cport[tid + '_']!=null)cport[tid + '_'].postMessage({name: "_wsmsg_on_ready_to_popup", "dbody": dbody, "something": something});
			}
		});
		
		// コンテントスクリプト側との接続を確保（タブ毎に保持）
		cport[tid] = port;
		
		//ポップアップ側の準備ができたため、コンテントスクリプト側に必要な情報を送ってくるようにメッセージを送信
		cport[tid].postMessage({name: "_wsmsg_prove_content_data", "result": ''});
	}
});

// 例）popup.jsから呼び出され、コンテンツスクリプトにメッセージをポストする。
// コンテンツスクリプト側で処理を実行するイメージ。
function notify_message(msg){
	if(cport[tabId]!=null)cport[tabId].postMessage({name: "_wsmsg_notify_message", "msg": msg});
}
