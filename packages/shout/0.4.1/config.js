module.exports = {
  password: "pw",
  port: 9000,
  defaults: {
    nick: "erming",
    realname: "Mattias Erming",
  },
  messages: 100,
  networks: [{
    host: "irc.freenode.org",
    port: 6667,
    channels: [
      "#shout-irc",
      "#shout-dev",
    ],
  }]
};
