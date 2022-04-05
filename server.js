require('dotenv').config();

const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');
const express = require('express');
const { getHtml } = require('./mdhtml.js');
const webhooks = require('./webhooks.js');

const { program } = require('commander');

program.option('-d, --dev');
program.parse();
const opts = program.opts();

const app = express();

// HTTP -> HTTPS redirect
if (!opts.dev) {
    app.enable('trust proxy');
    app.use((req, res, next) => {
        req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
    });
}

app.use('/webhooks', webhooks);

// Serve md files as text mime types
express.static.mime.define({ 'text/plain': ['md'] });

app.get('/posts', require('./posts.js'));

const standardGet = async (req, res) => {
    // Parsed path (this is already sanitized of relative directories '.' and '..')
    let pPath = req.path;
    // Direct / to index
    if (pPath === '/') {
        pPath = '/index';
    }
    // Generate and or get an HTML file for this route
    const htmlFile = await getHtml(pPath, { root: path.join(__dirname, 'public') });
    if (!htmlFile) {
        return res.sendStatus(404);
    }
    return res.sendFile(htmlFile);
};

// Display markdown files as text/plain
app.get('/', standardGet);
app.use(express.static('public'));
app.get('*', standardGet);

async function start() {
    let config = null;
    try {
        config = require('./config.json');
    } catch (__) {
        fs.writeFileSync('./config.json', JSON.stringify({
            key: '',
            cert: '',
            ca: ''
        }, null, 4));
        config = require('./config.json');
    }
    if (opts.dev) {
        http.createServer(app).listen(3000, () => console.log('HTTP Server Started'));
    } else {
        try {
            https.createServer({
                key: fs.readFileSync(config.key, 'utf8'),
                cert: fs.readFileSync(config.cert, 'utf8'),
                ca: fs.readFileSync(config.ca, 'utf8')
            }, app).listen(443, () => console.log('HTTPS Server Started'));
            http.createServer(app).listen(80, () => console.log('HTTP Server Started'));
        } catch (e) {
            console.error(e);
            process.exit(1);
        }
    }
}

start();