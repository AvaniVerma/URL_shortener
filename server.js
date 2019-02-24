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

 


// Link to firebase
var serviceAccount = require("./url-shortener-a50b6-firebase-adminsdk-3hysw-4a7981aa9f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://url-shortener-a50b6.firebaseio.com"
});

// Get a database reference to firebase
var db = admin.database();


// Creates a short URL for a single long URL
// To-do : Redirect to original URL from the short one
//         Add search facility
//          Add checks for repetition of key or original URL
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





// 404 Handler
app.use(function(req,res){
    res.render('404')
})

app.listen(port, function(){
    console.log(`Server listening on ${port}`)
})