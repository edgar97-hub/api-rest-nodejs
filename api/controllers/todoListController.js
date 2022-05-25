'use strict';

var fetch = require('node-fetch');
var CircularJSON = require('circular-json');
const NodeCache = require('node-cache');

const myCache = new NodeCache({ stdTTL: 600 });
var api_hatchways = "https://api.hatchways.io/assessment/blog/posts?tag="

  /**
   *  Get posts by tag and node cache for the request in parallel
   *
   */

exports.all_posts = function(req, res) {

  let posts = myCache.get('allPosts');

    var tags = req.query.tags;

    // We validate that the tags have been sent
    if(tags){

        var sortBy = req.query.sortBy;
        var direction = req.query.direction;

        var sortBy_field = "id";
        var direction_by = "asc";

        // If there is the "Sortby" field, we validate that you have no spaces

        if((sortBy) && !(/^\s*$/.test(sortBy))){

          // Validate that the field is a string and exists within the predertaminated values array

          var type = ((Number(sortBy).toString() == "NaN")? "string" : "number" );
          sortBy = sortBy.replace(/\s+/g, '');

          if(type != "string"  || !(["id", "reads", "likes","popularity"].includes(sortBy)) ){

            return res.status(400).send({"error": "sortBy parameter is invalid"})
          }
          sortBy_field = sortBy;
        }
        
        // If there is the "direction" field, we validate that you have no spaces
        if( (direction) && !(/^\s*$/.test(direction))){
                 
          // Validate that the field is a string and exists within the predertaminated values array

          var type = ((Number(direction).toString() == "NaN")? "string" : "number" );
          direction = direction.replace(/\s+/g, '');

          if(type != "string"  || !(["desc", "asc"].includes(direction)) ){

            return res.status(400).send({"error": "direction parameter is invalid"})
          }
          direction_by = direction;

        }

        // Function for the all request in parallel
        async function getPostData() {


            async function request(id) {

              // Temporary cache implement
              var post = myCache.get('posts?tag=' +id);

              if (post == null) {

                var response = await fetch(api_hatchways + id);
                response = await response.json();
                myCache.set('posts?tag=' +id, response, 300);
                return  response;

              }else{ 

                return post;

              }
            }

          
            try {

              // Validate that the values within tags do not have spaces

              var array = tags.split(',');
              array = array.filter(function (el) {
                return el.replace(/\s/g, "") != "";
              });

              // We make parallel requests 

              var fetchReq = array.map((id) => request(id) );
              var allData = await Promise.all(fetchReq);
                
              // The result is combined in just array

              var CombinedObjects = [];
              allData.map(function(element) { 

                CombinedObjects.push(...element.posts);
                
              });

              // We eliminate duplicate posts in reference to the post ID

              const uniqueIds = [];

              const unique = CombinedObjects.filter(element => {
                const isDuplicate = uniqueIds.includes(element.id);
              
                if (!isDuplicate) {
                  uniqueIds.push(element.id);

                  return true;
                }

                return false;
              });

              // Already with the array without duplicate we proceed to order it

              unique.sort(function(a, b) { 
                return (a[sortBy_field] - b[sortBy_field]) 
              });

              // The default direction is "ASC"

              if(direction_by == "asc"){ 
                
                unique.sort((a, b) => (a[sortBy_field] > b[sortBy_field]) ? 1 : -1);
              }else{
                
                unique.sort((a, b) => (a[sortBy_field] > b[sortBy_field]) ? -1 : 1);
              }

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
     
  };

  /**
   *  /api/ping
   *
   */
exports.ping = function(req, res) {
    res.status(200).json({"success": true})
};



 