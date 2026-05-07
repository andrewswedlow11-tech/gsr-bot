const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require('discord.js');
const { buildSessionPollEmbed } = require('../utils/embeds');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sessionpoll')
    .setDescription('Start a session vote poll')
    .addIntegerOption(opt =>
      opt.setName('votes')
        .setDescription('Number of votes required (default: from config)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(100)
    )
    .addStringOption(opt =>
      opt.setName('area')
        .setDescription('Area of play for this session')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    // Check staff role
    const staffRoleId = process.env.STAFF_ROLE_ID;
    if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
      return interaction.reply({
        content: '❌ You do not have permission to start session polls.',
        ephemeral: true,
      });
    }

    // Check if poll already active
    if (client.activePoll) {
      return interaction.reply({
        content: '❌ A session poll is already in progress. Cancel it first.',
        ephemeral: true,
      });
    }

    const votesRequired = interaction.options.getInteger('votes') || parseInt(process.env.VOTES_REQUIRED) || 20;
    const areaOfPlay = interaction.options.getString('area') || 'All Areas';

    // Initialize poll state
    client.activePoll = {
      startedBy: interaction.user.id,
      voters: [],
      votesRequired,
      areaOfPlay,
      messageId: null,
      channelId: null,
      startedAt: Date.now(),
    };

    const embed = buildSessionPollEmbed(
      interaction.user.id,
      0,
      votesRequired,
      areaOfPlay
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('session_vote')
        .setLabel('Vote')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('session_view_voters')
        .setLabel('View Voters')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('session_cancel')
        .setLabel('Cancel Poll')
        .setStyle(ButtonStyle.Danger),
    );

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });

    client.activePoll.messageId = msg.id;
    client.activePoll.channelId = interaction.channelId;
  }
};
