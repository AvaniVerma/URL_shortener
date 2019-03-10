const validUrl = require('valid-url');
const shortid = require('shortid');

const db = require('../db');

const store = (url) => {
    const obj = { 
        short : shortid.generate(),
        original : url,
        createdAt: new Date(),
        visited : 0
    }

    return new Promise((resolve, reject) => {
        db.ref(`shorten_urls/${obj.short}`).set(obj
         , (err, data) => {
            if(err) {
                return reject(err);
            }
            resolve(obj);
        });
    })
}

const validateUrls = urls => {
    urls.forEach(url => {
        if(!validUrl.isUri(url)) {
            throw new Error('Oops, one of urls is not valid, please try again with valid urls.');
        }
    })
}

exports.shorten = async (req, res) => {
    try {
        const urls = Array.isArray(req.body.url) ? req.body.url : [ req.body.url ];
        
        for(url in urls)
        {
            if(url.trim().length==0)
            throw new Error('Please provide url');
        }

        validateUrls(urls);
        // wait while all urls beign stored in firebase.
        const shortedUrls = await Promise.all( urls.map(url => store(url)) );
        console.log(shortedUrls);
        res.render('index',{ message: 'URL has been shortened successfully.', msg: shortedUrls });
    } catch(err) {
        res.status(422).send({
            message: err.message
        });
    }
}
