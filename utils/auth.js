var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require('bcrypt');
var db = require('./db');

const saltRounds = 10;

// Custom class for handling authentication errors
class AuthenticationError extends Error {}

/* Registers an account in the database
 */
let register = function(username, password, role) {
  // Run both queries at the same time
  return Promise.all([
    db.query('select * from User where username = ?',
      { replacements: [username], type: db.QueryTypes.SELECT }),
    db.query('select * from Role where role_name = ?',
      { replacements: [role], type: db.QueryTypes.SELECT })
  ]).then((queryResults) => {
    let [userQueryResult, roleQueryResult] = queryResults;

    let user = userQueryResult[0];
    let role = roleQueryResult[0];

    // Check if the user doesn't exist and role exists
    if(user) {
      // Username already exists
      return Promise.reject(new AuthenticationError("Username already exists"));
    } else if(!role) {
      // Role does not exist
      // This should never happen, would be an internal server error
      return Promise.reject(new Error("Role does not exist"));
    } else {
      // If so, we can proceed with creating an account. 
      // Hash the password
      return bcrypt.hash(password, saltRounds);
    }
  }).then((hash) => {
    // Insert into the database with the hashed result
    return db.query('insert into User (username, password, role_id) values (?, ?, ?)',
      { replacements: [username, hash, role.id], type: db.QueryTypes.INSERT });
  }).then((queryResult) => {
    // Return true if query succeeded
    return Promise.resolve(true);
  });
}

// Define the local strategy to use
// Uses 
passport.use(new LocalStrategy({
    session: true
  },
  // Authenticate a user with the given username/password combination
  (username, password, done) => {
    // First, select the corresponding user
    db.query('select * from User where username = ?',
      { replacements: [username], type: db.QueryTypes.SELECT })
    .then((queryResult) => {
      user = queryResult[0]

      // Check if the user exists
      if(user) {
        // Compare hashed plaintext password with stored hash
        return bcrypt.compare(password, user.password)
      } else {
        // Reject authentication on 'no username exists'
        return Promise.reject(new AuthenticationError("Username/Password combination does not exist"));
      }
    }).then((result) => {
      if(result) {
        // Authentication succeeded
        delete user.password // don't leak the hashed password!
        return done(null, user, "Welcome!");
      } else {
        // Reject authentication on unmatching password
        return Promise.reject(new AuthenticationError("Username/Password combination does not exist"));
      }
    }).catch((err) => {
      // Reject authentication if anything fails
      console.error(err)

      if(err instanceof AuthenticationError) {
        done(null, false, err.message)
      } else {
        // Mask internal server errors
        done(null, false, "Internal server error");
      }
    });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user.id)
});

passport.deserializeUser(function(id, done) {
  getUsersId(id, function(user) {
    done(null, user)
  })
});

module.exports = {
  AuthenticationError: AuthenticationError,

  registerCandidate: function(username, password) {
    return register(username, password, "candidate")
  },

  registerAdmin: function(username, password) {
    return register(username, password, "administrator")
  },

  ensureUserLoggedIn: function(req, res, next) {
    // not logged in test
    if (req.user) {
      next();
    } else {
      req.flash('error', "You must be logged in to continue");
      res.redirect('/login');
    }
  },
}
