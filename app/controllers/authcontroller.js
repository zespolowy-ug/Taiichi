var exports = module.exports = {}

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
    // res.render('project');

    res.render('project', {layout: 'main'});
}

exports.logout = function(req, res) {
    req.session.destroy(function(err) {
        res.redirect('/');
    });
}
