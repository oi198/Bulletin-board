const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

var connection;
function handleDisconnect(){
  connection = mysql.createConnection({
    host : 'us-cdbr-east-02.cleardb.com',
    user : 'b1c89434724d34',
    password : '35930ca1',
    database : 'heroku_d19328f988137ab'
  });
  connection.connect((error) => {
    if (error) {
      setTimeout(handleDisconnect, 2000);
    }
  });
  connection.on('error', (error) => {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw error;
    }
  });
}

handleDisconnect();

var userData;
var createError;
var loginError;
var threadName;
var threadData;
var threadCreateError;
var threadSearchError;

app.get('/', (req, res) => {
  res.render('top.ejs');
  userData = {'userName':'', 'userPass':''};
});

app.get('/new', (req, res) => {
  res.render('new.ejs', {createError : createError});
  userData = {'userName':'', 'userPass':''};
  createError = '';
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {loginError : loginError});
  userData = {'userName':'', 'userPass':''};
  loginError = '';
});

app.get('/index', (req, res) => {
  if (userData['userName'] == ''){
    res.redirect('/login');
  }else{
    res.render('index.ejs', {userName : userData['userName'], threadSearchError : threadSearchError, threadCreateError : threadCreateError});
  }
  threadSearchError = '';
  threadCreateError = '';
});

app.get('/index2', (req, res) => {
  if (userData['userName'] == ''){
    res.redirect('/login');
  }else{
    res.render('index2.ejs', {userName : userData['userName'], threadName : threadName, threadData : threadData});
  }
});

app.get('/account', (req, res) => {
  if (userData['userName'] == ''){
    res.redirect('/login');
  }else{
    res.render('account.ejs', {userName : userData['userName']})
  }
});

app.post('/create', (req, res) => {
  if (req.body.userPass==''||req.body.userName==''){
    createError = '※すべて記入してください。'
    res.redirect('/new');
  }else if (req.body.userName.length < 4 || req.body.userName.length > 8){
    createError = '※4文字以上8文字以内の名前にしてください。'
    res.redirect('/new');
  }else{
    connection.query(
      'select user_name from users where user_name = ?;',
      [req.body.userName],
      (error, results) => {
        if (results == false){
          connection.query(
            'insert into users (user_name, user_pass) values (?,?);',
            [req.body.userName, req.body.userPass],
             (error, results) => {
              createError = '';
              userData = {'userName': req.body.userName, 'userPass': req.body.userPass};
              res.redirect('/index')
            }
          );
        }else{
          createError = '※そのユーザー名は既に使われています。';
          res.redirect('/new');
        }
      }
    );
  }
});

app.post('/delete', (req, res) => {
  connection.query(
    'delete from users where user_name = ? and user_pass = ?;',
    [userData['userName'], userData['userPass']],
    (error, results) => {
      res.redirect('/');
    }
  );
});

app.post('/login', (req, res) => {
  connection.query(
    'select * from users where user_name = ? and user_pass = ?;',
    [req.body.userName, req.body.userPass],
    (error, results) => {
      if (results == false){
        loginError = '※ユーザー名またはパスワードが正しくありません。';
        res.redirect('/login');
      }else{
        userData = {'userName': results[0]['user_name'], 'userPass': results[0]['user_pass']};
        res.redirect('/index');
      }
    }
  );
});

app.post('/search-thread', (req, res) => {
  if (req.body.threadName.length < 5 || req.body.threadName.length > 8){
    threadSearchError = '※5文字以上8文字以内の名前にしてください。'
    res.redirect('/index');
  }else{
    connection.query(
      'select * from ' + req.body.threadName + ';',
      (error, results) => {
        if (results == undefined){
          threadSearchError = '※検索されたスレッドは存在しません。';
          res.redirect('/index');
        }else{
          threadName = req.body.threadName;
          threadData = results;
          res.redirect('/index2');
        }
      }
    );
  }
});

app.post('/create-thread', (req, res) => {
  if (req.body.threadName.length < 5 || req.body.threadName.length > 8){
    threadCreateError = '※5文字以上8文字以内の名前にしてください。';
    res.redirect('/index');
  }else{
    connection.query(
      'select * from ' + req.body.threadName + ';',
      (error, results) => {
        if (results == undefined){
          connection.query(
            'create table ' + req.body.threadName + ' (user_name text, comment text) default charset=utf8;',
            (error, results) => {
              threadName = req.body.threadName;
              res.redirect('/index2');
            }
          );
        }else{
          threadCreateError = '※そのスレッド名は既に使われています。';
          res.redirect('/index');
        }
      }
    );
  }
});

app.post('/comment', (req, res) => {
  if (req.body.comment == ''){
    res.redirect('/index2');
  }else{
    connection.query(
      'insert into ' + threadName + '(user_name, comment) values (?,?);',
      [userData['userName'], req.body.comment],
      (error, results) => {
        connection.query(
          'select * from ' + threadName + ';',
          (error, results) => {
            threadData = results;
            res.redirect('/index2');
          }
        );
      }
    );
  }
});

app.listen(process.env.PORT || 3000);