/* var assert = require('assert');

describe('BasicTest', function(){
    describe('Multiplication', function(){
        it('Should equal 15 when 5 is multiplied by 3', function(){
            var result = 5*3
            assert.equal(result, 15);
        });
    })
}) */

var assert = require('assert');
const supertest = require('supertest');
const restify = require('restify');
const { TeamsBot } = require("./teamsBot.js"); 


describe('Teams Bot Integration Tests', function () {
  let server;
  let bot;

  before(function (done) {
    bot = new TeamsBot();
    server = restify.createServer();
    server.use(restify.plugins.bodyParser());
    server.post('/api/messages', (req, res) => {
      bot.run(req, res).then(() => {
        res.end();
      });
    });

    server.listen(3979, () => {
      console.log(`Test server listening on ${server.url}`);
      done();
    });
  });

  after(function (done) {
    server.close(() => {
      console.log('Test server closed');
      done();
    });
  });

  it('should handle incoming messages', function (done) {
    const messagePayload = {
      type: 'message',
      text: 'Hello',
      from: { id: 'user1' },
      locale: 'en-US',
    };

    supertest(server)
      .post('/api/messages')
      .send(messagePayload)
      .expect(200)
      .end((err, res) => {
        assert.isNull(err);
        done();
      });
  });

  it('should handle TeamsMessagingExtensionFetchTask', function (done) {
    const extensionPayload = {
      type: 'invoke',
      name: 'composeExtension/queryLink',
    };

    supertest(server)
      .post('/api/messages')
      .send(extensionPayload)
      .expect(200)
      .end((err, res) => {
        assert.isNull(err);
        done();
      });
  });  

});
