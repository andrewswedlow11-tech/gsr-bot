const { EmbedBuilder } = require('discord.js');

// Georgia State Roleplay brand colors
const GSR_BLUE = 0x1E90FF;
const GSR_GREEN = 0x2ECC71;
const GSR_RED = 0xE74C3C;
const GSR_GOLD = 0xF1C40F;

function buildServerStatusEmbed(serverInfo, players, queue) {
  const playerCount = players.length;
  const maxPlayers = serverInfo?.MaxPlayers || 40;
  const queueCount = queue.length;
  const serverCode = serverInfo?.JoinKey || 'N/A';
  const serverName = serverInfo?.Name || 'Georgia State Roleplay';

  // Build player bar (visual fill indicator)
  const fillPercent = Math.round((playerCount / maxPlayers) * 10);
  const bar = '█'.repeat(fillPercent) + '░'.repeat(10 - fillPercent);

  const embed = new EmbedBuilder()
    .setColor(playerCount > 0 ? GSR_GREEN : GSR_BLUE)
    .setImage(process.env.BANNER_URL || null)
    .addFields(
      {
        name: '🏛️ Server Name',
        value: serverName,
        inline: false,
      },
      {
        name: '🔑 Server Code',
        value: `\`${serverCode}\``,
        inline: true,
      },
      {
        name: '👥 Players',
        value: `${playerCount}/${maxPlayers}`,
        inline: true,
      },
      {
        name: '⏳ Queue',
        value: `${queueCount}`,
        inline: true,
      },
      {
        name: '📊 Server Load',
        value: `\`${bar}\` ${playerCount}/${maxPlayers}`,
        inline: false,
      }
    )
    .setFooter({ text: `Georgia State Roleplay • Updated` })
    .setTimestamp();

  return embed;
}

function buildSessionPollEmbed(startedBy, currentVotes, votesRequired, areaOfPlay) {
  const embed = new EmbedBuilder()
    .setColor(GSR_BLUE)
    .setTitle('🗳️ Session Vote')
    .setDescription('A new session vote has started!\n\u200b')
    .setImage(process.env.BANNER_URL || null)
    .addFields(
      {
        name: '**Votes Required**',
        value: `${votesRequired}`,
        inline: true,
      },
      {
        name: '**Current Votes**',
        value: `${currentVotes}/${votesRequired}`,
        inline: true,
      },
      {
        name: '**Area of Play**',
        value: areaOfPlay || 'N/A',
        inline: true,
      },
      {
        name: '**Started By**',
        value: `<@${startedBy}>`,
        inline: false,
      }
    )
    .setFooter({ text: 'Georgia State Roleplay • Session System' })
    .setTimestamp();

  return embed;
}

function buildSessionActiveEmbed(serverInfo, players, areaOfPlay, hostedBy) {
  const playerCount = players.length;
  const maxPlayers = serverInfo?.MaxPlayers || 40;
  const serverCode = serverInfo?.JoinKey || 'N/A';

  const embed = new EmbedBuilder()
    .setColor(GSR_GREEN)
    .setTitle('✅ Session In Progress')
    .setDescription('**A session is now active! Join now.**\n\u200b')
    .setImage(process.env.BANNER_URL || null)
    .addFields(
      {
        name: '🔑 Server Code',
        value: `\`${serverCode}\``,
        inline: true,
      },
      {
        name: '👥 Players',
        value: `${playerCount}/${maxPlayers}`,
        inline: true,
      },
      {
        name: '📍 Area of Play',
        value: areaOfPlay || 'All Areas',
        inline: true,
      },
      {
        name: '🎙️ Hosted By',
        value: `<@${hostedBy}>`,
        inline: false,
      }
    )
    .setFooter({ text: 'Georgia State Roleplay • Session System' })
    .setTimestamp();

  return embed;
}

function buildVotersEmbed(voters) {
  const embed = new EmbedBuilder()
    .setColor(GSR_GOLD)
    .setTitle('👥 Current Voters')
    .setDescription(
      voters.length > 0
        ? voters.map((id, i) => `**${i + 1}.** <@${id}>`).join('\n')
        : '*No votes yet.*'
    )
    .setFooter({ text: `Total Votes: ${voters.length}` });

  return embed;
}

module.exports = {
  buildServerStatusEmbed,
  buildSessionPollEmbed,
  buildSessionActiveEmbed,
  buildVotersEmbed,
  GSR_BLUE,
  GSR_GREEN,
  GSR_RED,
};
