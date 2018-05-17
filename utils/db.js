/* db.js
 *
 * Populates the database and returns the database interface object
 */

const Sequelize = require('sequelize');
const db = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  storage: ':memory:', // For now, store in memory
})

// Database population
db.authenticate()
  .then(() => {
      console.log('Database connection has been established successfully');
      // Run all of the schema 'create table' population at the same time
      return Promise.all([
        db.query("create table if not exists Role (" +
                 "id integer primary key autoincrement," +
                 "role_name string not null unique);"),
        db.query("create table if not exists User (" +
                 "id integer primary key autoincrement," +
                 "username string not null unique," +
                 "password string not null," +
                 "role_id integer references Role(id));")]);
    }, (err) => {
      console.log('Unable to connect to the database:', err);
  }).then((queryResults) => {
    // Populate roles if not done so already
    return db.query('select role_name from Role')
  })
  .then((queryResult) => {
    let roles = queryResult[0]

    if(!roles || roles.length == 0) {
      db.query('insert into Role (role_name) values ("candidate"), ("administrator");');
    }
  });



module.exports = db;