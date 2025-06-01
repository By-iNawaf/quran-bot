const { SlashCommandBuilder, ChannelType } = require('discord.js');
const config = require('../config.json');
const control = require('../controls');
const { joinVoiceChannel } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('إنشاء لوحة التحكم'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;

    const category = await guild.channels.create({
      name: config.categoryName,
      type: ChannelType.GuildCategory
    });

    const textChannel = await guild.channels.create({
      name: config.controlChannelName,
      type: ChannelType.GuildText,
      parent: category.id
    });

    const voiceChannel = await guild.channels.create({
      name: config.voiceChannelName,
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    await textChannel.permissionOverwrites.edit(guild.roles.everyone, {
      SendMessages: false,
      AddReactions: false,
    });

    await textChannel.permissionOverwrites.edit(interaction.client.user.id, {
      SendMessages: true,
      ViewChannel: true,
    });

    await voiceChannel.permissionOverwrites.edit(guild.roles.everyone, {
      Speak: false,
      Stream: false,
      Connect: true,
    });

    await voiceChannel.permissionOverwrites.edit(interaction.client.user.id, {
      Speak: true,
      Connect: true,
    });

    // حفظ معرف القناة الصوتية في ملف
    const data = {
      voiceChannelId: voiceChannel.id,
      textChannelId: textChannel.id,
      categoryId: category.id
    };

    fs.writeFileSync(path.join(__dirname, '../data.json'), JSON.stringify(data, null, 2));

    // انضمام البوت للقناة الصوتية
    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    // إرسال لوحة التحكم
    await control.sendControlPanel(textChannel);

    await interaction.editReply({ content: '✅ تم الإنشاء وضبط الصلاحيات والبوت الآن في القناة الصوتية' });
  }
};
