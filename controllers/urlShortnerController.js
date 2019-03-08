const validUrl = require('valid-url');
const shortid = require('shortid');

const db = require('../db');

const shortedUrlsRef = db.ref('shorten_urls');

const store = async (url) => {
    const obj = { 
        short : shortid.generate(),
        original : url,
        createdAt: (new Date()).toJSON(),
        visited : 0
    }
    await db.ref('shorten_urls').child(obj.short).set(obj);
    return obj;
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


exports.index = async (req, res) => {
    try {
        const snapshots = await shortedUrlsRef.once('value');
        res.send(snapshots.val());
    } catch(err) {
        res.status(500).send(err.message);
    }
}

exports.find = async (req, res) => {
    try {
        const snaps = await shortedUrlsRef.child(req.params.link).once('value');
        const link = snaps.val();
        if(!link) {
            throw new Error('Then url is not valid');
        }
        res.redirect(link.original)
    } catch(err) {
        console.log(err);
        res.status(404).send({ message: err.message });
    }
}
