const express = require('express');
const app = express();
const validUrl = require('valid-url');
const shortid = require('shortid');
const port = 6000 || process.env.port;


app.use(express.json())
app.use(express.urlencoded({extended:true}))
 
 

// Creates a short URL for a single long URL
// To-do : Apply it for array of URLs
//         Link to a database
//         Redirect to original URL from the short one
//         Add search facility
app.post('/shorten', function(req,res){

    var url=req.body.url;
    var msg ="";
    // Checks validity of a URL
    if (!validUrl.isUri(url))
        msg="It doesn't look like a valid URL. Please try again !";
    else
    {
        var obj={ 
                    // Generate a short ID
            short : shortid.generate(),
            original : url
        }
        msg = `${url} shortened as ${obj.short}`;
    }   
    res.send(msg);
})


app.listen(port, function(){
    console.log(`Server listening on ${port}`)
})