# Continuous deployment of express webserver code using GitHub webhooks

## Problem

Every time I make a change in the source code of my website I need to SSH into the server, pull the most recent changes, and then restart the server (unless it was a simple content update). This is tedious and it should be possible to automate it.

## Solution

Create a portion of the application that catches webhooks from the github repository that will execute the necessary commands to pull the most recent changes from the repo and restart the server.

## More problems

The part of the application responsible for webhooks needs to be _almost_ fully implemented before the server can start updating itself so we are stuck doing it manually until it is complete. This process will probably include quite a few commits that are soley for the purpose of testing the webhooks in deployment.

Also if we commit a bug into the main branch that causes the application to crash, we will not be able to rely on this process to apply the correction to the source code. So we will need to manually SSH in to pull new changes for the correction.

## More solutions

I think the best summary here is just to ignore them. The extra commits aren't that big of a deal, and we will still be accomplishing our goal of reducing the amount of SSH interactions even if our system could potentially break _sometimes_.

## Acknowledgement

It may not be a good idea to do this for a larger project. As you may not want to deploy every change to the master branch. However, you can easily adapt this method to listen for [github deployments](https://docs.github.com/en/developers/webhooks-and-events/webhooks/webhook-events-and-payloads#deployment). In the future I may end up making a new project for exactly that use case.

But for now, in the early stages of this website, I will be making frequent updates and it makes sense just to publish all changes to the master branch.

<hr>

## Registering the webhook in the github repo

Navigate to `https://github.com/<user>/<repo>/settings/hooks` making sure to replace the corresponding values.
For example: [https://github.com/GibsDev/gibsdev.com/settings/hooks](https://github.com/GibsDev/gibsdev.com/settings/hooks)

## Setup the secret key shared between the deployment server and github webhook

In the settings of your webhook, make sure to set a secret key that should only be known to the github webhook and your deployment server.

You can generate one by using the following command: 
``` bash
$ echo "require('crypto').randomBytes(16).toString('hex')" | node -i
```

And place it into a `.env` file if you are using [npm dotenv](https://www.npmjs.com/package/dotenv):

`.env`
```
GITHUB_WEBHOOK_SECRET=<shared key>
```

MAKE SURE TO `.gitignore` IT! You don't want to commit your key!

## Creating the webhook POST handler (with validation)

We can create a separate module that is an instance of an express router that is dedicated for handling webhooks:

`webhooks.js`
``` javascript
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const rawBodyParser = bodyParser.raw({
    inflate: true,
    limit: '100kb',
    type: () => true
});

router.post('/github', rawBodyParser, (req, res) => {

    // Validate body sha signatures
    const key = process.env.GITHUB_WEBHOOK_SECRET;
    const sha1 = req.headers['x-hub-signature'].split('=')[1];
    const sha256 = req.headers['x-hub-signature-256'].split('=')[1];
    // This is a Buffer
    const rawBody = req.body;
    const sha1Check = crypto.createHmac('sha1', key).update(rawBody).digest('hex');
    const sha256Check = crypto.createHmac('sha256', key).update(rawBody).digest('hex');

    // Validate SHA checks from headers
    if (sha1 !== sha1Check) {
        console.error('sha1 header does not match');
        return res.sendStatus(400);
    }
    if (sha256 !== sha256Check) {
        console.error('sha256 header does not match');
        return res.sendStatus(400);
    }

    // Continued later

    return res.sendStatus(200);
});

module.exports = router;
```

Then we can add this to our main express app:

`server.js`
``` javascript
// ...
const webhooks = require('./webhooks.js');
app.use('/webhooks', webhooks);
// ...
```

### Parsing the webhook and acting accordingly

First we need to detect if the master branch has received an update compared to our local repo state.

We will need to be able to execute commands externally from the program so we need to import the `exec` from node `child_process`

``` javascript
const util = require('util');
const exec = util.promisify(require('child_process').exec);
```


Then inside our `github POST` handler from `webhooks.js` continued from above
``` javascript
    // Parse body into json
    const json = JSON.parse(rawBody.toString());

    // Ignore non master branch pushes
    if (json['ref'] !== 'refs/heads/master') {
        return res.send('Push was not on master branch, ignoring');
    }
    
    // Check if the main branch has been updated
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
```

The first thing we do is take the raw body of the request and convert that to JSON. It was necessary to have the raw body so we could verify the github signatures, but now we need to actually examine that data so we need to parse it.

The first thing we do is check to make sure that this webhook push event is actually related to the master branch, because that is what the deployment uses and the only branch we should take action on updates.

Then we check the current commit of the local repository and see if it is different from the newest master branch. If so we perform the udpate by doing a hard reset and pull and restarting the server.

One important thing to keep in mind here is that the HTTP response from express is sent back BEFORE we restart the server so we can finish the handshake with github.

The final version of `webhook.js` after this post was created can be viewed here:
[https://github.com/GibsDev/gibsdev.com/blob/5306f43c54532c99ed0d90aa647a1c95a9202ea5/webhooks.js](https://github.com/GibsDev/gibsdev.com/blob/5306f43c54532c99ed0d90aa647a1c95a9202ea5/webhooks.js)
