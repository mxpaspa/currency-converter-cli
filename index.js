const readline = require('readline');
const events = require('events');
class _events extends events{};
const e = new _events();
const minimist = require('minimist')
const error = require('./utils/error')
const prompt = require('prompt')
const User = require('./models/userModel')
const ora = require('ora')
const dbCommands = require('./cmds/db');
// const terminalStyle = require('./utils/terminalStyle')

module.exports = () => {

  var cli = {};

  const args = minimist(process.argv.slice(2))

  // handle the help and version commands before the cli has been initialized
  let cmd = args._[0] || 'help'

  if (args.version || args.v) {
    cmd = 'version'
  }

  if (args.help || args.h) {
    cmd = 'help'
  }

  switch (cmd) {

    case 'help':
      require('./cmds/help')(args)
      break

    case 'create-user':
      let un = args._[1]
      let pw = args._[2]
      const spinner = ora().start()
      dbCommands.connectDb(function(db){

        db.on('error', console.error.bind(console, 'connection error:'));
        dbCommands.createUser(User,un,pw,function(newUser){

          if(newUser) {
              spinner.stop()
              console.log("Successfully created user!"+ '\n' +
              "login by entering 'converter login'");
              process.exit(0)
          }
          else {
            console.log("failed to create user");
          }


        })
      })
      break


    case 'login':
      prompt.start();
      prompt.get(['username', 'password'], function (err, result) {

      let loginUn = result.username
      let loginPw = result.password

        if(loginUn && loginPw){
          // define the mlab database url
          dbCommands.loginUserName = loginUn
          dbCommands.loginPassword = loginPw
          dbCommands.connectDb(function(db){
             const spinner = ora().start();

             db.on('error', console.error.bind(console, 'connection error:'));
               //lOGIN QUERY
               dbCommands.findUser(User,loginUn,loginPw,function(user){
                  if(user) {
                      spinner.stop();
                      console.log("Success! you are logged in");

                      // initialize the CLI if the user authenticates
                     cli.init()
                }
                else {
                    terminalStyle.horizontalLine()
                    console.log("Authentication Failed");
                    process.exit(1)
                  }
               })
           })
        }
      });
      break

      case 'version':
        require('./cmds/version')(args)
        break

      case 'help':
        require('./cmds/help')(args)
        break
  }

  // Init script
  cli.init = function(){

    console.log('\x1b[34m%s\x1b[0m','converter-cli is running');

    var _interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: ''
    });

    // Create an initial prompt
    _interface.prompt();

    // Handle each line of input separately
    _interface.on('line', function(str){

      // Send to the input processor
      cli.processInput(str);

      // Re-initialize the prompt afterwards
      _interface.prompt();
    });

    // If the user stops the CLI, kill the associated process
    _interface.on('close', function(){
      process.exit(0);
    });

    // process.stdout.on('resize', () => {
    //   console.log('screen size has changed!');
    //   console.log(`${process.stdout.columns}x${process.stdout.rows}`);
    // });

  };

  // handle user input and send to the appropriate event
  cli.processInput = function(str){
    str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

    if(str){

      var uniqueInputs = [

        'help',
        'logs',
        'convert',
        'symbols'

      ];

      // verfiy the user is sending valid input
      var matchFound = false;
      var counter = 0;
      uniqueInputs.some(function(input){
        if(str.toLowerCase().indexOf(input) > -1){
          matchFound = true;
          // Emit event matching the unique input, and include the full string given
          e.emit(input,str);
          return true;
        }
      });

      // If no match is found, tell the user to try again
      if(!matchFound){
        console.log("Did not match any possible commands");
      }

    }
  };

  // handle the 'help' event
  e.on('help',function(str){

    require('./cmds/help')(str)
  });

  // handle the 'logs' event
  e.on('logs',function(str){

    dbCommands.connectDb(function(db){
      const spinner = ora().start()
      db.on('error', console.error.bind(console, 'connection error:'));
      dbCommands.findUser(User,dbCommands.loginUserName,dbCommands.loginPassword,function(user){

        if(user) {

            spinner.stop()
            require('./cmds/showLogs')(dbCommands.loginUserName)

        }
        else {

          console.log("You are not authenticated");

        }
      })
    })
  });

  // handle the 'convert' event
  e.on('convert',function(str){
    var arr = str.split(' ');
    var homeCurrency = typeof(arr[1]) == 'string' && arr[1].trim().length == 3 ? arr[1].trim() : false;
    var exchangeCurrency = typeof(arr[2]) == 'string' && arr[2].trim().length == 3 ? arr[2].trim() : false;
    var amount = typeof(arr[3]) == 'string' && arr[1].trim().length > 0 ? arr[3].trim() : false;

    if(homeCurrency && exchangeCurrency && amount !== false){
      // (homeCurrency !== false) && (exchangeCurrency !== false) && (amount !== false)
      require('./cmds/convert')(homeCurrency,exchangeCurrency,amount,dbCommands.loginUserName)

    } else {
      console.log("Currecnies must be of the format 'USD' or 'EUR' and make sure to include an amount");
    }

  });

  e.on('symbols',function(str){
    require('./cmds/symbols')()
  });

}
