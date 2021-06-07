let mysql = require('mysql');
const express = require('express')
const app = express()
var session = require('express-session');
const crypto = require("crypto");
var bodyParser = require('body-parser');
var path = require('path');
const port = 3000
var username;
var uid;
var obj = {};
var sec = false;
var overdue = 0;

app.use(session({
	secret: 'bhop',
	resave: true,
	saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, '/../html'));

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'Raikou',
    password: 'password',
    database: 'test'
});

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/../html/start.html'));
});

app.get('/clogin', function(request, response) {
	response.sendFile(path.join(__dirname + '/../html/login.html'));
});

app.post('/reg', function(request, response) {
	response.sendFile(path.join(__dirname + '/../html/reg.html'));
});

app.post('/alogin', function(request, response) {
	response.sendFile(path.join(__dirname + '/../html/alogin.html'));
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })

  app.post('/register', function(request, response) {
    username = connection.escape(request.body.username);
    var password = connection.escape(request.body.password);
      var encryptedPassword = crypto.createHash('sha256').update(password).digest('base64');
      connection.query('insert into ADMINS(ANAME, PWD) values(?, ?)', [username, encryptedPassword], function (error, results, fields) {
          if (error) {
            response.send({
              "code":400,
              "failed":"error ocurred"
            })
          } else {
            response.redirect('/clogin');
            }
        });
  })

app.post('/auth', function(request, response) {
	var Username = connection.escape(request.body.username);
	var password = connection.escape(request.body.password);
  console.log(username, password);
    connection.query('select * from CLIENTS where UNAME = ?', Username, function (error, results, fields) {
      console.log(Username, password);
        if (error) {
          response.send({
            "code":400,
            "failed":"error ocurred. User not registered. Go back and register yourself."
          })
        } else {
          console.log("pwd");
            if(results.length >0){
              const comparison = (results[0].PWD == crypto.createHash('sha256').update(password).digest('base64'));
              console.log(comparison);
              if(comparison){
                sec=true;
                uid = results[0].UID;
                username=Username;
                console.log(username);
                response.redirect('/cdash');}
                else
                {
                    response.send({
                        "code":204,
                        "success":"login unsuccessful. Press the Back button"
                      })
                }
                  }
            }
      });
})

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/cdash', function(request, response){
  console.log(username);
  if(sec){
  response.sendFile(path.join(__dirname + '/../html/dashboard.html'));}
})

app.get('/adash', function(request, response){
  console.log(username);
  if(sec){
  response.sendFile(path.join(__dirname + '/../html/adash.html'));}
})

app.post('/cavai', function(request, response){
  console.log(username);
  connection.query('select ISBN, NAME from BOOKS where IF_TAKEN = 0', function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('user.ejs', obj);
    }
  })
})

app.post('/add', function(request, response){
  console.log(username);
  connection.query('select ISBN, NAME from BOOKS', function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('abkadd.ejs', obj);
    }
  })
})

app.post('/rembk', function(request, response){
  console.log(username);
  connection.query('select ISBN, NAME from BOOKS', function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('abkrem.ejs', obj);
    }
  })
})

app.post('/bktk', function(request, response)
{
  var isbn = parseInt(request.body.ISBN, 10);
  var nam = connection.escape(request.body.NAME);
  connection.query('insert into REQUESTS(REQUEST_TYPE, ISBN, BOOK, CLIENT_ID, CLIENT, IS_OVERDUE) values(0, ?, ?, ?, ?, ?)', [isbn, nam, uid, username, overdue], function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('suc.html');
    }
  })
})

app.post('/addbk', function(request, response)
{
  var isbn = parseInt(request.body.ISBN, 10);
  var nam = connection.escape(request.body.NAME);
  connection.query('insert into BOOKS(ISBN, NAME, IF_TAKEN) values(?, ?, 0)', [isbn, nam], function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('asuc.html');
    }
  })
})

app.post('/rembook', function(request, response)
{
  var isbn = parseInt(request.body.ISBN, 10);
  connection.query('delete BOOKS, REQUESTS from BOOKS inner join REQUESTS on BOOKS.ISBN=REQUESTS.ISBN where BOOKS.ISBN = ?', isbn, function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('asuc.html');
    }
  })
})

app.post('/bkgv', function(request, response)
{
  var isbn = parseInt(request.body.ISBN, 10);
  var nam = connection.escape(request.body.NAME);
  connection.query('insert into REQUESTS(REQUEST_TYPE, ISBN, BOOK, CLIENT_ID, CLIENT, IS_OVERDUE) values(1, ?, ?, ?, ?, ?)', [isbn, nam, uid, username, overdue], function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('suc.html');
    }
  })
})

app.post('/crem', function(request, response)
{
  var reqid = parseInt(request.body.ReqID, 10);
  connection.query('delete from REQUESTS where ID = ?', reqid, function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('suc.html');
    }
  })
})

app.post('/agv', function(request, response)
{
  var reqid = parseInt(request.body.ReqID, 10);
  connection.query('update BOOKS, REQUESTS set BOOKS.IF_TAKEN=1, BOOKS.TAKEN_ID=REQUESTS.CLIENT_ID, BOOKS.TAKEN_NAME=REQUESTS.CLIENT where REQUESTS.ID = ? and REQUESTS.ISBN=BOOKS.ISBN', reqid, function(error, results, fields){
    if(error)
    {
      throw error;
    }
  })
  connection.query('delete REQUESTS from REQUESTS left join BOOKS on REQUESTS.ISBN=BOOKS.ISBN where REQUESTS.REQUEST_TYPE=0 and BOOKS.IF_TAKEN=1', reqid, function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('asuc.html');
    }
  })
})

app.post('/atk', function(request, response)
{
  var reqid = parseInt(request.body.ReqID, 10);
  connection.query('update BOOKS, REQUESTS set BOOKS.IF_TAKEN=0, BOOKS.TAKEN_ID=NULL, BOOKS.TAKEN_NAME=NULL where REQUESTS.ID = ? and REQUESTS.ISBN=BOOKS.ISBN', reqid, function(error, results, fields){
    if(error)
    {
      throw error;
    }
  })
  connection.query('delete REQUESTS from REQUESTS where ID = ?', reqid, function(error, results, fields){
    if(error)
    {
      throw error;
    }
    else
    {
      response.render('asuc.html');
    }
  })
})


app.post('/cnow', function(request, response){
  console.log(username);
  connection.query('select ISBN, NAME, TAKEN_DATE from BOOKS where TAKEN_NAME = ?', username, function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('book.ejs', obj);
    }
  })
})

app.post('/creq', function(request, response){
  console.log(username);
  connection.query('select ID, ISBN, BOOK, REQUEST_TYPE from REQUESTS where CLIENT = ?', username, function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('creq.ejs', obj);
    }
  })
})

app.post('/retreq', function(request, response){
  console.log(username);
  connection.query('select ID, ISBN, BOOK from REQUESTS where CLIENT = ? and REQUEST_TYPE = 1', username, function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('areqtk.ejs', obj);
    }
  })
})

app.post('/takreq', function(request, response){
  console.log(username);
  connection.query('select ID, ISBN, BOOK from REQUESTS where CLIENT = ? and REQUEST_TYPE = 0', username, function (error, results, fields) {
    if(error)
    {
      throw error;
    }
    else
    {
      obj = {result: results};
                response.render('areqgv.ejs', obj);
    }
  })
})

app.post('/alog', function(request, response){
  
  {
    uid=undefined;
  username=undefined;
  sec=false;
  response.render('start.html');
  }
})

app.post('/aauth', function(request, response) {
	var Username = connection.escape(request.body.username);
	var password = connection.escape(request.body.password);
  console.log(username, password);
    connection.query('select * from ADMINS where ANAME = ?', Username, function (error, results, fields) {
      console.log(Username, password);
        if (error) {
          response.send({
            "code":400,
            "failed":"error ocurred. User not registered. Go back and register yourself."
          })
        } else {
          console.log("pwd");
            if(results.length >0){
              const comparison = (results[0].PWD == crypto.createHash('sha256').update(password).digest('base64'));
              console.log(comparison);
              if(comparison){
                sec=true;
                uid = results[0].UID;
                username=Username;
                console.log(username);
                response.redirect('/adash');}
                else
                {
                    response.send({
                        "code":204,
                        "success":"login unsuccessful. Press the Back button"
                      })
                }
                  }
            }
      });
})