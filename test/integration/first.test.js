const request = require('supertest-session');

const { app } = require('../../app');

const fullTest = false; // process.env.NODE_ENV !== 'production'

describe('GET /api/health', () => {
  it('responds with json', (done) => {
    request(app)
      .get('/api/health')
      .set('Accept', '*/*')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});

describe('GET /api/metrics', () => {
  it('responds with text', (done) => {
    request(app)
      .get('/api/metrics')
      .set('Accept', '*/*')
      .expect('Content-Type', /text\/plain/)
      .expect(200, done);
  });
});

if (fullTest) {
  describe('GET /api/products', () => {
    it('responds with json', (done) => {
      request(app)
        .get('/api/products?from=0&limit=10')
        .set('Accept', '*/*')
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });
}
