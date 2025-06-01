const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('kickbot').setDescription('أمر مطور فقط لطرد البوت'),
  async execute(interaction) {
    await interaction.reply('👋 جاري الخروج...');
    process.exit(0);
  }
};
