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
    user: req.user,
    error: req.flash('error'),
    warning: req.flash('warning'),
    info: req.flash('info'),
    success: req.flash('success'),
  }
}

/**
 * Returns the message data to be sent in the story
 *
 * @param {Object} req - request data from client
 *
 */
//TODO: Link this to backend work
function buildStoriesMessage(req) {
  return Object.assign(buildDefaultMessage(req), {style: 'stylesheets/style.css',
    stories: [
      {
        title: "title1",
        description: "hello world!",
        story_img:"http://trupanion.com/blog/wp-content/uploads/2017/09/GettyImages-512536165.jpg",
        author: "Superman"
      },
      {
        title: "title2",
        description: "ENG 100D",
        story_img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8XsEiCxFg4rXAt0HF9uGLpWcHMmgoaoLRQF7IFB8n0ZJr-d9kGw",
        author: "Wonder Woman"
      },
      {
        title: "title3",
        description: "Coding",
        story_img:"https://cdn.akc.org/Marketplace/Breeds/Pembroke_Welsh_Corgi_SERP.jpg",
        author: "Batman"
      },
      {
        title: "title4",
        description: "UC San Diego",
        story_img:"http://cdn3-www.dogtime.com/assets/uploads/gallery/pembroke-welsh-corgi-dog-breed-pictures/prance-8.jpg",
        author: "Hulk"
      },
      {
        title: "title5",
        description: "Bootstrap",
        story_img:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRy-VI5yIWAug8KLC3tBGHmL4hKaA5NBkjT0d0_LYB42hm-4oE1rw",
        author: "Captain America"
      },
      {
        title: "title6",
        description: "I can't wait for summer.",
        story_img:"https://az616578.vo.msecnd.net/files/2016/07/24/6360498492827782071652557381_corgi%20header.jpg",
        author: "Thor"
      },
      {
        title: "title7",
        description: "Yay for summer.",
        author: "Spiderman"
      }
    ]
  })
}

/**
 * Returns the message data to be sent in the job
 *
 * @param {Object} req - request data from client
 *
 */
//TODO: Link this to backend work
function buildJobsMessage(req) {
  return Object.assign(buildDefaultMessage(req), { style: 'stylesheets/style_3.css',
    job: [
      {
        company: "company1",
        position: "aerospace engineer",
        location: "Washington D.C",
        date_posted: "January 1, 2018",
        field: "Aerospace Engineering",
        logo:"https://i.ytimg.com/vi/opKg3fyqWt4/hqdefault.jpg",
        id: 1
      },
      {
        company: "company2",
        position: "bioengineering engineer",
        location: "La Jolla, CA",
        date_posted: "January 2, 2018",
        field: "Bioengineering",
        logo:"https://www.gannett-cdn.com/-mm-/e0b7d12476623b253869250f04db61c5ffb8135c/c=0-471-5753-3721&r=x329&c=580x326/local/-/media/2017/07/19/USATODAY/USATODAY/636360861812848734-Dog-Photos-17.jpg",
        id: 2
      },
      {
        company: "company3",
        position: "Computer Engineer",
        location: "San Francisco, CA",
        date_posted: "January 3, 2018",
        field: "Computer Science",
        logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3yYXqR0ep-l84DnUE_UStXgNLd8xngpWKvmeqKgCoR622Sep_",
        id: 3
      },
      {
        company: "company 4",
        position: "mechanical engineer",
        location: "Seattle, WA",
        date_posted: "January 4, 2018",
        field: "Mechanical Engineering",
        logo:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2ko5CaIY6PNcmA7L9W7DDXjh0OzC5olphW0Zh2564q_7Uecb9qg",
        id: 4
      },
      {
        company: "company5",
        position: "electrical engineer",
        location: "New York, NY",
        date_posted: "January 5, 2018",
        field: "Electrical Engineering",
        logo:"https://www.hd-wallpapersdownload.com/script/bulk-upload/hd-cute-dog-images-pics.jpg",
        id: 5
      },
      {
        company: "company6",
        position: "chemical engineer",
        location: "La Jolla, CA",
        date_posted: "January 6, 2018",
        field: "Chemical Engineering",
        logo:"https://dogzone-tcwebsites.netdna-ssl.com/wp-content/uploads/2014/01/4_tips_cute_dog_names.jpg",
        id: 6
      }
    ]
  })
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', buildDefaultMessage(req));
});

/* GET login page */
router.get('/login', function(req, res, next) {
  res.render('login', buildDefaultMessage(req));
});

/* GET register page */
router.get('/register', function(req, res, next) {
  res.render('register', buildDefaultMessage(req));
});

/* GET stories page */
router.get('/stories', function(req, res, next) {
  res.render('stories', buildStoriesMessage(req));
});

/* GET jobs page */
router.get('/jobs_2', function(req, res, next) {
  res.render('jobs_2', buildJobsMessage(req));
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

module.exports = router;
