const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');
const { buildSessionPollEmbed, buildVotersEmbed, buildSessionActiveEmbed, GSR_RED } = require('../utils/embeds');
const { getServerInfo, getServerPlayers } = require('../utils/erlc');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction, client) {
    // ── Slash Commands ──────────────────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        const msg = { content: '❌ There was an error running this command.', ephemeral: true };
        if (interaction.deferred || interaction.replied) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // ── Buttons ─────────────────────────────────────────────────────────
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    // ── Vote Button ──────────────────────────────────────────────────────
    if (customId === 'session_vote') {
      if (!client.activePoll) {
        return interaction.reply({ content: '❌ No active session poll.', ephemeral: true });
      }

      const poll = client.activePoll;

      if (poll.voters.includes(interaction.user.id)) {
        return interaction.reply({ content: '✅ You have already voted!', ephemeral: true });
      }

      poll.voters.push(interaction.user.id);

      const currentVotes = poll.voters.length;
      const votesRequired = poll.votesRequired;

      // Update embed
      const updatedEmbed = buildSessionPollEmbed(
        poll.startedBy,
        currentVotes,
        votesRequired,
        poll.areaOfPlay
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

      await interaction.update({ embeds: [updatedEmbed], components: [row] });

      // Check if vote threshold reached
      if (currentVotes >= votesRequired) {
        await interaction.followUp({
          content: `🎉 **Vote threshold reached! ${currentVotes}/${votesRequired} votes.** Staff can now start the session with \`/startsession\`.`,
        });
      }
      return;
    }

    // ── View Voters Button ───────────────────────────────────────────────
    if (customId === 'session_view_voters') {
      if (!client.activePoll) {
        return interaction.reply({ content: '❌ No active session poll.', ephemeral: true });
      }

      const votersEmbed = buildVotersEmbed(client.activePoll.voters);
      return interaction.reply({ embeds: [votersEmbed], ephemeral: true });
    }

    // ── Cancel Poll Button ───────────────────────────────────────────────
    if (customId === 'session_cancel') {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({
          content: '❌ Only staff can cancel the poll.',
          ephemeral: true,
        });
      }

      if (!client.activePoll) {
        return interaction.reply({ content: '❌ No active poll to cancel.', ephemeral: true });
      }

      client.activePoll = null;

      const cancelEmbed = new EmbedBuilder()
        .setColor(GSR_RED)
        .setTitle('❌ Session Poll Cancelled')
        .setDescription('The session poll has been cancelled by staff.')
        .setTimestamp();

      // Disable all buttons
      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('session_vote')
          .setLabel('Vote')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('session_view_voters')
          .setLabel('View Voters')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('session_cancel')
          .setLabel('Cancel Poll')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true),
      );

      return interaction.update({ embeds: [cancelEmbed], components: [disabledRow] });
    }

    // ── Refresh Status Button ────────────────────────────────────────────
    if (customId === 'session_refresh_status') {
      await interaction.deferUpdate();

      const [serverInfo, players] = await Promise.all([
        getServerInfo(),
        getServerPlayers(),
      ]);

      if (!serverInfo) {
        return interaction.followUp({ content: '❌ Could not reach ERLC server.', ephemeral: true });
      }

      // Pull area/host from existing embed fields
      const existingEmbed = interaction.message.embeds[0];
      const areaField = existingEmbed?.fields?.find(f => f.name.includes('Area'));
      const hostField = existingEmbed?.fields?.find(f => f.name.includes('Hosted'));
      const areaOfPlay = areaField?.value || 'All Areas';
      const hostedByRaw = hostField?.value || '';
      const hostedById = hostedByRaw.replace(/[<@>]/g, '') || interaction.user.id;

      const updatedEmbed = buildSessionActiveEmbed(serverInfo, players, areaOfPlay, hostedById);

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

      return interaction.editReply({ embeds: [updatedEmbed], components: [row] });
    }

    // ── End Session Button ───────────────────────────────────────────────
    if (customId === 'session_end') {
      const staffRoleId = process.env.STAFF_ROLE_ID;
      if (staffRoleId && !interaction.member.roles.cache.has(staffRoleId)) {
        return interaction.reply({
          content: '❌ Only staff can end the session.',
          ephemeral: true,
        });
      }

      const endEmbed = new EmbedBuilder()
        .setColor(GSR_RED)
        .setTitle('🔴 Session Ended')
        .setDescription('The session has ended. Thank you for playing!')
        .setFooter({ text: 'Georgia State Roleplay • Session System' })
        .setTimestamp();

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('session_refresh_status')
          .setLabel('🔄 Refresh')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('session_end')
          .setLabel('End Session')
          .setStyle(ButtonStyle.Danger)
          .setDisabled(true),
      );

      return interaction.update({ embeds: [endEmbed], components: [disabledRow] });
    }
  }
};
