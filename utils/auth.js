/** auth.js
 *
 * Handles user authentication configuration, and provides authentication tools
 */

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt = require("bcrypt");
var db = require("./db");

// Number of rounds of salting to be done on the hashed password.
const saltRounds = 10;

// Custom class for handling authentication errors
class AuthenticationError extends Error {};

/** 
 * register() Registers an account in the database with the specified username, password, and role
 *
 * @param {String} username
 * @param {String} password
 * @param {String} role
 */
let register = function(username, password, role) {
  let roleQueried = null;

  // Run both queries at the same time
  return Promise.all([
    db.query("select * from User where username = ?", {
      replacements: [username],
      type: db.QueryTypes.SELECT
    }),
    db.query("select * from Role where role_name = ?", {
      replacements: [role],
      type: db.QueryTypes.SELECT
    })
  ]).then((queryResults) => {
    let [userQueryResult, roleQueryResult] = queryResults;

    let userQueried = userQueryResult[0];
    roleQueried = roleQueryResult[0];

    // Check if the user doesn't exist and role exists
    if (userQueried) {
      // Username already exists
      return Promise.reject(new AuthenticationError("Username already exists"));
    } else if (!roleQueried) {
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
    return db.query("insert into User (username, password, role_id) values (?, ?, ?)", {
      replacements: [username, hash, roleQueried.id],
      type: db.QueryTypes.INSERT
    });
  }).then((queryResult) => {
    // Return if query succeeded
    return Promise.resolve();
  });
}

// Define the local strategy to use
passport.use(new LocalStrategy({
    session: true
  },
  /** 
   * Authenticate a user with the given username/password combination
   *
   * @param {String} username
   * @param {String} password
   * @param {callback} done which is called with params:
   *    @param {Error} error
   *    @param {Object} user
   *    @param {String} message
   */
  (username, password, done) => {
    // First, select the corresponding user
    db.query("select * from User where username = ?", {
        replacements: [username],
        type: db.QueryTypes.SELECT
      })
      .then((queryResult) => {
        user = queryResult[0]

        // Check if the user exists
        if (user) {
          // Compare hashed plaintext password with stored hash
          return bcrypt.compare(password, user.password)
        } else {
          // Reject authentication on 'no username exists'
          return Promise.reject(new AuthenticationError("Username/Password combination does not exist"));
        }
      }).then((result) => {
        if (result) {
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

        if (err instanceof AuthenticationError) {
          done(null, false, err.message)
        } else {
          // Mask internal server errors
          done(null, false, "Internal server error");
        }
      });
  }));

/** 
 * serializeUser() serializes a user into the session
 *
 * @param {Object} user
 * @param {callback} done with the following params:
 *    @param {Error} error
 *    @param {Number} userId
 */
passport.serializeUser((user, done) => {
  if (user && user.id) {
    done(null, user.id);
  } else {
    done(new Error("Internal server error"));
  }
});

/** 
 * deserializeUser() deserializes a user into the session
 *
 * @param {Number} userId
 * @param {callback} done with the following params:
 *    @param {Error} error
 *    @param {Object} user
 */
passport.deserializeUser((id, done) => {
  db.query("select * from User where id = ?", {
      replacements: [id],
      type: db.QueryTypes.SELECT
    })
    .then((queryResult) => {
      user = queryResult[0]

      if (user) {
        delete user.password
        done(null, user);
      } else {
        // User not found
        done(new Error("Internal server error"), null)
      }
    })
});

module.exports = {
  // Expose AuthenticationError for `instanceof` checks
  AuthenticationError: AuthenticationError,

  /** 
   * registerCandidate() Registers an account with the "candidate" role in the database 
   * with the specified username, password
   *
   * @param {String} username
   * @param {String} password
   */
  registerCandidate: function(username, password) {
    return register(username, password, "candidate")
  },

  /** 
   * registerAdmin() Registers an account with the "admin" role in the database 
   * with the specified username, password
   *
   * @param {String} username
   * @param {String} password
   */
  registerAdmin: function(username, password) {
    return register(username, password, "administrator")
  },

  /** 
   * ensureUserLoggedIn() Middleware that checks if user is logged in
   *
   * @param {Object} req - request from the client
   * @param {Object} res - response to the client
   * @param {Callback} next - call to next middleware
   */
  ensureUserLoggedIn: function(req, res, next) {
    // not logged in test
    if (req.user) {
      return next();
    } else {
      req.flash('error', "You must be logged in to continue");
      return res.redirect('/login');
    }
  },
}
