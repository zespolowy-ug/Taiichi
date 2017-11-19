var exports = module.exports = {}
var models = require("../models");

exports.signup = function(req, res) {
    res.render('signup', {layout: 'main'});
}

exports.signin = function(req, res) {
    res.render('signin', {layout: 'main'});
}

exports.dashboard = function(req, res) {
    res.render('dashboard', {layout: 'main'});
}


// exports.project = function(req, res) {
//     res.render('project', {layout: 'main'});
// }


exports.project = function(req, res) {
    var queryBy = req.params.projectId;
    console.log("Get the data for " + queryBy);
    // Some sequelize... :)
    var findProject = function(){
        return models.project.findOne({
            where : {
            "project_id" : parseInt(queryBy)
            }
        });
    }
// .success(function(data) {
//     // Force a single returned object into an array.
//     data = [].concat(data);
//     console.log("Got the data " + JSON.stringify(data));
//     res.send(data);  // This should maybe be res.json instead...
// });


    var projectData = findProject().then(function(data){

        res.setHeader('Content-Type', 'application/json');

        res.send(JSON.stringify({
            data: data || null
        }));
    });

};

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}
