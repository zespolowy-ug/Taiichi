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
