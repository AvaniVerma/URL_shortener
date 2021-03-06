const validUrl = require('valid-url');
const shortid = require('shortid');

const db = require('../db');

const shortedUrlsRef = db.ref('/shorten_urls');


// Creates a new entry if it doesn't exist already, else returns the existing entry
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

    return db.ref('URL_list').child(key).once("value").then(function(snapshot){
        if(snapshot.exists() != true)
            return db.ref('shorten_urls').child(obj.short).set(obj).
                then(db.ref('URL_list').child(key).set(obj.short)).
                then(() => obj);
        else
            return db.ref('shorten_urls').child(snapshot.val()).once("value").then((snp) => snp.val());
    })

}


// Checks if URL is valid or not
const validateUrls = urls => {
    urls.forEach(url => {
        // if(!validUrl.isUri(url)) {
        //     throw new Error('Oops, one of urls is not valid, please try again with valid urls.');
        // }

        var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
        if(!pattern.test(url))
            throw new Error('Oops, one of the URLs is not valid, please try again.');
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
        
        for(var i=0; i<urls.length; i++)
        {
            var domain = urls[i].split("www.");
            if(domain.length > 1)
                urls[i]="https://" + domain[1]; 
        }
        for(i of urls)
            console.log(i)


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
        console.log("GOT :  "+ req.params.link)
        const snaps = await shortedUrlsRef.child(req.params.link).once('value');
        const link = snaps.val();
        if(!link) {
            res.send('The url is not valid');
        }
        
        db.ref(`shorten_urls/` + req.params.link + `/visited`).transaction(function(visited) {
        // visited has never been set, it will be `null`.
             return visited + 1;
        })
        // console.log("Redirecting to : " + link.original)
        res.redirect(link.original)
    } catch(err) {
        console.log(err);
        return res.redirect('/');
        res.status(404).send({ message: err.message });
    }
}
