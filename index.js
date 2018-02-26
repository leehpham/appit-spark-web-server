var mysql = require('mysql');
var express=require('express');
var fs=require('fs');
var app=express();
var bodyParser=require('body-parser');
var util=require('util');
var async = require('async');
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
app.get('/business',function(req,res){
  res.render('business',{qs: req.query})
});
app.get('/delete',function(req,res){
  res.render('delete',{qs: req.query})
});
app.get('/reviews',function(req,res){
  res.render('reviews',{qs: req.query})
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
        var myobj3={credentials:'FALSE'};
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
            myobj_user=[];
            myobj_user.push({
              uname:result[0].username,
              dob:result[0].dob
              });
            var my_count;
            con.query("SELECT COUNT(*) AS namesCount FROM businesses", function (err, rows, fields) {
            if (err) throw err;
            my_count=rows[0].namesCount;
            });
            var myobj_business; var ar;
            con.query("SELECT * FROM businesses", function (err, result, fields) {
            if (err) throw err;
            myobj_business=[];
            for (i = 0; i < my_count; i++) {
              myobj_business.push({
                business_id:result[i].business_id,
                name:result[i].name,
                type:result[i].type
              });
              }
              res.writeHead(200, {'Content-Type': 'application/json'});
              var arr={'credentials':'TRUE','user':myobj_user,'business':myobj_business};
              res.end(JSON.stringify(arr));
              });
          //res.render('login-success',{data: req.body})
        }
        else {
          res.writeHead(200, {'Content-Type': 'application/json'});
          var myobj2={credentials:'FALSE'};
          console.log('No');
          console.log(check);
          res.end(JSON.stringify(myobj2));
          //res.render('login-noemail');
        }
      }
    }
  });
});
app.post('/business',urlencodedParser,function(req,res){
  console.log(req.body);
  var myobj_reviews=[];
  var business_id=req.body.business_id;
  var bid=business_id;
  var count_rev;
  var sql = 'SELECT * FROM businesses WHERE business_id = ?';
  con.query(sql, [bid], function (err, result) {
    if (err) throw err;
    var arr={business_id:result[0].business_id,
    name:result[0].name,
    address:result[0].address,
    type:result[0].type,
    phone:result[0].phone,
    open_hours:result[0].open_hours,
    number_of_reviews:result[0].number_of_reviews,
    average_rating:result[0].average_rating };
    var sql_rev = 'SELECT * FROM reviews WHERE business_id = ?';
    con.query(sql_rev, [bid], function (err_rev, result_rev) {
      if (err_rev) throw err_rev;
    var rev_count='SELECT COUNT(*) AS reviewCount FROM reviews WHERE business_id = ?';
    con.query(rev_count, [bid], function (err_count, result_count) {
      if (err_count) throw err_count;
      if (err) throw err;
      count_rev=result_count[0].reviewCount;
      for (i = 0; i < count_rev; i++) {
    myobj_reviews.push({
      review_id:result_rev[i].review_id,
      lighting:result_rev[i].lighting,
      audio:result_rev[i].audio,
      decoration:result_rev[i].decoration,
      staff:result_rev[i].staff,
      comment:result_rev[i].comment,
      average:result_rev[i].average,
      user_id:result_rev[i].user_id,
      business_id:result_rev[i].business_id
    });
  }
    console.log(myobj_reviews);
    res.writeHead(200, {'Content-Type': 'application/json'});
      var bus_in={'business':arr,'reviews':myobj_reviews};
      res.end(JSON.stringify(bus_in));
  });
  });
  });
});

app.post('/sign-up',urlencodedParser,function(req,res){
  var count_user;
  con.query("SELECT COUNT(*) AS userCount FROM users", function (err, rows, fields) {
  var ucount;
  var finalcount;
  if (err) throw err;
  ucount=rows[0].userCount;
  finalcount=ucount+1;
  console.log(req.body);
  //Make sure on the front end, we get data in the correct format and not NULL
  var user=finalcount;
  var usn=req.body.uname;
  var pwr=req.body.pw;
  var dbo=req.body.dob;
  var eml=req.body.eml;
  var sql_check = 'SELECT * FROM users WHERE email = ?';
  con.query(sql_check, [eml], function (err_check, result_check) {
    if (err_check) throw err_check;
    if (result_check.length==0){
      console.log('User email does not exists');
      var sql_un = 'SELECT * FROM users WHERE username = ?';
      con.query(sql_un, [usn], function (err_un, result_un) {
        if (err_un) throw err_un;
        if (result_un.length==0){
          var sql = "INSERT INTO users (user_id, username, password, dob, email) VALUES ?";
          var values = [[user, usn, pwr, dbo, eml]];
          con.query(sql, [values], function (err, result) {
           if (err) throw err;
           console.log("Number of records inserted: " + result.affectedRows);
           res.writeHead(200, {'Content-Type': 'application/json'});
           var cred={credentials:'TRUE'};
           res.end(JSON.stringify(cred));
           });
        }
        else {
           console.log('Username exists');
           res.writeHead(200, {'Content-Type': 'application/json'});
           var cred_un={credentials:'FALSE', message:'Username Exists'};
           res.end(JSON.stringify(cred_un));
        }
        });
    }
    else {
      check_exists=result_check[0].email;
      console.log(check_exists);
      res.writeHead(200, {'Content-Type': 'application/json'});
      var cred2={credentials:'FALSE', message:'User Exists'};
      res.end(JSON.stringify(cred2));
    }
    });
  });
});

app.post('/delete',urlencodedParser,function(req,res){
  var email=req.body.email;
  var pass=req.body.pw;
  console.log(email);
  console.log(pass);
  var sql_check = 'SELECT * FROM users WHERE email = ?';
  con.query(sql_check, [email], function (err_check, result_check) {
    if (err_check) throw err_check;
    if (result_check.length==0){
      console.log('Does not exists');
      res.writeHead(200, {'Content-Type': 'application/json'});
      var cred_del={credentials:'FALSE'};
      res.end(JSON.stringify(cred_del));
    }
    else {
      console.log('Exists');
      var check_pw=result_check[0].password;
      if (check_pw===pass)
      {
        var sql_delete = "DELETE FROM users WHERE email = ?";
        con.query(sql_delete, [email], function (err, result) {
          if (err) throw err;
          console.log("Number of records deleted: " + result.affectedRows);
          res.writeHead(200, {'Content-Type': 'application/json'});
          var del_succ={credentials:'TRUE'};
          res.end(JSON.stringify(del_succ));
            });
      }
      else {
        res.writeHead(200, {'Content-Type': 'application/json'});
        var del={credentials:'FALSE'};
        res.end(JSON.stringify(del));
      }
    }
  });
});

/*****USERS CREATE REVIEWS*****/
// handle a POST request at the route that let users create reviews
app.post('/reviews',urlencodedParser,function(req,res){
  // retrieve the user's id from the url parameter
  var userId = Number(req.body.user_id);

  // other info will be retrieved from the body of the request
  var businessId = req.body.business_id;
  var lighting = req.body.lighting;
  var audio = req.body.audio;
  var decoration = req.body.decoration;
  var staff = req.body.staff;
  var comment = req.body.comment;
  var average = (lighting + audio + decoration + staff) / 4;

  console.log(businessId);
  console.log(lighting);
  console.log(audio);
  console.log(decoration);
  console.log(staff);
  console.log(comment);

  var numberOfReviews;
  var averageRating;

  var reply = {
    credentials: 'TRUE'
  };

  async.series([
    // let user insert a review first
    function(callback) {
      // put the values of the variables into the SQL statement using parameter substitution
      var insertReview =  'INSERT INTO reviews(lighting, audio, decoration, staff, comment, average, user_id, business_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
      // since we have multiple subsitutions, use an array
      con.query(insertReview, [lighting, audio, decoration, staff, comment, average, userId, businessId], function(err, result) {
        if(err) {
          rep_f4={credentials:'FALSE'};
          res.end(JSON.stringify(rep_f4));
          //reply.status = false;
          //res.send(reply);
          return callback(err);
        }
        console.log("userId " + userId + " inserted 1 review");
        callback();
      });
    },

    // then re-calculate the number of reviews and average rating in the businesses table
    function(callback) {
      var queryInfo = 'SELECT number_of_reviews, average_rating FROM businesses WHERE business_id = ?';
      con.query(queryInfo, businessId, function(err, result) {
        if(err) {
          res.writeHead(200, {'Content-Type': 'application/json'});
          rep_f3={credentials:'FALSE'};
          res.end(JSON.stringify(rep_f3));
          //reply.status = false;
          //res.send(reply);
          return callback(err);
        }
        // "result" is an array containing each row as an object
        numberOfReviews = result[0].number_of_reviews;
        averageRating = result[0].average_rating;
        console.log("current number of reviews of business #" + businessId + ": " + numberOfReviews);
        console.log("current average rating of business #" + businessId + ": " + averageRating);
        averageRating = ((averageRating * numberOfReviews) + average) / (numberOfReviews + 1);
        numberOfReviews++;
        console.log("after update, number of reviews: " + numberOfReviews);
        console.log("after update, average rating: " + averageRating);
        callback();
      });
    }
  ], function(err) {
      if (err) {
        res.writeHead(200, {'Content-Type': 'application/json'});
        rep_f={credentials:'FALSE'};
        res.end(JSON.stringify(rep_f));
        //reply.status = false;
        //res.send(reply);
        throw err;
      }
      // finally update the new data into the businesses table
      var updateInfo = 'UPDATE businesses SET number_of_reviews = ?, average_rating = ? WHERE business_id = ?';
      con.query(updateInfo, [numberOfReviews, averageRating, businessId], function(err, result) {
        if(err) {
          rep_f2={credentials:'FALSE'};
          res.end(JSON.stringify(rep_f2));
          //reply.status = false;
          //res.send(reply);
          throw err;
        }
        console.log("Data updated");
        res.writeHead(200, {'Content-Type': 'application/json'});
        rep={credentials:'TRUE'};
        res.end(JSON.stringify(rep));
      });
  });
});

app.listen(3000, function() {
  console.log("AppIt Web Server is running on port 3000 ...");
});
