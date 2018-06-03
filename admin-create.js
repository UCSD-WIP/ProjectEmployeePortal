const readline = require('readline');
const request = require('request');

let username = '';
let password = '';
let confirm_password = '';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.query = "Username : ";
rl.question(rl.query, (output) => {
  username = output;
  rl.stdoutMuted = true;
  rl.query = "Password : ";
  rl.question(rl.query, (output) => {
      password = output;
      rl.query = "Confirm_password : ";
      rl.question(rl.querym, (output) => {
          confirm_password = output;
          console.log("\nthe username: ", username);
          console.log("password: ", password);
          console.log("confirm_password: ", confirm_password);
          rl.close();

          request('http://localhost:3000/request-admin', {body: {}, method:"post"}, (error, response, body)=>{
            if (!error && response.statusCode == 200) {
                console.log(body) // Show the HTML for the Google homepage. 
              }
              else {
                console.log("Error "+response.statusCode)
              }
          })
          
      });
  });
});

rl._writeToOutput = function _writeToOutput(stringToWrite) {
  if (rl.stdoutMuted)
    rl.output.write("\x1B[2K\x1B[200D"+rl.query+printObfuscatedString(rl));
  else
    rl.output.write(stringToWrite);
};

const printObfuscatedString = (rl) => {
    let line = ""; 
    for(let i = 0; i < rl.line.length; i++){
        line += "*";
    }
    return line;
};