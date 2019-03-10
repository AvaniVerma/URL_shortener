const validUrl = require('valid-url');
const shortid = require('shortid');

const db = require('../db');

const shortedUrlsRef = db.ref('/shorten_urls');

const store = (url) => {
    const obj = { 
        short : shortid.generate(),
        original : url,
        createdAt: (new Date()).toJSON(),
        visited : 0
    }
    return db.ref('shorten_urls').child(obj.short).set(obj).then(() => obj);
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
        return res.redirect('/');
        res.status(404).send({ message: err.message });
    }
}
