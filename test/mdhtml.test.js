const { assert } = require('chai');
var rewire = require('rewire');
const mdhtml = rewire('../mdhtml.js');

const fs = require('fs/promises');
const path = require('path');

describe('mdhtml.js', () => {
    describe('getTitle()', () => {
        const getTitle = mdhtml.__get__('getTitle');
        it('should return the first instance of an h1 (#)', async () => {
            const title = 'Title';
            const markdown = `# ${title}`;
            const parsedTitle = getTitle(markdown);
            assert(title === parsedTitle, 'Failed to parse title from markdown');
        });
        it('should only return the first instance of h1 (#)', async () => {
            const firstH1 = 'First';
            const secondH1 = 'Second';
            const markdown = `# ${firstH1}\n\n# ${secondH1}`;
            const parsedTitle = getTitle(markdown);
            assert(parsedTitle === firstH1, 'Failed to parse first title from markdown');
        });
        it('should not return a title if there is whitespace before the h1 ( #)', async () => {
            const title = 'Whitespace';
            const markdown = ` # ${title}`;
            const parsedTitle = getTitle(markdown);
            assert(parsedTitle === null, 'Title should not have a value');
        });
        it('should not return a title if there is no space after the \'#\' (#***)', async () => {
            const title = 'Missing space';
            const markdown = `#${title}`;
            const parsedTitle = getTitle(markdown);
            assert(parsedTitle === null, 'Title should not have a value');
        });
    });

    describe('getMeta()', async () => {

        const getMeta = mdhtml.__get__('getMeta');
        const testFile = path.join(__dirname, 'test.md');
        let timestamp;

        before(async () => {
            await fs.writeFile(testFile, '# Title');
            timestamp = Date.now();
        });

        it('should get the title and modified time of the markdown file', async () => {
            const meta = await getMeta(testFile);
            assert(meta.title === 'Title', 'Title does not match file');
            const timeDiff = Math.abs(meta.modified.valueOf() - timestamp.valueOf());
            assert(timeDiff < 1000, 'File modification time is > 1000ms old');
        });

        it('should throw an error if the file does not end with .md', async () => {
            try {
                await getMeta(testFile.replace('.md', '.txt'));
                assert(false, 'Did not throw an error for non markdown file');
            } catch (__) {}
        });

        after(async () => {
            await fs.unlink(testFile);
        });
    });
});