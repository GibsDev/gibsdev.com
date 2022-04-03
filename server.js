const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const { getHtml, getMeta, renderHtml, cacheFile } = require('./mdhtml.js');

const app = express();
const port = 3000;

// Dynamically retreive a list of posts in the /public/posts folder
app.get('/posts', async (req, res) => {
    try {
        // Get the markdown files in the post dir
        const postsDir = path.join(__dirname, 'public/posts');
        const files = await fs.readdir(postsDir);
        // Generate a list of metadata for each markdown file
        const mdMetas = [];
        for (const filename of files) {
            if (filename.endsWith('.md')) {
                const mdFile = path.join(postsDir, filename);
                const meta = await getMeta(mdFile);
                mdMetas.push({
                    filename: mdFile,
                    href: '/posts/' + filename.split('/').pop(),
                    title: meta.title,
                    modified: meta.modified
                });
            }
        }
        // Sort posts by last modified
        mdMetas.sort((a, b) => {
            return b.modified.valueOf() - a.modified.valueOf();
        });
        const lastUpdate = mdMetas[mdMetas.length - 1].modified;

        // The function for when to generate a new html file for /posts
        const updateWhen = async (htmlUpdated) => {
            return lastUpdate.valueOf() > htmlUpdated.valueOf();
        };

        // The function that generates the /posts html
        const generate = async () => {
            // Generate the html content
            let content = '<h1>Posts</h1>';
            for (const mdMeta of mdMetas) {
                content += `<a href="${mdMeta.href}">${mdMeta.title}<br>${mdMeta.modified.toLocaleString()}</a><br><br>`
            }
            const htmlTemplate = (await fs.readFile('./page.html')).toString();
            return renderHtml(content, htmlTemplate, { updateTime: lastUpdate });
        };

        // Set content-type to HTML
        const htmlFile = path.join(__dirname, 'public', 'posts.html');
        await cacheFile(htmlFile, generate, updateWhen);

        res.type('html');
        return res.sendFile(htmlFile);
    } catch (e) {
        console.error(e);
        return res.sendStatus(500);
    }
});

// Display markdown files as text/plain
express.static.mime.define({ 'text/plain': ['md'] });
app.use(express.static('public'));

app.get('*', async (req, res) => {
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
});

// Start the webserver
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
