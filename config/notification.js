const accountSid = 'AC3678aa4a7869060079e3b2e3028a3518';
const authToken = '69da4b24a239a3dfdac388ed7583103d';

const sendSms = (phone,message) => {
  const client = require('twilio')(accountSid, authToken);
  client.messages
    .create({
       body: message,
       from: '+17578015408',
       to: `+91${phone}`
     })
    .then(message => console.log(message.sid));
}

module.exports = sendSms;