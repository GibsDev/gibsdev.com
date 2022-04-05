const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');

const rawBodyParser = bodyParser.raw({
    inflate: true,
    limit: '100kb',
    type: () => true
});

router.post('/github', rawBodyParser, (req, res) => {
    console.log('Got POST request on github webhook');

    // Validate body sha signatures
    const key = process.env.GITHUB_WEBHOOK_SECRET;
    console.log(key);
    const sha1 = req.headers['x-hub-signature'].split('=')[1];
    const sha256 = req.headers['x-hub-signature-256'].split('=')[1];
    const rawBody = req.body;
    const sha1Check = crypto.createHmac('sha1', key).update(rawBody).digest('hex');
    const sha256Check = crypto.createHmac('sha256', key).update(rawBody).digest('hex');

    let sha1failed = false;
    if (sha1 !== sha1Check) {
        console.log('sha1 header does not match');
        console.log(`header value: ${sha1}`);
        console.log(`calculated value: ${sha1Check}`);
        sha1failed = true;
    }
    let sha256failed = false;
    if (sha256 !== sha256Check) {
        console.log('sha256 header does not match');
        console.log(`header value: ${sha256}`);
        console.log(`calculated value: ${sha256Check}`);
        sha256failed = true;
    }

    // Parse body into json
    const json = JSON.parse(rawBody.toString());

    // Debug if webhook works
    const debug = debug;
    console.log(debug);

    fs.writeFileSync('webhook.log', debug, { flag: 'w+' });

    return res.sendStatus(200);
});

module.exports = router;