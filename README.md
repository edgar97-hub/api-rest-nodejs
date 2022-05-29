# api-rest-nodejs
all queries a ruta localhost:3000/api/posts?=tech,history&sortby=asc&direction=id  

api-server that allows you to query the posts table on the intermediary server "https://api.hatchways.io/assessment/blog/posts?tag=tetch"
This support server "api.hatchways" can only be queried by one tag, ie it does not allow tag queries with multiple parameters.
With which we implement a api-server is developed that handles several parameters, "sortby","direction",tags".
so making requests at the same time takes more time for the server, we opted to implement requests in parallel.
