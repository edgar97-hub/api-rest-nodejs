'use strict';
 

  /**
   *  We create the necessary routes
   *
   */

module.exports = function(app) {
  var todoList = require('../controllers/todoListController');

  // List Routes

  app.route('/api/posts')
    .get(todoList.all_posts);

  app.route('/api/ping')
    .get(todoList.ping);
};
