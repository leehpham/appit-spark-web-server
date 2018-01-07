var mysql = require('mysql');
var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended: false});

// parse application/json
app.use(bodyParser.json());

var con = mysql.createConnection({
  host: "localhost",
  user: "team",
  password: "12App!tsparksql34",
  database: "appit_spark"
});
con.connect(function(err) {
  if (err) throw err;
  });
app.set('view engine','ejs');
app.get('/',function(req,res){
  res.render('index');
});
app.set('view engine','ejs');
app.get('/sign-up',function(req,res){
  res.render('sign-up');
});
app.get('/login',function(req,res){
  res.render('login',{qs: req.query})
});
app.post('/login',urlencodedParser,function(req,res){
  console.log(req.body);
  var pw=req.body.pw;
  var email=req.body.email;
  var sql='SELECT * FROM users WHERE email = ?';
  con.query(sql,[email], function (err, result, fields) {
    if (result) {
      if (result.length==0){
        console.log(result.length);
        res.writeHead(200, {'Content-Type': 'application/json'});
        var myobj3={status:'FALSE'};
        res.end(JSON.stringify(myobj3));
        //res.render('login-noemail');
      }
      else
      {
        console.log(result.length);
        var check=result[0].password;
        console.log(pw);
        if(check===pw)
        {
          res.writeHead(200, {'Content-Type': 'application/json'});
          var myobj={
            uname:result[0].username,
            dob:result[0].dob,
          };
          res.end(JSON.stringify(myobj));
          //res.render('login-success',{data: req.body})
          console.log(myobj)
        }
        else {
          res.writeHead(200, {'Content-Type': 'application/json'});
          var myobj2={status:'FALSE'};
          console.log('No');
          console.log(check);
          res.end(JSON.stringify(myobj2));
          //res.render('login-noemail');
        }
      }
    }
  });
});
app.get('/profile/:name', function(req, res){
  res.render('profile');
});

/*****USERS CREATE REVIEWS*****/
// handle a POST request at the route that let users create reviews
app.post('/users/:userId/reviews', function(request, response) {
  // retrieve the user's id from the url parameter
  var userId = Number(request.params.userId);

  // other info will be retrieved from the body of the request
  var businessId = request.body.businessId;
  var lighting = request.body.lighting;
  var audio = request.body.audio;
  var decoration = request.body.decoration;
  var staff = request.body.staff;
  var comment = request.body.comment;
  var average = (lighting + audio + decoration + staff) / 4;

  var sqlStatement =  'INSERT INTO reviews(lighting, audio, decoration, staff, comment, average, user_id, business_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
  con.query(sqlStatement, [lighting, audio, decoration, staff, comment, average, userId, businessId], function(err, result) {
    if(err) throw err;
    console.log("1 review inserted");
  });

  var reply = {
    userId: userId,
    businessId: businessId,
    lighting: lighting,
    audio: audio,
    decoration: decoration,
    staff: staff,
    comment: comment,
    average: average
  };

  response.send(reply);
});

app.listen(3000, function() {
  console.log("AppIt Web Server is running on port 3000 ...");
});
