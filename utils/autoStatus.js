const { getServerInfo, getServerPlayers, getServerQueue } = require('../utils/erlc');
const { buildServerStatusEmbed } = require('../utils/embeds');

let statusMessageId = null;

async function startAutoStatus(client) {
  const channelId = process.env.STATUS_CHANNEL_ID;
  if (!channelId) {
    console.warn('⚠️  STATUS_CHANNEL_ID not set — auto status disabled.');
    return;
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel) {
    console.error('❌ Could not find status channel. Check STATUS_CHANNEL_ID in .env');
    return;
  }

  async function updateStatus() {
    try {
      const [serverInfo, players, queue] = await Promise.all([
        getServerInfo(),
        getServerPlayers(),
        getServerQueue(),
      ]);

      if (!serverInfo) {
        console.warn('⚠️  ERLC API returned nothing — skipping update.');
        return;
      }

      const embed = buildServerStatusEmbed(serverInfo, players, queue);

      // If we already posted a status message, edit it
      if (statusMessageId) {
        const existing = await channel.messages.fetch(statusMessageId).catch(() => null);
        if (existing) {
          await existing.edit({ embeds: [embed] });
          return;
        }
      }

      // Otherwise post a new one
      const msg = await channel.send({ embeds: [embed] });
      statusMessageId = msg.id;
      console.log(`✅ Auto-status posted in #${channel.name}`);

    } catch (err) {
      console.error('Auto-status update error:', err.message);
    }
  }

  // Run immediately on startup, then every 60 seconds
  await updateStatus();
  setInterval(updateStatus, 60_000);
  console.log('🔄 Auto-status started — updates every 60 seconds.');
}

module.exports = { startAutoStatus };
