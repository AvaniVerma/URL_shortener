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
app.use(express.static('views/images')); 

 
// To-do : Add checks for repetition of key or original URL
//         List all the previously shortened URLs




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
    // It it's a single URL, make it an array
    if(!(x.constructor === Array))  arr.push(x);
    else  arr=x;

    // Loop to check if all the URLs are valid, if yes shorten them
    while(arr.length)
    {
        url=arr.shift();
        // console.log(url)
        // Checks validity of a URL
        if (!validUrl.isUri(url))
            msg.push(`${url} doesn't look like a valid URL.`);
        else
        {
        var obj={ 
            // Generate a short ID
            short : shortid.generate(),
            original : url
        }
        
        db.ref(`short/${obj.short}/`).set(obj,function(err){
            if(err==null)
                msg.push(`${url} shortened successfully.`);
            else 
                msg.push(`${url} couldn't be shortened properly. Please try again.`)    
        });
        }
    }   
    res.render('index', {msg : msg});
})



// Redirecting to proper url
app.get('/link/:shortURL', function(req,res){
       var url = req.params.shortURL, link='/',x;
       db.ref('/short/').once('value').then(function(snapshot) {
            x = snapshot.val(); 
            // console.log(x);   
            for (var key in x) {
                if(key==url)
                {
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
app.get('/original/:shortURL', function(req,res){
    console.log("Called");
    var url = req.params.shortURL, link='/',x;
    db.ref('/short/').once('value').then(function(snapshot) {
         x = snapshot.val();    
         for (var key in x) {
             if(key==url)
             {
                 link = x[url].original;
                 res.render('original', {msg: "Here's the original link", found : link});
                 break;
             }
         }
         if(link=='/')
             res.render('original', {msg : "No link found"});          
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