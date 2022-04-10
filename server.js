// Starts the server from the command line
const fs = require('fs');
const https = require('https');
const http = require('http');

const { program } = require('commander');

program.option('-d, --dev');
program.parse();
const opts = program.opts();

const app = require('./app.js');

// HTTP -> HTTPS redirect
if (!opts.dev) {
    app.enable('trust proxy');
    app.use((req, res, next) => {
        req.secure ? next() : res.redirect('https://' + req.headers.host + req.url)
    });
}

(async () => {
    const onStart = () => {
        console.log('Server Started');
    };

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
        http.createServer(app).listen(3000, onStart);
    } else {
        try {
            https.createServer({
                key: fs.readFileSync(config.key, 'utf8'),
                cert: fs.readFileSync(config.cert, 'utf8'),
                ca: fs.readFileSync(config.ca, 'utf8')
            }, app).listen(443, onStart);
            http.createServer(app).listen(80, onStart);
        } catch (e) {
            console.error(e);
            reject(e);
            process.exit(1);
        }
    }
})();
