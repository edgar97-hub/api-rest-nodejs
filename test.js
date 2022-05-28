
//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('./server');
let should = chai.should();


chai.use(chaiHttp);
 
 /*
  * test /GET route posts by tag
  */
  describe('/GET posts by tags', () => {
      it('it should GET all the posts by tag', (done) => {
        chai.request(server)
            .get('/api/posts?tags=tech,history')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('Object');
              done();
            });
      });
  });

  /*
  * Test the /GET route, We will send without the tag parameter
  */
  describe('/GET posts without the tag parameter ', () => {
    it('Server should send in response that the tag is required', (done) => {

      chai.request(server)
          .get('/api/posts?tags=')
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('Object');
                res.body.should.have.property('error');
                //res.body.errors.should.have.property('pages');
            done();
          });
      });

  });

   /*
  * Test the /GET route, We will send a parameter not valid for the "Sortby" field
  *      
  */
   describe('/GET posts with Parameter "Sortby" Not valid ', () => {
    it('Server should send in response that sortBy parameter is invalid', (done) => {

      chai.request(server)
          .get('/api/posts?tags=history,tech&sortBy=likess')
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('Object');
                res.body.should.have.property('error');
            done();
          });
      });
  });

   /*
  * Test the /GET route, We will send a parameter not valid for the "direction" field
  *      
  */
   describe('/GET posts with Parameter "direction" Not valid ', () => {
    it('Server should send in response that direction parameter is invalid', (done) => {

      chai.request(server)
          .get('/api/posts?tags=history,tech&sortBy=likess&direction=w')
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('Object');
                res.body.should.have.property('error');
            done();
          });
      });
  });

