'use strict';

var fetch = require('node-fetch');
var circularJSON = require('circular-json');
const nodeCache = require('node-cache');
const myCache = new nodeCache({ stdTTL: 600 });
var apiHatchways = "https://api.hatchways.io/assessment/blog/posts?tag="

  /**
   *  Get posts by tag and node cache for the request in parallel
   *
   */

exports.all_posts = function(req, res) {

    var tags = req.query.tags;

    // We validate that the tags have been sent
    if(tags){

        var sortBy = req.query.sortBy;
        var direction = req.query.direction;

        var sortByField = "id";
        var directionBy = "asc";

        // If there is the "Sortby" field, we validate that you have no spaces

        if((sortBy) && !(checkHasSpaces(sortBy))){

          // Validate that the field is a string and exists within the predertaminated values array

          var type = checkIsString(sortBy);
          sortBy = sortBy.replace(/\s+/g, '');

          if(type != "string"  || !(["id", "reads", "likes","popularity"].includes(sortBy)) ){

            return res.status(400).send({"error": "sortBy parameter is invalid"})
          }
          sortByField = sortBy;
        }
        
        // If there is the "direction" field, we validate that you have no spaces
        if( (direction) && !(checkHasSpaces(direction))){
                 
          // Validate that the field is a string and exists within the predertaminated values array

          var type = checkIsString(direction);
          direction = direction.replace(/\s+/g, '');

          if(type != "string"  || !(["desc", "asc"].includes(direction)) ){

            return res.status(400).send({"error": "direction parameter is invalid"})
          }
          directionBy = direction;

        }

        // Function for the all request in parallel
        async function getPostData() {

            try {

              // Validate that the values within tags do not have spaces

              var array = tags.split(',');
              array = array.filter(function (el) {
                return el.replace(/\s/g, "") != "";
              });

              // We make parallel requests 

              var fetchReq = array.map((value) => request(value) );
              var allData = await Promise.all(fetchReq);
                
              // The result is combined in just array

              var CombinedObjects = [];
              allData.map(function(element) { 

                CombinedObjects.push(...element.posts);
                
              });

              // We eliminate duplicate posts in reference to the post ID

              var uniqueIds = [];

              var unique = CombinedObjects.filter(element => {
              var isDuplicate = uniqueIds.includes(element.id);
              
                if (!isDuplicate) {
                  uniqueIds.push(element.id);

                  return true;
                }

                return false;
              });

              // Already with the array without duplicate we proceed to order it

              unique.sort(function(a, b) { 
                return (a[sortByField] - b[sortByField]) 
              });

              // The default direction is "ASC"
              unique = sortByDirection(unique , directionBy , sortByField); 

              return res.status(200).json({"posts": unique})

            }
            catch (error) {
                console.log(error);
            }
        }
       
        getPostData();

    }else{

      res.status(400).json({"error": "Tags parameter is required"})

    }



    function checkIsString(value){ 

      return ((Number(value).toString() == "NaN")? "string" : "number" );
  
    }

    function checkHasSpaces(value){ 
  
      return (/^\s*$/.test(value));
    }

    function sortByDirection(unique,directionBy,sortByField){ 
  
      if(directionBy == "asc"){ 
                  
        unique.sort((a, b) => (a[sortByField] > b[sortByField]) ? 1 : -1);
      }else{
        
        unique.sort((a, b) => (a[sortByField] > b[sortByField]) ? -1 : 1);
      }
      return unique;
    }

    async function request(id) {
  
      // Temporary cache implement
      var post = myCache.get('posts?tag=' +id);
  
      if (post == null) {
  
        var response = await fetch(apiHatchways + id);
        response = await response.json();
        myCache.set('posts?tag=' +id, response, 300);
        return  response;
  
      }else{ 
  
        return post;
      }

    }

     
  };

  /**
   *  /api/ping
   *
   */
exports.ping = function(req, res) {
    res.status(200).json({"success": true})
};



 