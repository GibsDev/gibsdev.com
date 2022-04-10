const request = require("supertest");
const { assert } = require('chai');

const app = require('../app.js');

const pages = [
    '/',
    '/index',
    '/posts',
    '/about',
    '/experience',
    '/style.css',
    '/favicon.svg',
    '/images/about.svg',
    '/images/github.svg',
    '/images/twitter.svg',
    '/images/landscape.svg'
];

// Server tests
describe('HTTP', function () {
    
    let server;
    
    before(() => {
        server = app.listen(3001);
    });

    for (const page of pages) {
        describe('Get ' + page, () => {
            it('should return 200 response code', async () => {
                const response = await request(app).get(page);
                assert.equal(response.status, 200);
            });
        });
    }

    describe('Get /doesnotexist', () => {
        it('should return 404 response code', async () => {
            const response = await request(app).get('/doesnotexist');
            assert.equal(response.status, 404);
        });
    });

    after(() => {
        server.close();
    });
});
