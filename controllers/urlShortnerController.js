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
        db.ref('shorten_urls').set({
            [obj.short]: obj
        }, (err, data) => {
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
        
        if(!req.body.url) {
            throw new Error('Please provide url');
        }

        const urls = Array.isArray(req.body.url) ? req.body.url : [ req.body.url ];
        
        validateUrls(urls);
        // wait while all urls beign stored in firebase.
        const shortedUrls = await Promise.all( urls.map(url => store(url)) );
        res.send({ message: 'URL has been posted successfully.', data: shortedUrls });
    } catch(err) {
        res.status(422).send({
            message: err.message
        });
    }
}
