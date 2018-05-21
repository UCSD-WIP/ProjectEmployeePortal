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
        "role_id integer references Role(id));"),
      db.query("create table if not exists Job (" +
        "id integer primary key autoincrement," +
        "company_name string not null unique," +
        "position string not null," +
        "job_field string not null," +
        "location string not null," +
        "timestamp datetime default current_timestamp," +
        "content string not null," +
        "email string not null);"),
      db.query("create table if not exists Story (" +
        "id integer primary key autoincrement," +
        "image string," +
        "title string not null," +
        "description string not null," +
        "timestamp datetime default current_timestamp," +
        "content string not null," +
        "featured integer not null);")
    ]);
  }).then((queryResults) => {
    // Populate roles if not done so already
    return db.query('select role_name from Role')
  })
  .then((queryResult) => {
    let roles = queryResult[0]

    if (!roles || roles.length == 0) {
      return db.query('insert into Role (role_name) values ("candidate"), ("administrator");');
    }
  });

// Export the database interface for use in other modules
module.exports = db;
