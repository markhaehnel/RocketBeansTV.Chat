const tmi = require('tmi.js')

const options = {
  connection: { reconnect: true },
  channels: ['#rocketbeanstv']
}

const twitchClient = new tmi.client(options)
twitchClient.connect()

module.exports.listen = (messageReceivedCallback) => {
  twitchClient.addListener('message', (channel, userstate, message, self) => {
    messageReceivedCallback({
      user: userstate['display-name'],
      content: message,
      service: 'twitch'
    })
  })
}
