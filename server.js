var express = require("express");
var app = express();
var port = 3000;
var bodyParser = require('body-parser');
 

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/todoListRoutes.js'); //importing route

routes(app); //register the route
app.listen(port);
console.log('RESTful API server started on: ' + port);

  /**
   *  Any request that is not registered 
   *  on the routes that we will send a message
   */
app.use(function(req, res) {
    res.status(404).send({url: req.originalUrl + ' not found'})
});

module.exports = app