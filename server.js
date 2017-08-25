var express = require("express");
var app = express();
var cfenv = require("cfenv");
var bodyParser = require('body-parser')
var DiscoveryV1 = require('watson-developer-cloud/discovery/v1');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
  extended: false
}))

// parse application/json
app.use(bodyParser.json())

var mydb;


var discovery = new DiscoveryV1({
  username: 'f1ce28ac-6658-44fc-bc53-eca7dec9e0a8',
  password: 'CeDWicrtFkj5',
  version_date: '2017-08-01'
});

function setHeaders(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Cache-Control', 'no-cache');
}

/* Endpoint to greet and add a new visitor to database.
 * Send a POST request to localhost:3000/api/visitors with body
 * {
 * 	"name": "Bob"
 * }
 */
app.get("/api/search/:searchQuery", function(request, response) {
  setHeaders(response);
  //get query string from request
  //TODO: in future would want to make enviornment and collection ids server && environment variables

  discovery.query({
      environment_id: '2dfa1c44-2475-4836-a1f5-fa6bfc8a09da',
      collection_id: '764c749d-7694-4fbf-84fd-cd2b282265f9',
      query: request.params.searchQuery
    },
    function(error, data) {
      if (!error) {
        response.json(data);
      } else {
        response.json("error");
      }


      //figure out what to do with data
    });
});

app.get("/api/search", function(request, response) {
  setHeaders(response);
  //get query string from request
  //TODO: in future would want to make enviornment and collection ids server && environment variables

  discovery.query({
      environment_id: '2dfa1c44-2475-4836-a1f5-fa6bfc8a09da',
      collection_id: '764c749d-7694-4fbf-84fd-cd2b282265f9',
      query: ""
    },
    function(error, data) {
      if (!error) {
        response.json(data);
      } else {
        response.json("error");
      }


      //figure out what to do with data
    });
});




// load local VCAP configuration  and service credentials
var vcapLocal;
try {
  vcapLocal = require('./vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) {}

const appEnvOpts = vcapLocal ? {
  vcap: vcapLocal
} : {}

const appEnv = cfenv.getAppEnv(appEnvOpts);

if (appEnv.services['cloudantNoSQLDB']) {
  // Load the Cloudant library.
  var Cloudant = require('cloudant');

  // Initialize database with credentials
  var cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);

  //database name
  var dbName = 'mydb';

  // Create a new "mydb" database.
  cloudant.db.create(dbName, function(err, data) {
    if (!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });

  // Specify the database we are going to use (mydb)...
  mydb = cloudant.db.use(dbName);
}

//serve static file (index.html, images, css)
app.use(express.static(__dirname + '/views'));



var port = process.env.PORT || 3000
app.listen(port, function() {
  console.log("To view your app, open this link in your browser: http://localhost:" + port);
});
