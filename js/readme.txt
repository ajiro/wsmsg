nodejsをインストールした環境にこのディレクトリを配置してください。

nvmでのインストール用にpackage.jsonを作成してあります。

起動はnodeコマンドでapp.jsを実行してください


node app.js [port番号] &


このモデルではnodejsの問題点の一つとして良くあげられるシングルスレッドによる処理の弊害を避けるため、non blocking i/oの仕組みでサーバープロセスを実行しています。

具体的には、サーバーは受信後の各処理を子プロセスに実行させ、完了をメッセージで受け取りクライアントへレスポンスします。これにより、他の処理を一つの思い処理のためにブロックしてしまったり、予期せぬエラーの発生とともにサーバープロセスがダウンするなどの事態を防ぐことができます。

ただし、予期せぬ問題の発生によって子プロセスが永久に残ったり、通信処理のクローズが永久に行われないなどのリスクが発生する可能性がありますので、サーバー管理者はそういった問題に対する監視を行う必要があります。


