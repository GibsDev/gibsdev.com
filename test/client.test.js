const { assert } = require('chai');

const puppeteer = require('puppeteer');

const app = require('../app.js');

const PORT = 3002;
const HOME = 'http://localhost:' + PORT + '/';

// Server tests
describe('Client', function () {
    let server;
    let browser;
    let page;

    before(async () => {
        server = app.listen(PORT);
        browser = await puppeteer.launch();
        page = await browser.newPage();
    });

    async function checkNavLink(expectedTitle, expectedUrl) {
        // Start at home page
        await page.goto(HOME);

        // Get links in the navigation bar
        const navLinks = await page.$$('header > nav > a');

        // Find the nav link we are looking for
        let found = false;
        for (const a of navLinks) {
            const linkName = await a.evaluate(elem => elem.innerHTML);
            if (linkName === expectedTitle) {
                // Click the home link
                await Promise.all([
                    page.waitForNavigation(),
                    a.click()
                ]);
                found = true;
                break;
            }
        }
        // Make sure we found the link
        assert(found, 'Could not find link for ' + expectedTitle);

        // Check the page is at the home page
        assert(await page.url() === expectedUrl, 'Landing page is not ' + expectedUrl);

        // Check title
        const title = await page.title();
        assert(title === expectedTitle, 'Title is not ' + expectedTitle);
    }

    // Test links from page.html
    describe('Clicking the home link', () => {
        it('should navigate to / and the title should be Home', async () => {
            await checkNavLink('Home', HOME);
        });
    });

    describe('Clicking the posts link', () => {
        it('should navigate to /posts and the title should be Posts', async () => {
            await checkNavLink('Posts', HOME + 'posts');
        });
    });

    // Check that Posts generates a correct list of of links for posts

    after(() => {
        server.close();
        browser.close();
    });
});
