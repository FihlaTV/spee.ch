function SlackConfig () {
  this.slackWebHook      = 'default';
  this.slackErrorChannel = 'default';
  this.slackInfoChannel  = 'default';
};

module.exports = new SlackConfig();
