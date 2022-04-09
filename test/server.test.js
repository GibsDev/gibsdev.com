const request = require("supertest");
const { assert } = require('chai');

const app = require('../app.js');
let server;

// Server tests
describe('Server', function () {

    before(() => {
        server = app.listen(3001);
    });

    describe('Get /', () => {
        it('should return 200 response code', async () => {
            const response = await request(app).get("/");
            assert.equal(response.status, 200);
        });
    });

    after(() => {
        server.close();
    });
});
