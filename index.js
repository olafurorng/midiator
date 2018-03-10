const inquirer = require('inquirer');
const ora = require('ora');
const easymidi = require('easymidi');
const io = require('socket.io-client');

const selectMidiDevices = async () => {
  const inputs = easymidi.getInputs();
  const outputs = easymidi.getOutputs();
  return await inquirer.prompt([
    {
      type: 'list',
      name: 'input',
      message: 'Which MIDI input do you want to use?',
      choices: inputs,
    },
    {
      type: 'list',
      name: 'output',
      message: 'Which MIDI output do you want to use?',
      choices: outputs,
    },
    {
      type: 'input',
      name: 'ip',
      message: "What's your partner's hostname and port?",
    },
  ]);
};

(async () => {
  const mySocket = require('socket.io')(4400);

  const options = await selectMidiDevices();

  const input = new easymidi.Input(options.input);
  const output = new easymidi.Output(options.output);

  const spinner = ora('Connecting to partner').start();

  const partnerSocket = io(options.ip);

  partnerSocket.on('connect', () => {
    spinner.succeed('Connected to partner!');
  });

  input.on('noteon', msg => {
    mySocket.emit('noteon', msg);

    console.log('me noteon', msg);
  });

  input.on('noteoff', msg => {
    mySocket.emit('noteoff', msg);

    console.log('me noteon', msg);
  });

  partnerSocket.on('noteon', msg => {
    output.send('noteon', msg);

    console.log('noteon', msg);
  });

  partnerSocket.on('noteoff', msg => {
    output.send('noteoff', msg);

    console.log('noteoff', msg);
  });
})();
