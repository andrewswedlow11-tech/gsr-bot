const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { getServerInfo, getServerPlayers } = require('../utils/erlc');
const { buildSessionActiveEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('startsession')
    .setDescription('Announce a session is starting and post server info')
    .addStringOption(opt =>
      opt.setName('area')
        .setDescription('Area of play for this session')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    const staffRoleId = process.env.STAFF_ROLE_ID;
    if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: '❌ You do not have permission to start sessions.',
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const areaOfPlay = interaction.options.getString('area') || 'All Areas';

    const [serverInfo, players] = await Promise.all([
      getServerInfo(),
      getServerPlayers(),
    ]);

    if (!serverInfo) {
      return interaction.editReply({
        content: '❌ Could not reach the ERLC server. Make sure your server is online.',
      });
    }

    // Clear any active poll
    client.activePoll = null;

    const embed = buildSessionActiveEmbed(serverInfo, players, areaOfPlay, interaction.user.id);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('session_refresh_status')
        .setLabel('🔄 Refresh')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('session_end')
        .setLabel('End Session')
        .setStyle(ButtonStyle.Danger),
    );

    await interaction.editReply({
      content: `@here 🚨 **A session has started! Join now.**`,
      embeds: [embed],
      components: [row],
    });
  }
};
