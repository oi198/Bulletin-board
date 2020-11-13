const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

var connection;
function handleDisconnect(){
  connection = mysql.createConnection({
    host : '',
    user : '',
    password : '',
    database : ''
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

var userData = {userName: '', userPass: ''};
var createError = '';
var loginError = '';

app.get('/', (req, res) => {
  res.render('top.ejs');
  userData = {userName: '', userPass: ''};
});

app.get('/new', (req, res) => {
  res.render('new.ejs', {createError : createError});
  createError = '';
  userData = {userName: '', userPass: ''};
});

app.get('/login', (req, res) => {
  res.render('login.ejs', {loginError : loginError});
  loginError = '';
  userData = {userName: '', userPass: ''};
});

app.get('/index', (req, res) => {
  if (userData['userName'] == ''){
    res.redirect('/login');
  }else{
    res.render('index.ejs', {userName : userData['userName'], userScore : userData['userScore']});
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
  }else{
    connection.query(
      'select name from users where name = ?;',
      [req.body.userMail],
      (error, results) => {
        if (results == false){
          connection.query(
            'insert into users (mail, pass, name) values (?,?,?);',
            [req.body.userMail, req.body.userPass, req.body.userName],
             (error, results) => {
              createError = '';
              userData = {userMail: req.body.userMail, userPass: req.body.userPass, userName: req.body.userName, userScore: 0};
              mailOptions['to'] = userData['userMail']
              mailOptions['text'] = userData['userName'] + 'さんのアカウントが登録されました。\n下記urlからログインしてください。\n' +
              'https://powerful-fortress-65968.herokuapp.com/index'
              transporter.sendMail(mailOptions);
              res.redirect('/confirm')
            }
          );
        }else{
          createError = '※メールアドレスは既に登録済みです。'
          res.redirect('/new');
        }
      }
    );
  }
});

app.post('/delete', (req, res) => {
  connection.query(
    'delete from users where mail = ? and pass = ? and name = ?;',
    [userData['userMail'], userData['userPass'], userData['userName']],
    (error, results) => {
      res.redirect('/');
    }
  );
});

app.post('/login', (req, res) => {
  connection.query(
    'select * from users where mail = ? and pass = ?;',
    [req.body.userMail, req.body.userPass],
    (error, results) => {
      if (results == false){
        loginError = '※メールアドレスまたはパスワードが正しくありません。';
        res.redirect('/login');
      }else{
        userData = {userMail: results[0]['mail'], userPass: results[0]['pass'], userName: results[0]['name'], userScore: 0};
        res.redirect('/index');
      }
    }
  );
});


app.listen(process.env.PORT || 3000);