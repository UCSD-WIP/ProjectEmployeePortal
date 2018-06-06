/* db.js
 *
 * Populates the database and returns the database interface object
 */

const static = require('./static.js');
const Sequelize = require('sequelize');
const db = new Sequelize('database', null, null, {
  dialect: 'sqlite',
  //storage: ':memory:', // For now, store in memory
  logging: false,
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
        "company_name string not null," +
        "position string not null," +
        "job_field string not null," +
        "location string not null," +
        "logo string," +
        "icon string," +        
        "description string not null," +
        "experience string not null," +
        "email string not null," +
        "archived integer not null," + 
        "timestamp datetime default current_timestamp);"),
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
  })
  .then((queryResult) => {
    return Promise.all([
      db.query('insert into Story (image, title, description, content, featured) values ' +
               // First page, some content featured
               '("' + static.corgi_on_floor + '", ' +
               '"Cute Puppy Corgi on Floor!", ' +
               '"Wow this puppy is so cute!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '1), ' +
               '("' + static.smiling_puppy + '", ' +
               '"Cute Happy Puppy!", ' +
               '"Wow this puppy is also so cute!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '1), ' +
               '("' + static.corgi_on_floor + '", ' +
               '"Cute Puppy Corgi on Floor #2!", ' +
               '"Wow this puppy is so cute but not featured!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0), ' +
               '("' + static.corgi_on_floor + '", ' +
               '"Cute Puppy Corgi on Floor #3!", ' +
               '"Wow this puppy is so cute!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0), ' +
               '("' + static.smiling_puppy + '", ' +
               '"Cute Happy Puppy on Floor!", ' +
               '"Wow this puppy is also so cute #2!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0), ' +
               '("' + static.corgi_on_floor + '", ' +
               '"Cute Puppy Corgi on Floor #4!", ' +
               '"Wow this puppy is so cute but not featured!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0), ' +

               // Second page
               '("' + static.corgi_on_floor + '", ' +
               '"Cute Puppy Corgi on Floor #5!", ' +
               '"Wow this puppy is so cute!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0), ' +
               '("' + static.smiling_puppy + '", ' +
               '"Cute Happy Puppy on Floor!", ' +
               '"Wow this puppy is also so cute #3!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0), ' +
               '("' + static.corgi_on_floor + '", ' +
               '"Cute Puppy Corgi on Floor #6!", ' +
               '"Wow this puppy is so cute but not featured!", ' +
               '"' + static.lorem_ipsum + '", ' +
               '0)'),

      db.query('insert into Job (company_name, position, job_field, location, logo, icon, description, experience, email, archived) values ' +
               '("company1", ' +
               '"Aerospace Engineer", ' +
               '"Aerospace Engineering", ' +
               '"Washington, DC", ' +
               '"' + static.brown_puppy + '", ' +
               '"fas fa-rocket", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Aerospace Engineering or Related Field", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company2", ' +
               '"Bioengineer", ' +
               '"Bioengineering", ' +
               '"La Jolla, CA", ' +
               '"' + static.smiling_puppy + '", ' +
               '"fas fa-dna", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Bioengineering", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company3", ' +
               '"Software Engineer", ' +
               '"Software Engineering", ' +
               '"San Francisco, CA", ' +
               '"' + static.husky_puppy + '", ' +
               '"fas fa-desktop", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Computer Science", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company1", ' +
               '"Aerospace Engineer #2", ' +
               '"Aerospace Engineering", ' +
               '"Washington, DC", ' +
               '"' + static.brown_puppy + '", ' +
               '"fas fa-rocket", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Aerospace Engineering or Related Field", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company2", ' +
               '"Bioengineer #2", ' +
               '"Bioengineering", ' +
               '"La Jolla, CA", ' +
               '"' + static.smiling_puppy + '", ' +
               '"fas fa-dna", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Bioengineering", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company3", ' +
               '"Software Engineer #2", ' +
               '"Software Engineering", ' +
               '"San Francisco, CA", ' +
               '"' + static.husky_puppy + '", ' +
               '"fas fa-desktop", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Computer Science", ' +
               '"wip@eng100d.com", ' +
               '0), ' +

               // Page 2
               '("company1", ' +
               '"Aerospace Engineer #3", ' +
               '"Aerospace Engineering", ' +
               '"Washington, DC", ' +
               '"' + static.brown_puppy + '", ' +
               '"fas fa-rocket", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Aerospace Engineering or Related Field", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company2", ' +
               '"Bioengineer #3", ' +
               '"Bioengineering", ' +
               '"La Jolla, CA", ' +
               '"' + static.smiling_puppy + '", ' +
               '"fas fa-dna", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Bioengineering", ' +
               '"wip@eng100d.com", ' +
               '0), ' +
               '("company3", ' +
               '"Software Engineer #3", ' +
               '"Software Engineering", ' +
               '"San Francisco, CA", ' +
               '"' + static.husky_puppy + '", ' +
               '"fas fa-desktop", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Computer Science", ' +
               '"wip@eng100d.com", ' +
               '0), ' +

               // Some archived stuff
               '("company1", ' +
               '"Aerospace Engineer - Archived", ' +
               '"Aerospace Engineering", ' +
               '"Washington, DC", ' +
               '"' + static.brown_puppy + '", ' +
               '"fas fa-rocket", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Aerospace Engineering or Related Field", ' +
               '"wip@eng100d.com", ' +
               '1), ' +
               '("company2", ' +
               '"Bioengineer - Archived", ' +
               '"Bioengineering", ' +
               '"La Jolla, CA", ' +
               '"' + static.smiling_puppy + '", ' +
               '"fas fa-dna", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Bioengineering", ' +
               '"wip@eng100d.com", ' +
               '1), ' +
               '("company3", ' +
               '"Software Engineer - Archived", ' +
               '"Software Engineering", ' +
               '"San Francisco, CA", ' +
               '"' + static.husky_puppy + '", ' +
               '"fas fa-desktop", ' +
               '"' + static.lorem_ipsum + '", ' +
               '"Bachelor\'s in Computer Science", ' +
               '"wip@eng100d.com", ' +
               '1)'),
    ])
  });

// Export the database interface for use in other modules
module.exports = db;
