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

    var key = url.split('.').join('').split('/').join('').
                    split(':').join('').split('$').join('').
                    split('#').join('').split('?').join('').
                    split('[').join('').split(']').join('').
                    split('=').join('').split('%').join('');

    return db.ref('shorten_urls').child(obj.short).set(obj).
            then(db.ref('URL_list').child(key).set(true)).
            then(() => obj);
}


// Checks if URL is valid or not
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

        // wait while all urls being stored in firebase.
        const shortedUrls = await Promise.all( urls.map(url => store(url)) );
        res.render('index',{ message: 'URL has been shortened successfully.', msg: shortedUrls });
    } catch(err) {
        res.status(422).send({
            message: err.message
        });
    }
}



// Display all the shortened URLs
exports.index = async (req, res) => {
    try {
        const snapshots = await shortedUrlsRef.once('value');
        res.render("after_req", {msg:snapshots.val()})
    } catch(err) {
        res.status(500).send(err.message);
    }
}



// Redirect
exports.find = async (req, res) => {
    try {
        const snaps = await shortedUrlsRef.child(req.params.link).once('value');
        const link = snaps.val();
        if(!link) {
            res.send('The url is not valid');
        }
        res.redirect(link.original)
    } catch(err) {
        console.log(err);
        return res.redirect('/');
        res.status(404).send({ message: err.message });
    }
}
