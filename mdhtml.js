// Generates HTML from markdown

const fs = require('fs/promises');
const path = require('path');
const hljs = require('highlight.js');

// Raw markdown to html rendering function
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

/**
 * @param {String} markdown The markdown content as a string
 * @returns The first instance of an h1 tag or null
 */
function getTitle(markdown) {
    // Get title of markdown content (first instance of # (h1))
    let title = markdown.match(/^# .*$/m);
    // Remove '# ' from the front of the title
    if (title) title = title[0].substring(2);
    return title;
}

/**
 * 
 * @param {String} mdFile the filename of the markdown file
 * @returns {obejct} information about a markdown file { String: title, Date: modified }
 */
async function getMeta(mdFile) {
    if (!mdFile.endsWith('.md')) {
        throw new Error(`File ${mdFile} does not have the markdown extension`);
    }
    // Get markdown content
    const markdown = (await fs.readFile(mdFile)).toString();
    const stat = (await fs.stat(mdFile));
    return {
        title: getTitle(markdown),
        modified: stat.mtime
    };
}

/**
 * Generates an html version of the given markdown source file using the page.html template
 * @param mdFile The full name for the markdown source file
 * @param htmlFile The full name for the html output file
 */
async function renderHtmlFromFile(mdFile, htmlFile = path.join(__dirname, 'page.html')) {
    // Get HTML page template
    const template = (await fs.readFile(htmlFile)).toString();
    // Get markdown content
    const markdown = (await fs.readFile(mdFile)).toString();
    const modified = (await fs.stat(mdFile)).mtime;
    // Render the HTML
    const output = renderHtml(markdown, template, { updateTime: modified });
    return output;
}

/**
 * Intended to be used to for static markdown pages
 * @param {String} urlPath the requested path from the url
 * @param {Object} options
 * @param {String} options.root The root path where the urlPath is relative to
 * @returns the string path to the rendered html file
 */
async function getHtml(urlPath, { root = __dirname } = {}) {
    // Full filename of potential html file
    const htmlFile = path.join(root, urlPath + '.html');
    // Full filename of potential markdown file
    const mdFile = path.join(root, urlPath + '.md');

    // Check the state of html and markdown files
    let htmlStat = null;
    try {
        htmlStat = await fs.stat(htmlFile);
    } catch (__) { }
    let mdStat = null;
    try {
        mdStat = await fs.stat(mdFile);
    } catch (__) { }

    // Generate html file
    const render = async () => {
        console.log('rendering new html file');
        return renderHtmlFromFile(mdFile, htmlFile);
    };
    // When should the html be generated
    const updateWhen = async () => {
        return !htmlStat || mdStat.mtime.valueOf() > htmlStat.mtime.valueOf();
    };

    // no markdown file for the given path
    if (!mdStat) {
        return null; // 404
    }
    await cacheFile(htmlFile, render, updateWhen);
    // html exists but no markdown (implicitly handled) -> serve html file
    return htmlFile;
}

/**
 * A function for caching generated assets on disk. Ensures the asset exists on disk.
 * @param {*} filename the filename where the cached asset will live
 * @param {*} renderFunc a function that does the heavy work to generate the file contents and returns it as a string
 * @param {*} updateFunc a function that accepts the date when the file was modified and returns true when the content should be regenerated
 */
async function cacheFile(filename, generateContents, updateCondition) {
    try {
        const stat = await fs.stat(filename);
        if (await updateCondition(stat.mtime)) {
            await fs.writeFile(filename, await generateContents())
        }
    } catch (e) {
        if (e.code === 'ENOENT') {
            await fs.writeFile(filename, await generateContents());
        } else {
            throw e;
        }
    }
    return filename;
}

/**
 * Generates the HTML for a page given a markdown string for content, and an HTML string template
 * @param {String} markdownContent the markdown content as a string
 * @param {String} htmlTemplate the html template as a string
 * @param {Object} options
 * @param {Date} options.updateTime the timestamp for when the mardownContent was last updated
 * @param {Date} options.title what to set the page title to, otherwise tries to get from markdown
 * @returns the html source of the resulting page
 */
function renderHtml(markdownContent, htmlTemplate, { updateTime, title }) {
    // Get the title
    if (!title) {
        title = getTitle(markdownContent);
    }
    // Replace the body contents with markdown
    const mdHtml = mdit.render(markdownContent);
    // Setup output string
    let output = htmlTemplate;
    // Insert modified date
    if (updateTime) {
        const updateString = updateTime.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        output = output.replace(/<span>.*<\/span>/g, `<span>Updated: ${updateString}</span>`);
    }
    // Insert the content
    output = output.replace(/<div>.*<\/div>/g, `<div id="content">${mdHtml}</div>`);
    // Insert the title
    if (title) output = output.replace(/<title>.*<\/title>/g, `<title>${title}</title>`);
    return output;
}

module.exports = {
    getHtml,
    getMeta,
    renderHtml,
    cacheFile
};
