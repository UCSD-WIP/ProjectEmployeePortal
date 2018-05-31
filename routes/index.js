var express = require('express');
var db = require('../utils/db.js');
var auth = require('../utils/auth.js');
var passport = require('passport');
var router = express.Router();

/**
 * Returns the message data to be sent in the response
 *
 * @param {Object} req - request data from client
 */
function buildDefaultMessage(req) {
  return {
    title: 'Title',
    current_page: null,
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
  }
}

function buildStoryMessage(req) {
  return Object.assign(buildDefaultMessage(req),{
    style:'stylesheets/style_story.css',
    current_page:'stories',
    story: {
      title: 'hello',
      description: "hello world!",
      text: "This is where the text goes!",
      author:"Gwen",
      date:"5/18/18",
      img:"http://trupanion.com/blog/wp-content/uploads/2017/09/GettyImages-512536165.jpg"
    }
  });
}

/**
 * Returns the message data to be sent in the `stories` page
 *
 * @param {Object} req - request data from client
 *
 */
//TODO: Link this to backend work
function buildStoriesMessage(req) {
  return Object.assign(buildDefaultMessage(req), {
  	style: 'stylesheets/style_stories.css',
    current_page: 'stories',
    stories: [
      {
        title: "title1",
        description: "hello world!",
        story_img:"http://trupanion.com/blog/wp-content/uploads/2017/09/GettyImages-512536165.jpg"
      },
      {
        title: "title2",
        description: "ENG 100D",
        story_img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8XsEiCxFg4rXAt0HF9uGLpWcHMmgoaoLRQF7IFB8n0ZJr-d9kGw"
      },
      {
        title: "title3",
        description: "Coding",
        story_img:"https://cdn.akc.org/Marketplace/Breeds/Pembroke_Welsh_Corgi_SERP.jpg"
      },
      {
        title: "title4",
        description: "UC San Diego",
        story_img:"http://cdn3-www.dogtime.com/assets/uploads/gallery/pembroke-welsh-corgi-dog-breed-pictures/prance-8.jpg"
      },
      {
        title: "title5",
        description: "Bootstrap",
        story_img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy-VI5yIWAug8KLC3tBGHmL4hKaA5NBkjT0d0_LYB42hm-4oE1rw"
      },
      {
        title: "title6",
        description: "I can't wait for summer.",
        story_img:"https://az616578.vo.msecnd.net/files/2016/07/24/6360498492827782071652557381_corgi%20header.jpg"
      }
    ]
  });
}

/**
 * Returns the message data to be sent in the `login` page
 *
 * @param {Object} req - request data from client
 *
 */
function buildLoginMessage(req) {
  return Object.assign(buildDefaultMessage(req), {
    current_page: 'login'
  });
}

/**
 * Returns the message data to be sent in the `register` page
 *
 * @param {Object} req - request data from client
 *
 */
function builgRegisterMessage(req) {
  return Object.assign(buildDefaultMessage(req), {
    current_page: 'register'
  });
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', buildDefaultMessage(req));
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', buildLoginMessage(req));
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', builgRegisterMessage(req));
});

/* GET logout */
router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success', "You have successfully logged out");
    res.redirect('/login');
});

/* GET stories page */
router.get('/stories', function(req, res, next) {
  res.render('stories', buildStoriesMessage(req));
});

/* GET story page */
router.get('/story', function(req, res, next){
  res.render('story', buildStoryMessage(req));
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
  if (req.headers.host.split(':')[0] === 'localhost') {

    // check if all fields are filled
    if (req.body.username && req.body.password && req.body.password_confirm) {

      // Ensure password and confirmation password match
      if (req.body.password != req.body.password_confirm) {
        // req.flash('error', 'Passwords provided do not match');
        // return res.redirect('/register-admin');
        return res.status(500).json("Password does not match");
      }

      // attempt to register the admin
      return auth.registerAdmin(req.body.username, req.body.password)
        .then(() => {
          // redirect user to login screen on success
          // req.flash('success', "Admin Account successfully registered");
          // return res.redirect('/login');
          res.status(200).json("Admin Account successfully registered");
        })
        .catch((err) => {
          if (err instanceof auth.AuthenticationError) {
            // let user know what the error message was (pertaining to passportJS)
            // req.flash('error', err.message);
            res.status(err.message);
          } else {
            // something more serious has occurred, output error to console, give user simplified version
            console.error(err);
            // req.flash('error', 'An internal server error has occurred')
            res.status(500).json("Internal server error");
          }
        });
    } else {
      // let user know that they need to fill all fields
      // req.flash('error', 'Please include all input');
      // return res.redirect('/register-admin');
      res.status(500).json("please enter all information: username, password, confirm password");
    }
  } else {
    // let user know that access is denied, do not let them know there is a host requirement
    // req.flash('error', 'Access denied');
    // return res.redirect('/register-admin');
    res.status(500).json("access denied");
  }
})

module.exports = router;
