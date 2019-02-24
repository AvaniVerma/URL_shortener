const express = require('express');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
const port = 5000||process.env.port;


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', function(req,res){
    res.render('index', {});
})

app.set('view engine', 'hbs')
app.use(express.static('views/images')); 

 

// Creates a short URL for a single long URL
// To-do : Link to a database
//         Redirect to original URL from the short one
//         Add search facility
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
        console.log(url)
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
        msg.push(obj);
        }
    }   
    res.send(msg);
})

// 404 Handler
app.use(function(req,res){
    res.render('404')
})

app.listen(port, function(){
    console.log(`Server listening on ${port}`)
})