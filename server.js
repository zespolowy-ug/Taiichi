var express=require("express");
var path = require('path');
var passport   = require('passport');
var session    = require('express-session');
var bodyParser = require('body-parser');
var env = require('dotenv').load();
var exphbs = require('express-handlebars');
var app = express();

var viewsPath = path.join(__dirname, 'app', 'views');
//For Handlebars
app.set('views', viewsPath);
//handlebars - view engine
app.engine('hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: viewsPath + '/layouts/',
    partialsDir: viewsPath + '/partials/',
    helpers: {
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}));

app.set('view engine', '.hbs');

//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// For Passport
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Models
var models = require("./app/models");

//Sync Database
models.sequelize.sync().then(function() {
    console.log('Nice! Database looks fine');
}).catch(function(err) {
    console.log(err, "Something went wrong with the Database Update!");
});

app.post('/projectsList', function(req, res){
    var findUser = function(){
        return models.user.findOne({
            where:{ user_id: req.user.user_id},
            include: [
                {
                    model: models.users_to_projects,
                    include: [{
                        model: models.project
                    }]
                }
            ]
        });
    }

    var projectsData = findUser().then(function(data){

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/projectDetails', function(req, res){
    var projectId = req.param("projectId");

    var findProject = function(){
        return models.project.findOne({
            where : {
            "project_id" : parseInt(projectId)
        },
        include: [
            {
                model: models.board,
                include: [{
                    model: models.task
                }]
            }
        ]
        });
    }

    var projectData = findProject().then(function(data){

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/projectData', function(req, res){
    var projectId = req.param("projectId");

    var findProject = function(){
        return models.project.findOne({
            where : {
                "project_id" : parseInt(projectId)
            }
        });
    }

    var projectData = findProject().then(function(data){

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/projectAdd', function(req, res){
    var projectName = req.param("name");
    var projectColor = req.param("color");

    var createProject = function(){
        return models.project.create({ name: projectName, color: projectColor }).then(projectData => {
                  models.users_to_projects.create({userUserId : req.user.user_id, projectProjectId : projectData.project_id});
                  return projectData;
          });
    };

    var projectData = createProject().then(function(data){
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/projectEdit', function(req, res){
    var projectId = req.param("projectId");
    var projectName = req.param("projectName");
    var projectColor = req.param("projectColor");

    var updateProject = function(){
        return models.project.find({ where: { project_id: projectId } }).then(projectItem => {
            projectItem.updateAttributes({
                name: projectName,
                color: projectColor
            })

              return projectItem;
        });
    };

    var projectData = updateProject().then(function(data){
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

});

app.post('/projectDelete', function(req, res){
    var projectId = req.param("projectId");

    var deleteProject = function(){
        return models.users_to_projects.destroy({
            where : {
                projectProjectId : projectId
            }
        }).then(function(data){
            models.project.destroy({
                where : {
                    project_id : projectId
                }
            })

            return data;
        });
    };

    var projectData = deleteProject().then(function(data){
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

app.post('/boardAdd', function(req, res){
    var boardName = req.param("boardName");
    var projectId = req.param("projectId");

    var createBoard = function(){
        return models.board.create({ name: boardName, projectProjectId: projectId }).then(boardData => {
                  return boardData;
          });
    };

    var boardData = createBoard().then(function(data){
        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });
});

var authRoute = require('./app/routes/auth.js')(app,passport);

//load passport strategies
require('./app/config/passport/passport.js')(passport, models.user);

//PUBLIC FOLDER
app.use("/public", express.static(path.join(__dirname, 'public')));

//Middleware
app.listen(5000, function(err) {
    if (!err)
        console.log("Site is live");
    else console.log(err)
});
