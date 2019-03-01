const express = require('express');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
var admin = require('firebase-admin');
var port = 1123||process.env.port;


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
    if(x.length == 0) res.end();
    // console.log("I received a request")
    
    // It it's a single URL, make it an array
    if(!(x.constructor === Array))  arr.push(x);
    else  arr=x;

    

    // Loop to check if all the URLs are valid, if yes shorten them
    while(arr.length)
    {   
        url=arr.shift();
        // Display appropriate message for incorrect input
        if(validUrl.isUri(url))
        {   var s_var = url.split('/').join('')
                    .split(':').join('')
                    .split('&').join('')
                    .split('?').join('')
                    .split('-').join('')
                    .split('.').join('')
                    .split('$').join('')
                    .split('[').join('')
                    .split(']').join('')
                    .split('#').join('');


        console.log("generating")
        var obj={ 
            // Generate a short ID
            short : shortid.generate(),
            original : url,
            visited : 0
            }
       
        db.ref(`short/${s_var}/`).transaction(function(currentData) {
            if (currentData === null) {
            return obj;
            } else {
            return; // Abort the transaction.
               }
            }, function(error, committed, snapshot) {
                if (error) {
                  console.log('Transaction failed abnormally!', error);
                } else {
                  console.log('Data added!');
                }
        });   
        }
    }
    res.render('index', {msg : `Please visit list of shortened URLs.`});
})



// List all the shortened URLs
app.get('/list', function(req,res){
    var arr=[];
    db.ref('/short/').once('value').then(function(snapshot) {
        x = snapshot.val();   
        
        console.log("out")
        res.render('after_req', {msg : x});
    });
})


// Redirecting to proper url from short URL
app.get('/:link', function(req,res){
       var url = req.params.link, link='/',x;
    //    console.log(url);
       db.ref('/short/').once('value').then(function(snapshot) {
            x = snapshot.val(); 
            // console.log(x);   
            for (var key in x) {
                if(x[key].short==url)
                {                   
                    link = x[key].original;
                    res.redirect(link);
                    break;
                }
            }
            if(link=='/')
                res.redirect('/');          
        });
})


// 404 Handler
app.use(function(req,res){
    res.render('404')
})

// Start server
app.listen(port, function(){
    console.log(`Server listening on ${port}`)
})