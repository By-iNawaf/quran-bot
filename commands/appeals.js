const { SlashCommandBuilder } = require('discord.js');
const db = require('../db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('appeals_list')
    .setDescription('عرض قائمة الطعون المقدمة'),
  async execute(interaction) {
    const appeals = db.prepare(`SELECT userId, reason, createdAt FROM appeals`).all();

    if (appeals.length === 0) {
      return interaction.reply({ content: 'لا توجد طعون حالياً.', ephemeral: true });
    }

    const list = appeals.map(a => `- <@${a.userId}>: ${a.reason} (في ${a.createdAt})`).join('\n');

    await interaction.reply({ content: `📋 قائمة الطعون:\n${list}`, ephemeral: true });
  }
};
