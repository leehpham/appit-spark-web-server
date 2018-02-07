var mysql = require('mysql');
var express=require('express');
var app=express();
var bodyParser=require('body-parser');
var urlencodedParser=bodyParser.urlencoded({extended: false});

// import the async package to deal with asynchronous db interactions
var async = require('async');

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
            myobj_user=[];
            myobj_user.push({
              uname:result[0].username,
              dob:result[0].dob
              });
            var my_count;
            //my_count=[];
            con.query("SELECT COUNT(*) AS namesCount FROM businesses", function (err, rows, fields) {
            if (err) throw err;
            //console.log(rows[0].namesCount);
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
                //address:result[i].address,
                type:result[i].type,
                //phone:result[i].phone,
                //open_hours:result[i].open_hours,
                //number_of_reviews:result[i].number_of_reviews,
                //average_rating:result[i].average_rating
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

  var numberOfReviews;
  var averageRating;

  var reply = {
    status: true
  };

  async.series([
    // let user insert a review first
    function(callback) {
      // put the values of the variables into the SQL statement using parameter substitution
      var insertReview =  'INSERT INTO reviews(lighting, audio, decoration, staff, comment, average, user_id, business_id) VALUES(?, ?, ?, ?, ?, ?, ?, ?)';
      // since we have multiple subsitutions, use an array
      con.query(insertReview, [lighting, audio, decoration, staff, comment, average, userId, businessId], function(err, result) {
        if(err) {
          reply.status = false;
          response.send(reply);
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
          reply.status = false;
          response.send(reply);
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
        reply.status = false;
        response.send(reply);
        throw err;
      }
      // finally update the new data into the businesses table
      var updateInfo = 'UPDATE businesses SET number_of_reviews = ?, average_rating = ? WHERE business_id = ?';
      con.query(updateInfo, [numberOfReviews, averageRating, businessId], function(err, result) {
        if(err) {
          reply.status = false;
          response.send(reply);
          throw err;
        }
        console.log("Data updated");
        response.send(reply);
      });
  });
});

/*****USERS SEARCH FOR PLACES*****/
app.get('/users/:userId/search', function(request, response) {
  var sql = 'SELECT * FROM businesses WHERE name LIKE "%' + request.query.key + '%"';
  con.query(sql, function(err, result) {
    if (err) throw err;
    var data = [];    
    for (var i = 0; i < result.length; i++) {
      data.push(result[i]);
    }
    console.log(data);
    response.send(data);
  });
});

app.listen(3000, function() {
  console.log("AppIt Web Server is running on port 3000 ...");
});
