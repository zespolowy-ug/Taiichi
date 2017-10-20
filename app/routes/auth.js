var authController = require('../controllers/authcontroller.js');

module.exports = function(app, passport) {
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dashboard',

        failureRedirect: '/signup'
      }
    ));

    app.post('/signin', passport.authenticate('local-signin', {
        successRedirect: '/dashboard',

        failureRedirect: '/signin'
      }
    ));

    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()){
          return next();
        }
        else{
          res.redirect('/signin');
        }

    }

    app.get('/signup', authController.signup);
    app.get('/signin', authController.signin);

    app.get('/logout', authController.logout);

    app.get('/dashboard', isLoggedIn, authController.dashboard);
    app.get('/project', isLoggedIn, authController.project);

};
