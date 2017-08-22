var express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path'),
    fs = require('fs');

var app = express();
var db;
var cloudant;
var fileToUpload;
var dbCredentials = {
    dbName: 'recruit'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');
var multipart = require('connect-multiparty')
var multipartMiddleware = multipart();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/style', express.static(path.join(__dirname, '/views/style')));

var fieldDefinitions;
// development only
if ('development' == app.get('env')) {
    app.use(errorHandler());
}

/* Functions */
function saveDocument(id, document, response) {
    if (id === undefined) id = '';
    db.get(id, {
        revs_info: true
    }, function(err, doc) {
        if (!err) {
            for(var name in document){
                var value = document[name];
                var field = getFieldByName(name);
                //Handle multiselct fields
                if(field && field.multi){
                    var vals = [];
                    if(value instanceof Array || typeof value == 'array'){
                        value.forEach(function(val) {
                            vals.push(val);
                        }, this);
                    } else{
                        vals.push(value);
                    } 
                    doc[name] = vals;
                }else{
                    doc[name] = value;
                }
            }
           

            console.log(JSON.stringify(doc));
            db.insert(doc, id, function(err, doc) {
                if (err) {
                    console.log('Error inserting data\n' + err);
                    response.sendStatus(500);
                }else{
                    response.json(doc);
                    //response.sendStatus(200);
                }
                response.end();
            });
        }
    });
}

function createResponseData(doc) {
    //possibly unnecessary function, only called by get, all it does right now id copy ._id into .id and ignore any fields that are not in the field definition
    var responseData = {
          id: doc._id
    };
    fieldDefinitions.forEach(function(field) {
        if(doc[field.name]) responseData[field.name] = doc[field.name];
        
    }, this);
    return responseData;
}

function sanitizeInput(str) {
    return String(str)
                .replace(/&(?!amp;|lt;|gt;)/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
}

function getFieldByName(name){
    var _field;
    fieldDefinitions.forEach(function(field){
        if(name == field.name){
            _field = field;
            return;
        }
    });
    return _field;
}

function init(){
    initDBConnection();
    console.log('Loading the field definition file.')
    var fieldDefs = fs.readFileSync('./public/scripts/fields.js', 'utf8');
    eval(fieldDefs);    //eval fields.js will create a local variable called fields
    fieldDefinitions = fields; //set global variable to local variable created by fields.js
}

function getDBCredentialsUrl(jsonData) {
    var vcapServices = JSON.parse(jsonData);
    // Pattern match to find the first instance of a Cloudant service in
    // VCAP_SERVICES. If you know your service key, you can access the
    // service credentials directly by using the vcapServices object.
    for (var vcapService in vcapServices) {
        if (vcapService.match(/cloudant/i)) {
            return vcapServices[vcapService][0].credentials.url;
        }
    }
}

function initDBConnection() {
    //When running on Bluemix, this variable will be set to a json object
    //containing all the service credentials of all the bound services
    if (process.env.VCAP_SERVICES) {
        dbCredentials.url = getDBCredentialsUrl(process.env.VCAP_SERVICES);
    } else { //When running locally, the VCAP_SERVICES will not be set

        // When running this app locally you can get your Cloudant credentials
        // from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
        // Variables section for an app in the Bluemix console dashboard).
        // Once you have the credentials, paste them into a file called vcap-local.json.
        // Alternately you could point to a local database here instead of a
        // Bluemix service.
        // url will be in this format: https://username:password@xxxxxxxxx-bluemix.cloudant.com
        dbCredentials.url = getDBCredentialsUrl(fs.readFileSync("vcap-local.json", "utf-8"));
    }

    cloudant = require('cloudant')({url:dbCredentials.url, plugin:'retry', retryAttempts:20, retryTimeout:200});
    
    cloudant.db.create(dbCredentials.dbName, function(err, res) {
        if (err) {
            if(err.statusCode==412){
                console.log("Database '%s' already exists.", dbCredentials.dbName);
            } else {
                console.error(err);
                console.log('Could not create new db: ' + dbCredentials.dbName + ', it might already exist.');
            }
        }
    });

    db = cloudant.use(dbCredentials.dbName);
    test();
}

function test(){
    db.index(function(er, result) {
        if (er) console.error( er);
        
        console.log('The database has %d indexes', result.indexes.length);
        for (var i = 0; i < result.indexes.length; i++) {
            console.log('  %s (%s): %j', result.indexes[i].name, result.indexes[i].type, result.indexes[i].def);
        }
    });

}
/* Request Handlers*/

app.get('/', routes.index); 

app.get('/add', function(request, response) {
    response.render('add.html', { title: 'IBM Analytics ESA Recruitment Tracking' });
});

app.get('/api/opportunities/query', function(request, response) {
    var q = request.query.q||"";
    db = cloudant.use(dbCredentials.dbName);
    var docList = [];
    var i = 0;
    var query = {
                    "selector": {
                        "company_name": {
                        "$regex": q
                        }
                    },
                    "fields": [
                        "_id",
                        "_rev"
                    ],
                    "sort": [
                        {
                            "company_name": "asc"
                        }
                    ]
                }
    db.find( query, function(err, body) {
        if (!err) {
            var len = body.docs.length;
            console.log('total # of docs -> ' + len);
            if(len<1){
                response.write('[]');
                response.end();
            }
            var x = 0;
            body.docs.forEach(function(document) {
                x++;
                db.get(document._id, {
                    revs_info: true
                }, function(err, doc) {
                    if (!err) {
                        var responseData =  createResponseData(doc);
                        docList.push(responseData);
                        i++;
                        if (i >= len) {
                            response.write(JSON.stringify(docList));
                            console.log('ending response...');
                            response.end();
                        }
                    } else {
                        console.log(err);
                    }
                });
            });
            console.log(JSON.stringify(docList));
        } else {
            console.log(err);
        }
    });
});

app.get('/api/opportunities', function(request, response) {
    var view_name = request.query.view||"unassigned_opps";
    db = cloudant.use(dbCredentials.dbName);
    var docList = [];
    var i = 0;
    
    db.view('opps', view_name, function(err, body) {
        if (!err) {
            var len = body.rows.length;
            console.log('total # of docs -> ' + len);
            if(len<1){
                response.write('[]');
                response.end();
            }
            var x = 0;
            body.rows.forEach(function(document) {
                x++;
                db.get(document.id, {
                    revs_info: true
                }, function(err, doc) {
                    if (!err) {
                        var responseData =  createResponseData(doc);
                        docList.push(responseData);
                        i++;
                        if (i >= len) {
                            response.write(JSON.stringify(docList));
                            console.log('ending response...');
                            response.end();
                        }
                    } else {
                        console.log(err);
                    }
                });
            });
            console.log(JSON.stringify(docList));
        } else {
            console.log(err);
        }
    });
});

app.delete('/api/opportunities', function(request, response) {

    console.log("Delete Invoked..");
    var id = request.query.id;
    // var rev = request.query.rev; // Rev can be fetched from request. if
    // needed, send the rev from client
    console.log("Removing document of ID: " + id);
    console.log('Request Query: ' + JSON.stringify(request.query));

    db.get(id, {
        revs_info: true
    }, function(err, doc) {
        if (!err) {
            db.destroy(doc._id, doc._rev, function(err, res) {
                // Handle response
                if (err) {
                    console.log(err);
                    response.sendStatus(500);
                } else {
                    response.sendStatus(200);
                }
            });
        }
    });

});

//Update
app.put('/api/opportunities', function(request, response) {
    var id = request.body.id;
    console.log("Updating opportunity ID : " + id);
    saveDocument(id,request.body, response);
});

//Add
app.post('/api/opportunities', function(request, response) {
    console.log("Creating a new opportunity");
    saveDocument(null, request.body, response);
});

/* Create Server*/
var server = http.createServer(app);
var listener = server.listen(app.get('port'), '0.0.0.0', function() {
    console.log('Express server listening on port ' + app.get('port'));
    });
listener.timeout = 300000;

init();