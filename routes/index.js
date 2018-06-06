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
  return {
    title: 'Title',
    current_page: current_page,
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
  }
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
function buildStoriesMessage(req) {
  let message = Object.assign(buildDefaultMessage(req, "stories"), {
    style: 'stylesheets/style_stories.css',
  });

  return db.query('select * from Story limit 6')
    .then((queryResults) => {
      let stories = queryResults[0]

      if(stories && stories.length != 0) {
        message["stories"] = stories
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
//TODO: Link this to backend work
function buildJobsMessage(req) {
  return Object.assign(buildDefaultMessage(req, "jobs"), 
    { style: 'stylesheets/style_jobs.css',
      job: [
        {
          company: "company1",
          position: "aerospace engineer",
          location: "Washington D.C",
          date_posted: "January 1, 2018",
          field: "Aerospace Engineering",
          logo:"https://i.ytimg.com/vi/opKg3fyqWt4/hqdefault.jpg",
          icon: "fas fa-rocket",
          id: 1
        },
        {
          company: "company2",
          position: "bioengineering engineer",
          location: "La Jolla, CA",
          date_posted: "January 2, 2018",
          field: "Bioengineering",
          logo:"https://www.gannett-cdn.com/-mm-/e0b7d12476623b253869250f04db61c5ffb8135c/c=0-471-5753-3721&r=x329&c=580x326/local/-/media/2017/07/19/USATODAY/USATODAY/636360861812848734-Dog-Photos-17.jpg",
          icon: "fas fa-dna",
          id: 2
        },
        {
          company: "company3",
          position: "Computer Engineer",
          location: "San Francisco, CA",
          date_posted: "January 3, 2018",
          field: "Computer Science",
          logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3yYXqR0ep-l84DnUE_UStXgNLd8xngpWKvmeqKgCoR622Sep_",
          icon: "fas fa-desktop",
          id: 3
        },
        {
          company: "company 4",
          position: "mechanical engineer",
          location: "Seattle, WA",
          date_posted: "January 4, 2018",
          field: "Mechanical Engineering",
          logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2ko5CaIY6PNcmA7L9W7DDXjh0OzC5olphW0Zh2564q_7Uecb9qg",
          icon:"fas fa-cogs",
          id: 4
        },
        {
          company: "company5",
          position: "electrical engineer",
          location: "New York, NY",
          date_posted: "January 5, 2018",
          field: "Electrical Engineering",
          logo:"https://www.hd-wallpapersdownload.com/script/bulk-upload/hd-cute-dog-images-pics.jpg",
          icon: "fas fa-plug",
          id: 5
        },
        {
          company: "company6",
          position: "chemical engineer",
          location: "La Jolla, CA",
          date_posted: "January 6, 2018",
          field: "Chemical Engineering",
          logo:"https://dogzone-tcwebsites.netdna-ssl.com/wp-content/uploads/2014/01/4_tips_cute_dog_names.jpg",
          icon:"fas fa-flask",
          id: 6
        }
      ]
    }
  )
}

function buildJobMessage(req){
  return Object.assign(buildDefaultMessage(req, "jobs"), {
    job: {
      company: "company1",
      position: "aerospace engineer",
      location: "La Jolla, CA",
      date_posted: "5/30/18",
      field: "Aerospace Engineer",
      logo: "https://dogzone-tcwebsites.netdna-ssl.com/wp-content/uploads/2014/01/4_tips_cute_dog_names.jpg",
      description: "Donec id elit non mi porta gravida at eget metus. Maecenas faucibus mollis interdum.",
      experience: "Donec id elit non mi porta gravida at eget metus. Maecenas faucibus mollis interdum.",
      email:"wip@eng100d.com",
      id: 1
    }
  })
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

  return db.query('select * from Story where featured = 1')
    .then((queryResults) => {
      let stories = queryResults[0]

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
  buildStoriesMessage(req)
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
  res.render('jobs', buildJobsMessage(req));
});

router.get('/job', function(req, res, next) {
  res.render('job', buildJobMessage(req));
});

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
    })
});

/* GET admin discover new page */
router.get('/admin_discover_new', function(req, res, next) {
  res.render('admin_discover_new', buildDefaultMessage(req, "about"));
});

/* POST login - authenticate user */
router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  successFlash: true,
  failureFlash: true,
  session: true
}));

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
