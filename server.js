const express = require('express');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
var admin = require('firebase-admin');
const port = 5000||process.env.port;


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', function(req,res){
    res.render('index', {});
})

app.set('view engine', 'hbs')

 
// To-do : Add checks for repetition of key or original URL
//          Improve the shortened URL so that it works on different search engines
//          Integrate properly
//          Redirect after shortening a URL
//          Improve UI of list




// Link to firebase
var serviceAccount = require("./url-shortener-a50b6-firebase-adminsdk-3hysw-4a7981aa9f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://url-shortener-a50b6.firebaseio.com"
});

// Get a database reference to firebase
var db = admin.database();


// Creates a short URL for a single long URL
app.post('/shorten', function(req,res)
{
    var x=req.body.url,arr=[],msg=[];
    // console.log("I received a request")
    
    // It it's a single URL, make it an array
    if(!(x.constructor === Array))  arr.push(x);
    else  arr=x;

    // Loop to check if all the URLs are valid, if yes shorten them
    while(arr.length)
    {
        url=arr.shift();
        // Display appropriate message for incorrect input
        // Checks validity of a URL
        if (validUrl.isUri(url))
        {
                        console.log("generating")
                        var obj={ 
                            // Generate a short ID
                            short : shortid.generate(),
                            original : url,
                            visited : 0
                        }
                        
                        db.ref(`short/${obj.short}/`).set(obj,function(err){
                            if(err==null)
                                msg.push(`${url} shortened successfully as ${url.short}.`);
                            else 
                                msg.push(`${url} couldn't be shortened properly. Please try again.`)
                        });
      
        }
    } 
    res.render('index', {msg : "Please visit list of shortened URLs."});
})



// List all the shortened URLs
app.get('/list', function(req,res){
    var arr=[];
    db.ref('/short/').once('value').then(function(snapshot) {
        x = snapshot.val();   
        for (var key in x) 
        {
            console.log("in")
            arr.push({
                link : x[key].original,
                short : key,
                visited : x[key].visited
            });             
        }
        console.log("out")
        res.render('after_req', {msg : arr});
    });
})


// Redirecting to proper url from short URL
app.post('/link', function(req,res){
       var url = req.body.shortURL, link='/',x;
       console.log(url);
       db.ref('/short/').once('value').then(function(snapshot) {
            x = snapshot.val(); 
            // console.log(x);   
            for (var key in x) {
                if(key==url)
                {
                    x[url].visited=x[url].visited+1;
                    link = x[url].original;
                    res.redirect(link);
                    break;
                }
            }
            if(link=='/')
                res.redirect('/');          
        });
})


// Find original link from the shortened link
// app.get('/original/?shortURL', function(req,res){
//     console.log("Called");
//     var url = req.query.shortURL, link='/',x;
//     db.ref('/short/').once('value').then(function(snapshot) {
//          x = snapshot.val();    
//          for (var key in x) {
//              if(key==url)
//              {
//                  link = x[url].original;
//                  res.render('original', {msg: "Here's the original link", found : link});
//                  break;
//              }
//          }
//          if(link=='/')
//              res.render('original', {msg : "No link found"});          
//      });
// })



// 404 Handler
app.use(function(req,res){
    res.render('404')
})

// Start server
app.listen(port, function(){
    console.log(`Server listening on ${port}`)
})