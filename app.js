const express = require('express');
const app = express();
var admin = require('firebase-admin');
var port = 1123||process.env.port;


app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', function(req,res){
    res.render('index', {});
})

app.set('view engine', 'hbs')

 
// To-do :  Improve UI of list

const urlShortner = require('./controllers/urlShortnerController');


// Get a database reference to firebase
var db = require('./db');


// Creates a short URL for a single long URL
app.post('/', urlShortner.shorten);


// List all the shortened URLs
app.get('/list', urlShortner.index)

app.get('/favicon.ico', (req, res) => {
    return res.status(404).send();
});


// Redirecting to proper url from short URL
app.get('/:link', urlShortner.find);

// 404 Handler
app.use(function(req,res){
    res.render('404')
})

// Start server
app.listen(port, function(){
    console.log(`Server listening on ${port}`)
})