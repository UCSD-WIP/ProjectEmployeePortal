var createError = require('http-errors');
var express = require('express');
var db = require('../utils/db.js');
var auth = require('../utils/auth.js');
var passport = require('passport');
var router = express.Router();
var uuid = require('../utils/uuidgen');
var os = require('os');
var _ = require('underscore');

// Auto-register admin account
setTimeout(() => auth.registerAdmin('admin', 'password'), 1000);

// Custom class for handling message errors
class MessageError extends Error {};

/**
 * Returns the message data to be sent in the response
 *
 * @param {Object} req - request data from client
 */
function buildDefaultMessage(req, current_page) {
  let message = {
    title: 'Engineer Your Future',
    current_page: current_page,
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
  }

  return message;
}

function buildStoryMessage(req) {
  if(!req.query.id) {
    return Promise.reject(new MessageError("Id does not exist"));
  }

  let message = Object.assign(buildDefaultMessage(req, "stories"),{
    style:'stylesheets/style_story.css',
  });

  return db.query('select * from Story where id=?', {
    replacements: [req.query.id],
    type:db.QueryTypes.SELECT
  }).then((queryResults) => {
    let story = queryResults[0]

    if(story && story.length != 0) {
      message["story"] = story
      return message;
    }
  });
}

/**
 * Returns the message data to be sent in the `stories` page
 *
 * @param {Object} req - request data from client
 *
 */
function buildStoriesMessage(req, limit, url) {
  let page = req.query.p ? parseInt(req.query.p) : 0;
  let message = Object.assign(buildDefaultMessage(req, "stories"), {
    style: 'stylesheets/style_stories.css',
  });

  return db.query('select * from Story order by timestamp desc limit ? offset ?', {
      replacements: [limit + 1, page * limit],
      type:db.QueryTypes.SELECT,
    }).then((queryResults) => {

      let stories = queryResults;
      if(stories && stories.length != 0) {
        message["stories"] = stories.slice(0, limit);
        message["url"] = url;
        message["page"] = page;
        message["page_prev"] = page > 0 ? page - 1 : null;
        message["page_next"] = stories.length == (limit + 1) ? page + 1 : null;
        return message;
      }
    });
}

/**
 * Returns the message data to be sent in the job
 *
 * @param {Object} req - request data from client
 *
 */
function buildJobsMessage(req, limit, url) {
  let page = req.query.p ? parseInt(req.query.p) : 0;
  let message = Object.assign(buildDefaultMessage(req, "jobs"), {
    style: 'stylesheets/style_jobs.css',
  });

  return db.query('select * from Job where archived = 0 order by timestamp desc limit ? offset ?', {
      replacements: [limit + 1, page * limit],
      type:db.QueryTypes.SELECT,
    }).then((queryResults) => {
      let jobs = queryResults;

      if(jobs && jobs.length != 0) {
        message["jobs"] = jobs.slice(0, limit);
        message["url"] = url;
        message["page"] = page;
        message["page_prev"] = page > 0 ? page - 1 : null;
        message["page_next"] = jobs.length == (limit + 1) ? page + 1 : null;
        return message;
      }
    });
}

function buildJobMessage(req){
  if(!req.query.id) {
    return Promise.reject(new MessageError("Id does not exist"));
  }

  let message = Object.assign(buildDefaultMessage(req, "stories"),{
    style:'stylesheets/style_story.css',
  });

  return db.query('select * from Job where id = ?', {
    replacements: [req.query.id],
    type:db.QueryTypes.SELECT
  }).then((queryResults) => {
    let job = queryResults[0];

    if(job && job.length != 0) {
      message["job"] = job
      return message;
    } else {
      return Promise.reject(new MessageError("Id does not exist"));
    }
  });
}

function buildAdminHomeMessage(req){
  return Object.assign(buildDefaultMessage(req), {
    style:'stylesheets/style_admin_home.css'
  })
}

function buildCreateJobMessage(req){
  return Object.assign(buildDefaultMessage(req), {
    style:'stylesheets/style_create_job.css'
  })
}

function buildEditStoryMessage(req) {
  return Object.assign(buildDefaultMessage(req, "stories"),{
    story: {
      title: "hello",
      description: "world",
      content:"doggos r great"
    }
  });
}

function buildDeleteStoryMessage(req) {
  return Object.assign(buildDefaultMessage(req, "stories"),{
    style: 'stylesheets/style_stories.css',
    story: [
       {
          title: "hello world",
          description: "hope this works"
        },
        {
          title: "hello world 2.0",
          description: "i love corgis"
        }]
  });
}

function buildDeleteJobMessage(req) {
  return Object.assign(buildDefaultMessage(req, "jobs"),{
    style: 'stylesheets/style_jobs.css',
    job: [{
      company_name: "hello",
      position: "world",
      location:"doggos r great",
    }]
  });
}

function buildEditJobMessage(req) {
  return Object.assign(buildDefaultMessage(req, "jobs"),{
    style: 'stylesheets/style_create_job.css',
    job: {
      company_name: "hello",
      position: "world",
      location:"doggos r great",
      job_field:"asdf",
      email:"asdf",
      description:"asdf",
      experience:"asdf"
    }
  });
}

/**
 * Returns the message data to be sent in the index page
 *
 * @param {Object} req - request data from client
 *
 */
function buildIndexMessage(req) {
  let message = Object.assign(buildDefaultMessage(req), {
    style: 'stylesheets/style_index.css',
  });

  return db.query('select * from Story where featured = 1 order by timestamp desc')
    .then((queryResults) => {
      let stories = queryResults[0];

      if(stories && stories.length != 0) {
        message["stories"] = stories;
        return message;
      } else {
        message["stories"] = [];
        return message;
      }
    });
}

/* GET home page. */
router.get('/', function(req, res, next) {
    buildIndexMessage(req)
      .then((message) => {
        res.render('index', message);
      })
      .catch((error) => {
        // Unexpected internal server error
        console.error(error);
        next(createError(500));
      })
});

router.get('/admin_home', function(req, res, next){
  res.render('admin_home', buildAdminHomeMessage(req));
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', buildDefaultMessage(req, "login"));
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', buildDefaultMessage(req, "register"));
});

/* GET logout */
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', "You have successfully logged out");
    res.redirect('/login');
});

/* GET stories page */
router.get('/stories', function(req, res, next) {
  buildStoriesMessage(req, 6, 'stories')
    .then((message) => {
      res.render('stories', message);
    })
    .catch((error) => {
      // Unexpected internal server error
      console.error(error);
      next(createError(500));
    })
});

/* GET jobs page */
router.get('/jobs', function(req, res, next) {
  buildJobsMessage(req, 6, 'jobs')
    .then((message) => {
      res.render('jobs', message);
    })
    .catch((error) => {
      // Unexpected internal server error
      console.error(error);
      next(createError(500));
    })
});

/* GET job page */
router.get('/job', function(req, res, next) {
  buildJobMessage(req)
    .then((message) => {
      res.render('job', message)
    })
    .catch((error) => {
      console.error(error);

      if(error instanceof MessageError) {
        // Error is how the page was retrieved
        next(createError(404));
      } else {
        // Unexpected internal server error
        next(createError(500));
      }
    })});

/* GET about page */
router.get('/about', function(req, res, next) {
  res.render('about', buildDefaultMessage(req, "about"));
});

/* GET story page */
router.get('/story', function(req, res, next){
  buildStoryMessage(req)
    .then((message) => {
      res.render('story', message)
    })
    .catch((error) => {
      console.error(error);

      if(error instanceof MessageError) {
        // Error is how the page was retrieved
        next(createError(404));
      } else {
        // Unexpected internal server error
        next(createError(500));
      }
    });
});

/* GET new job page */
router.get('/post_job', function(req, res, next) {
  res.render('post_job', buildCreateJobMessage(req, "jobs"));
});

/* GET admin discover new page */
router.get('/post_story', function(req, res, next) {
  res.render('post_story', buildDefaultMessage(req, "stories"));
});

/* GET admin current stories page */
router.get('/admin_current_stories', auth.ensureAdminLoggedIn, function(req, res, next) {
  buildStoriesMessage(req, 10, 'admin_current_stories')
    .then((message) => {
      res.render('admin_current_stories', message);
    })
    .catch((error) => {
      // Unexpected internal server error
      console.error(error);
      next(createError(500));
    })
});

/* GET admin current jobs page */
router.get('/admin_current_jobs', function(req, res, next) {
  buildJobsMessage(req, 10, 'admin_current_jobs')
    .then((message) => {
      res.render('admin_current_jobs', message);
    })
    .catch((error) => {
      // Unexpected internal server error
      console.error(error);
      next(createError(500));
    })
});

router.get('/edit_story', function(req, res, next) {
  res.render('edit_story', buildEditStoryMessage(req));
});

router.get('/edit_job', function(req, res, next) {
  res.render('edit_job', buildEditJobMessage(req));
});

router.get('/delete_story', function(req, res, next) {
  res.render('delete_story', buildDeleteStoryMessage(req));
});

router.get('/delete_job', function(req, res, next) {
  res.render('delete_job', buildDeleteJobMessage(req));
});

/* POST login - authenticate user */
router.post('/login', (req, res, next) => {
  db.query("select * from User u, Role r where username = ? and u.role_id = r.id", {
    replacements: [req.body.username],
    type: db.QueryTypes.SELECT
  })
  .then((queryResult) => {
    let user = queryResult[0]
    let successRedirect = '/'

    if(user && user.role_name == "administrator") {
      successRedirect = '/admin_home';
    }

    passport.authenticate('local', {
      successRedirect: successRedirect,
      failureRedirect: '/login',
      failureFlash: true,
      session: true
    })(req, res, next);
  });
});

/* POST register - try to register a new user */
router.post('/register', function(req, res, next) {

  // Check if all fields exist
  if (req.body.username && req.body.password && req.body.password_confirm) {

    // Ensure password and confirmation password match
    if (req.body.password != req.body.password_confirm) {
      req.flash('error', 'Passwords provided do not match');
      return res.redirect('/register');
    }

    // Register a new candidate
    return auth.registerCandidate(req.body.username, req.body.password)
      .then(() => {
        req.flash('success', "Account successfully registered");
        return res.redirect('/login');
      }).catch((err) => {
        if (err instanceof auth.AuthenticationError) {
          req.flash('error', err.message);
        } else {
          console.error(err)
          req.flash('error', "An internal server error has occured"); // hide server error
        }
        return res.redirect('/register');
      });

  } else {
    req.flash('error', "Please include all input.");
    return res.redirect('/register');
  }
});


/* POST register-admin - try to register a new admin */
router.post('/register-admin', (req, res) => {
  // check the request is originating from localhost...

  console.log(req.connection.remoteAddress);
  let addr = _.last(req.connection.remoteAddress.split(':'));
  if (req.headers.host.split(':')[0] === 'localhost' &&
      (addr === '127.0.0.1') || addr == '1') {

    // check if all fields are filled
    if (req.body.username && req.body.password && req.body.password_confirm) {

      // Ensure password and confirmation password match
      if (req.body.password != req.body.password_confirm) {
        return res.status(500).json("Password does not match");
      }

      // attempt to register the admin
      return auth.registerAdmin(req.body.username, req.body.password)
        .then(() => {
          // redirect user to login screen on success
          res.status(200).json("Admin Account successfully registered");
        })
        .catch((err) => {
          if (err instanceof auth.AuthenticationError) {
            // let user know what the error message was (pertaining to passportJS)
            res.status(err.message);
          } else {
            // something more serious has occurred, output error to console, give user simplified version
            console.error(err);
            res.status(500).json("Internal server error");
          }
        });
    } else {
      // let user know that they need to fill all fields
      res.status(500).json("please enter all information: username, password, password_confirm");
    }
  } else {
    // let user know that access is denied, do not let them know there is a host requirement
    res.status(500).json("access denied");
  }
});

/* GET uuid-gen - generate a uuid, store it in list, send it back to user */
router.get('/uuid-gen', (req, res) => {
  var uuidStr = uuid.GenerateUUID();
  uuid.addUUIDToList(uuidStr);
  req.flash('success', 'localhost:3000/create_job/id?=' + uuidStr);
  res.redirect('/new-job');
});

/* GET new-job - visit new job page */
router.get('/new-job', (req, res) => {
  res.render('new_job', buildDefaultMessage(req, "/new-job"));
});

module.exports = router;
