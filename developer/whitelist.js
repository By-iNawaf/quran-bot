const { SlashCommandBuilder } = require('discord.js');
const db = require('../db'); // ربط قاعدة البيانات

module.exports = {
  data: new SlashCommandBuilder()
    .setName('whitelist')
    .setDescription('إزالة مستخدم من القائمة السوداء (أمر مطور فقط)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('المستخدم الذي تريد رفع الحظر عنه')
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user');

    // إزالة من القائمة السوداء
    const result = db.prepare(`DELETE FROM blacklist WHERE userId = ?`).run(user.id);

    if (result.changes === 0) {
      return interaction.reply({
        content: `ℹ️ المستخدم ${user.tag} ليس محظورًا.`,
        ephemeral: true
      });
    }

    await interaction.reply({
      content: `✅ تم إزالة ${user.tag} من القائمة السوداء.`,
      ephemeral: true
    });
  }
};
