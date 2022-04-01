const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const hljs = require('highlight.js');

const app = express();
const port = 3000;

// TODO compile markdown file into html files so we do not need to rerender them each time a page request is made. Keep track of last modified time to determine if we need to rerender

const mdit = require('markdown-it')({
    html: true,
    xhtmlOut: true,
    breaks: true,
    highlight: function (str, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(str, { language: lang }).value;
            } catch (__) { }
        }
        return '';
    }
});

// Retreive information about a given markdown file
async function getMarkdown(markdownFile) {
    try {
        const markdown = (await fs.readFile(markdownFile)).toString();
        // Get first H1 instance of markdown
        let title = markdown.match(/^# .*$/m);
        if (title) {
            // Remove '# ' from the front of the title
            title = title[0].substring(2);
        }
        return [title, markdown, (await fs.stat(markdownFile)).mtime];
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Render a page with the given properties using page.html as a template
async function renderPage({ title, content, modifiedAt }) {
    // Get HTML page skeleton
    const skeleton = (await fs.readFile(path.join(__dirname, 'page.html'))).toString();
    // Replace the body contents with markdown
    let output = skeleton;
    if (modifiedAt) {
        const updateString = modifiedAt.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        output = output.replace(/<span>.*<\/span>/g, `<span>Updated: ${updateString}</span>`);
    }
    if (content) {
        output = output.replace(/<div>.*<\/div>/g, `<div id="content">\n${content}</div>`);
    }
    if (title) {
        output = output.replace(/<title>.*<\/title>/g, `<title>${title}</title>`);
    }
    return output;
}

// Dynamically retreive a list of posts in the /public/posts folder
app.get('/posts', async (req, res) => {
    // Display a list of markdown files in posts dir
    try {
        const postsDir = path.join(__dirname, 'public/posts');
        const dir = await fs.readdir(postsDir);
        const posts = [];
        for (const filename of dir) {
            if (filename.endsWith('.md')) {
                const file = path.join(postsDir, filename);
                const name = filename.substring(0, filename.length - 3);
                const [title, markdown, modifiedAt] = await getMarkdown(file);
                posts.push({
                    href: '/posts/' + name,
                    modifiedAt: modifiedAt.toLocaleDateString(),
                    modifiedAtMs: modifiedAt.valueOf(),
                    title: title
                });
            }
        }
        // Sort posts by last modified
        posts.sort((a, b) => {
            return b.modifiedAtMs - a.modifiedAtMs;
        });
        // Generate the html content
        let content = '<h1>Posts</h1>';
        for (const post of posts) {
            content += `<a href="${post.href}">${post.title}<br>${post.modifiedAt}</a><br><br>`
        }
        // Set content-type to HTML
        res.type('html');
        return res.send(await renderPage({
            title: 'Posts',
            content
        }));
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
    // See if there exists an md file for the path
    const mdFile = path.join(__dirname, 'public', pPath) + '.md';
    const processMd = await getMarkdown(mdFile);
    if (processMd) {
        const [title, markdown, modifiedAt] = processMd;
        // Set content-type to HTML
        res.type('html');
        return res.send(await renderPage({
            title,
            content: mdit.render(markdown),
            modifiedAt: modifiedAt
        }));
    } else {
        return res.status(404);
    }
});

// Start the webserver
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
