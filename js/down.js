var fs = require('fs')
  , url = require('url');

process.on('message', function(m){
	if(m.message == 'response'){
		var uobj = url.parse(m.url, true);
		var plen = uobj.pathname.length;
		var lastdem = uobj.pathname.lastIndexOf('/')+1;
		var pth = uobj.pathname.substr(0, lastdem);
		var fnm = uobj.pathname.substr(lastdem, plen);
		var ext = fnm.substr(fnm.lastIndexOf('.')+1, fnm.length);
		
		if(m.url=='/roomlist'){
			fs.readdir(__dirname + '/room', function(err, files){
				if(err){
					process.send({message: 'norfound'});
				}
				else{
					var remsg = '<!DOCTYPE HTML><html lang="ja-JP"><head><meta charset="UTF-8"><title>Chat Room List</title></head><body><ul>';
					for(var i = 0; i < files.length; i++){
						var cht = '';
						try{
							cht = fs.readFileSync(__dirname + '/room/'+files[i]+'/chat.json');
							var cjson = JSON.parse(cht);
							remsg += '<li>'+cjson.chtname+' [ '+cjson.chtid+' ] </li>';
						}catch(e){
							return 'read room error';
						}
					}
					remsg += '</ul></body></html>';
					process.send({message: 'gotimage', ext: 'html', dat: remsg});
				}
			});
		}
		else{
			fs.readFile(__dirname + uobj.pathname, function(err, data) {
				if(!err) {
					process.send({message: 'gotimage', ext: ext, dat: data});
				}
				else {
					process.send({message: 'norfound'});
				}
			});
		}
	}
});







