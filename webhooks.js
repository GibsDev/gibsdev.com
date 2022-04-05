const bodyParser = require('body-parser');
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const fs = require('fs');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const rawBodyParser = bodyParser.raw({
    inflate: true,
    limit: '100kb',
    type: () => true
});

router.post('/github', rawBodyParser, async (req, res) => {
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

    // Check if the main branch has been updated

    // Ignore non master branch pushes
    if (json['ref'] !== 'refs/heads/master') {
        return res.send('Push was not on master branch, ignoring');
    }

    try {
        // Get the current head
        const { stdout: currentCommit } = await exec('git rev-parse --branches=master HEAD');

        // Get newest head
        const newestCommit = json['head_commit']['id'];

        if (newestCommit === currentCommit) {
            return res.send('master branch up to date, no action performed');
        }

        // Pull changes
        const pullCommand = 'git reset --hard && git pull';
        const { stdout: pout, stderr: perr } = await exec(pullCommand);
        let output = 'master branch updated, pulling changes...\n';
        output += '$ ' + pullCommand + '\n';
        output += '[stdout]\n' + pout;
        output += '[stderr]\n' + perr;
        output += '\nDone\nServer will restart after this HTTP response';
        
        res.send(output);

        // Restart server
        await exec('npm restart');
    } catch (e) {
        console.error(e);
        return res.status(500).send(e.message);
    }
});

module.exports = router;