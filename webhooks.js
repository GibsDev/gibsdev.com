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

    if (sha1 !== sha1Check) {
        console.error('sha1 header does not match');
        console.error(`header value: ${sha1}`);
        console.error(`calculated value: ${sha1Check}`);
        return res.sendStatus(400);
    }
    if (sha256 !== sha256Check) {
        console.error('sha256 header does not match');
        console.error(`header value: ${sha256}`);
        console.error(`calculated value: ${sha256Check}`);
        return res.sendStatus(400);
    }

    // Parse body into json
    const json = JSON.parse(rawBody.toString());

    // TODO check if the main branch has been updated

    return res.sendStatus(200);
});

module.exports = router;