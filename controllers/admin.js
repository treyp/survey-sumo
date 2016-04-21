var Promise = require('bluebird');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
var config = require('../config');
var db = require('../db');
var models = require('../models');
var debug = require('debug')('survey-sumo:admin');

// Set up Passport to work with our local db
passport.use(new Strategy(function (email, password, done) {
  debug('Attempting login: ' + email + ' / ' + password);
  models.User.find({
    where: {
      email: email
    }
  }).then(function (user) {
    if (!user) {
      debug('User not found');
      done(null, false);
      return;
    }

    debug('User found: ' + user.email);
    bcrypt.compare(password, user.password, function (err, match) {
      if (!match) {
        debug('User password incorrect');
        done(null, false);
        return;
      }

      debug('User authentication successful');
      done(null, user);
    });
  }).catch(function (err) {
    debug('Login auth failure');
    done(err);
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user.email);
});

passport.deserializeUser(function (email, done) {
  models.User.find({
    where: {
      email: email
    }
  }).then(function (user) {
    done(null, user);
  }).catch(function (err) {
    done(err);
  });
});

function requireLogin(req, res, next) {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Session ID invalid' });
  } else {
    next();
  }
}

function requireBody(req, res, next) {
  if (!req.body) {
    res.status(400).json({ error: 'No data received with request' });
  } else {
    next();
  }
}

function handleDbError(res, promise) {
  return promise.catch(function (error) {
    debug(error);
    res.status(500).json({ error: 'There was an error saving your data' });
  });
}

module.exports = function (app) {
  app.use('/admin', cookieParser(config.COOKIE_SECRET));
  app.use('/admin', session({
    secret: config.COOKIE_SECRET,
    name: 'admin',
    cookie: {
      maxAge: 24 * 60 * 60e3
    },
    resave: false,
    saveUninitialized: true,
    store: db.sessionStore
  }));
  app.use('/admin', passport.initialize());
  app.use('/admin', passport.session());

  // in the next few functions, we will have to save the session with
  // resave disabled before redirecting, per:
  // https://github.com/mweibel/connect-session-sequelize/issues/23

  app.get('/admin', function (req, res) {
    req.session.save(function () {
      if (!req.isAuthenticated()) {
        res.redirect('/admin/login');
      } else {
        res.render('admin', { user: req.user });
      }
    });
  });

  app.get('/admin/login', function (req, res) {
    var error = '';
    if ('loggedout' in req.query) {
      error = '<div class="sign-in-error">Signed out due to inactivity</div>';
    }
    if ('incorrect' in req.query) {
      error = '<div class="sign-in-error">Incorrect email or password</div>';
    }
    res.render('admin-login', { error: error });
  });

  app.post('/admin/login',
    bodyParser.urlencoded({ extended: true }),
    passport.authenticate('local', { failureRedirect: '/admin/login?incorrect' }),
    function (req, res) {
      req.session.save(function () {
        debug('Login successful. Redirecting.');
        res.redirect('/admin');
      });
    });

  app.get('/admin/logout', function (req, res) {
    debug('Logging out');
    req.logout();
    req.session.save(function () {
      res.redirect('/admin');
    });
  });

  // admin backend methods

  app.post('/admin/users', bodyParser.json(), requireLogin, requireBody, function (req, res) {
    var updates;
    switch (req.body.action.toLowerCase()) {
      case 'create':
        handleDbError(res, models.User.create({
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, config.SALT_ROUNDS)
        }).then(function (user) {
          res.json({ email: user.email });
        }));

        break;
      case 'read':
        handleDbError(res, models.User.findAll({
          attributes: ['email'],
          order: 'createdAt ASC'
        }).then(function (users) {
          res.json({ users: users, currentUser: req.user.email });
        }));

        break;
      case 'update':
        updates = { email: req.body.email };
        if (req.body.password) {
          updates.password =
            bcrypt.hashSync(req.body.password, config.SALT_ROUNDS);
        }

        handleDbError(res, models.User.update(updates, {
          where: {
            email: req.body.originalEmail
          }
        }).then(function () {
          res.json({
            email: req.body.email,
            originalEmail: req.body.originalEmail
          });
        }));

        break;
      case 'delete':
        handleDbError(res, models.User.destroy({
          where: {
            email: req.body.email
          }
        }).then(function (rows) {
          res.json({ success: true, rows: rows });
        }));

        break;
      default:
        res.json({ error: 'Invalid action' });
        break;
    }
  });

  app.get('/admin/survey', requireLogin, function (req, res) {
    handleDbError(res, Promise.all([
      models.Question.findAll({ order: 'createdAt ASC' }),
      models.Answer.findAll({ order: 'createdAt ASC' }),
      models.Response.findAll({ attributes: ['QuestionId', 'AnswerId'] })
    ]).then(function (dbResults) {
      res.json({
        questions: dbResults[0],
        answers: dbResults[1],
        responses: dbResults[2]
      });
    }));
  });

  app.get('/admin/responses', requireLogin, function (req, res) {
    handleDbError(res, models.Response.findAll({
      attributes: ['QuestionId', 'AnswerId']
    })).then(function (responses) {
      res.json(responses);
    });
  });

  app.post('/admin/questions', bodyParser.json(), requireLogin, requireBody, function (req, res) {
    var updates = {};
    switch (req.body.action.toLowerCase()) {
      case 'create':
        handleDbError(res, models.Question.create({
          question: req.body.question,
          published: !!req.body.published
        }).then(function (question) {
          res.json(question);
        }));

        break;
      case 'update':
        if (req.body.question !== undefined) {
          updates.question = req.body.question;
        }

        if (req.body.published !== undefined) {
          updates.published = !!req.body.published;
        }

        handleDbError(res, models.Question.update(updates, {
          where: {
            id: req.body.originalId
          }
        }).then(function () {
          return models.Question.find({
            where: {
              id: req.body.originalId
            }
          }).then(function (question) {
            res.json(question);
          });
        }));

        break;
      case 'delete':

        // delete the responses, answers, and the question
        handleDbError(res, models.Question.destroy({
          where: {
            id: req.body.id
          }
        }).then(function (rows) {
          res.json({ success: true, rows: rows });
        }));

        break;
      default:
        res.json({ error: 'Invalid action' });
        break;
    }
  });

  app.post('/admin/answers', bodyParser.json(), requireLogin, requireBody, function (req, res) {
    switch (req.body.action.toLowerCase()) {
      case 'create':
        handleDbError(res, models.Answer.create({
          answer: req.body.answer,
          QuestionId: req.body.QuestionId
        }).then(function (answer) {
          res.json(answer);
        }));

        break;
      case 'update':
        debug(req.body);
        handleDbError(res, models.Answer.update({ answer: req.body.answer }, {
          where: {
            id: req.body.originalId
          }
        }).then(function () {
          return models.Answer.find({
            where: {
              id: req.body.originalId
            }
          }).then(function (answer) {
            res.json(answer);
          });
        }));

        break;
      case 'delete':

        // delete the responses and the answer
        handleDbError(res, models.Answer.destroy({
          where: {
            id: req.body.id
          }
        }).then(function (rows) {
          res.json({ success: true, rows: rows });
        }));

        break;
      default:
        res.json({ error: 'Invalid action' });
        break;
    }
  });
};
