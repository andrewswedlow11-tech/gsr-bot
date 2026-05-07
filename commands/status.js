const { SlashCommandBuilder } = require('discord.js');
const { getServerInfo, getServerPlayers, getServerQueue } = require('../utils/erlc');
const { buildServerStatusEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Show the current Georgia State Roleplay ERLC server status'),

  async execute(interaction) {
    await interaction.deferReply();

    const [serverInfo, players, queue] = await Promise.all([
      getServerInfo(),
      getServerPlayers(),
      getServerQueue(),
    ]);

    if (!serverInfo) {
      return interaction.editReply({
        content: '❌ Could not reach the ERLC server. The server may be offline or the API key is invalid.',
      });
    }

    const embed = buildServerStatusEmbed(serverInfo, players, queue);

    await interaction.editReply({ embeds: [embed] });
  }
};
