### Node.jsとclearDB(MySQL)を使って掲示板を作成しました！

url : https://afternoon-escarpment-47796.herokuapp.com <br>

言語 : html, css , javascript, Node.js, MySQL(clearDB)

#### 機能

+ スレッド検索<br>
 スレッド名を入力すると該当するスレッドを画面に表示します。<br>
 該当するスレッド名が登録されていない場合、「※検索されたスレッドは存在しません。」と画面に表示されます。<br>
 
+ スレッド作成<br>
 スレッド名を入力すると入力した名前の新しいスレッドが作成され、画面に表示されます。<br>
 すでに同じ名前のスレッドが登録されている場合、「※そのスレッド名は既に使われています。」と画面に表示されます。<br>
 
+ コメント
 コメントを送信するとスレッドにコメントしたユーザ名とコメント内容が登録され、ユーザ名とコメントが画面のスレッド上に表示されます。<br>
 
+ 新規登録<br>
 ユーザ名とパスワードを入力するとユーザ情報が登録され、ログイン後の画面が表示されます。<br>
 すでに同じ名前のユーザ名が登録されている場合、「※そのユーザ名は既に使われています。」と画面に表示されます。<br>
 
+ ログイン
 ユーザ名とパスワードを入力するとログイン後の画面が表示されます。<br>
 該当するユーザ名が登録されていない場合やパスワードが異なる場合、「※ユーザー名またはパスワードが正しくありません。」と画面に表示されます。<br>

#### 苦労した点

 + Node.jsでローカルのMySQL(version8.0)にデフォルト設定のまま接続しようとすると、次のエラーが表示されます。<br>
 `Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server;`<br>
 どうやらMySQLがversion8.0にアップデートされる際にMySQLへのログイン時のパスワード認証方法が変更されたようです。<br>
 Node.jsは未だにその変更に対応できていないため、こうしたエラーが発生しました。<br>
 そこで、ローカルでMySQLにログインした際、次のコードを実行します。<br>
 `ALTER USER 'nodeuser'@'localhost' IDENTIFIED WITH mysql_native_password BY 'nodeuser';`<br>
 `FLUSH PRIVILEGES;`<br>
 参考記事 : https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server/50961428<br>
 
 + アプリケーションをherokuにデプロイした際、以下のようなエラーが発生しました。<br>
  `Error: Connection lost: The server closed the connection.`<br>
  clearDBのセキュリティの仕様により、定期的にNode.jsとの接続が切れるようになっているため、こうしたエラーが発生したようです。<br>
  `
  aaaa
  aaaa
  `
  
 
