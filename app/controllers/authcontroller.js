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

exports.project = function(req, res) {
    var projectId = req.params.projectId;

    res.render('project', {projectId: projectId, layout: 'main'});


};

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        req.logout();
        res.redirect('/');
    });
}
