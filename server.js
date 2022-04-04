const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const { getHtml } = require('./mdhtml.js');

const app = express();
const port = 3000;

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

// Start the webserver
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
