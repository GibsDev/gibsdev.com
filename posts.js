const path = require('path');
const fs = require('fs/promises');
const { getMeta, renderHtml, cacheFile } = require('./mdhtml.js');


// Dynamically retreive a list of posts in the /public/posts folder
module.exports = async (req, res, next) => {
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
                let simpleName = filename.split('/').pop();
                simpleName = simpleName.substring(0, simpleName.length - 3);
                mdMetas.push({
                    filename: mdFile,
                    href: '/posts/' + simpleName,
                    title: meta.title,
                    modified: meta.modified
                });
            }
        }
        // Sort posts by last modified
        mdMetas.sort((a, b) => {
            return b.modified.valueOf() - a.modified.valueOf();
        });
        // Get the update time of the html template
        const lastUpdate = mdMetas[0].modified;

        // The function for when to generate a new html file for /posts
        const updateWhen = async (htmlUpdated) => {
            const templateUpdate = (await fs.stat(path.join(__dirname, 'page.html'))).mtime;
            return templateUpdate.valueOf() > htmlUpdated.valueOf()
                || lastUpdate.valueOf() > htmlUpdated.valueOf();
        };

        // The function that generates the /posts html
        const generate = async () => {
            // Generate the html content
            let content = '<h1>Posts</h1>';
            for (const mdMeta of mdMetas) {
                content += `<a href="${mdMeta.href}">${mdMeta.title}<br>${mdMeta.modified.toLocaleString()}</a><br><br>`
            }
            const htmlTemplate = (await fs.readFile('./page.html')).toString();
            return renderHtml(content, htmlTemplate, { updateTime: lastUpdate, title: 'Posts' });
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
};