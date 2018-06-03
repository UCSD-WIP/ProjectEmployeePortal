const readline = require('readline');
const request = require('request');

// allocate variables to store username, password, and confirm_password
let username = '';
let password = '';
let confirm_password = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ask the user for username
rl.query = "Username : ";
rl.question(rl.query, (output) => {
  username = output;

  // mute stdout for password prompts
  rl.stdoutMuted = true;
  rl.query = "Password : ";

  // request password
  rl.question(rl.query, (output) => {
      password = output;
      rl.query = "Confirm_password : ";

      // request password confirmation
      rl.question(rl.query, (output) => {
          confirm_password = output;
          rl.close();

          // check for username length, password length, and make sure password and confirm_password match
          if(username.length < 4 || password.length < 6 || password != confirm_password){
            console.error("\n\nPlease make sure:\n");
            console.error("username is at least 4 characters long");
            console.error("password is at least 6 characters long");
            console.error("ensure the password and confirm password match");
            return;
          }

          // submit post request to localhost:3000/register-admin
          request.post({
            url: 'http://localhost:3000/register-admin',
            json: true,
            body: {
              username: username,
              password: password,
              password_confirm: confirm_password
            }
          }, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                console.log("\n",body) // Show the HTML for the Google homepage. 
              }
              else {
                console.log("Error "+response.body)
              }
          })
          
      });
  });
});

// overwrite stdout behavior when typing passwords
rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("\x1B[2K\x1B[200D"+rl.query+printObfuscatedString(rl));
  else
    rl.output.write(stringToWrite);
};

/**
 * printObfuscatedString() generate an obfuscated string of the password
 * 
 * @param {ReadLine} readline object containing password being typed
*/
const printObfuscatedString = (rl) => {
    let line = ""; 
    for(let i = 0; i < rl.line.length; i++){
        line += "*";
    }
    return line;
};