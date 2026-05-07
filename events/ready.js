const { startAutoStatus } = require('../utils/autoStatus');

module.exports = {
  name: 'ready',
  once: true,

  async execute(client) {
    console.log(`✅ Georgia State Roleplay Bot is online as ${client.user.tag}`);
    client.user.setActivity('Georgia State Roleplay | /status', { type: 3 });
    await startAutoStatus(client);
  }
};
