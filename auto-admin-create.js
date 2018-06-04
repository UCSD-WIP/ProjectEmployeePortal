const request = require('request');

// submit post request to localhost:3000/register-admin
request.post({
    url: 'http://localhost:3000/register-admin',
    json: true,
    body: {
      username: "admin",
      password: "password",
      password_confirm: "password"
    }
  }, (error, response, body) => {
    if (!error && response.statusCode == 200) {
        console.log("\n",body) // Show the HTML for the Google homepage. 
      }
      else {
        console.log("Error "+response.body)
      }
  });