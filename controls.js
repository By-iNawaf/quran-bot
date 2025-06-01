const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  InteractionType,
} = require('discord.js');

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
} = require('@discordjs/voice');

const path = require('path');
const fs = require('fs');

// قراءة معرف القناة الصوتية المسموح بها
const data = JSON.parse(fs.readFileSync(path.join(__dirname, './data.json')));
const allowedVoiceChannelId = data.voiceChannelId;

const readers = [
  { label: 'الشيخ مشاري العفاسي', value: '1.mp3', description: 'تلاوة روحانية وهادئة تلامس القلوب' },
  { label: 'الشيخ ياسر الدوسري', value: '2.mp3', description: 'تلاوة مؤثرة بصوت نقي مليء بالخشوع' },
  { label: 'الشيخ سعد القحطاني', value: '3.mp3', description: 'سورة الكهف بصوت فخم يأسر السامعين' },
  { label: 'الشيخ ماهر المعيقلي', value: '4.mp3', description: 'تلاوة سلسة تبعث الطمأنينة والسكينة' },
];

const player = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Pause } });
let connection;
let currentResource = null;

function createControlComponents() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('select_reader')
    .setPlaceholder('إختر الشيخ')
    .addOptions(
      readers.map((reader) => ({
        label: reader.label,
        value: reader.value,
        description: reader.description,
      }))
    );

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('pause').setEmoji('<:emoji:1377923234791686184>').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('play').setEmoji('<:emoji:1377923233369821324>').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('stop').setEmoji('<:emoji:1377923236741910569>').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('vol_down').setEmoji('<:emoji:1377923231604019211>').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('vol_up').setEmoji('<:emoji:1377923229792079902>').setStyle(ButtonStyle.Secondary)
  );

  return [new ActionRowBuilder().addComponents(menu), buttons];
}

module.exports = {
  async sendControlPanel(channel) {
    const imagePath = path.join(__dirname, 'control-panel.png');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ الصورة control-panel.png غير موجودة في المجلد.');
      return;
    }

    await channel.send({
      content: `**🕋 اختر الشيخ الذي تريد الاستماع لتلاوته من خلال القائمة أدناه**`,
      files: [imagePath],
      components: createControlComponents(),
    });
  },

  async handle(interaction) {
    if (interaction.type !== InteractionType.MessageComponent) return;

    const { guild, member } = interaction;

    // التحقق من وجود العضو في القناة الصحيحة فقط
    if (!member?.voice?.channel || member.voice.channel.id !== allowedVoiceChannelId) {
      await interaction.reply({
        content: '❌ يجب أن تكون في القناة الصوتية الخاصة بالبوت فقط.',
        ephemeral: true,
      });
      return;
    }

    // الاتصال بالقناة إن لم يكن متصلاً
    if (!connection || connection.joinConfig.channelId !== allowedVoiceChannelId) {
      if (connection) connection.destroy();

      connection = joinVoiceChannel({
        channelId: allowedVoiceChannelId,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });
      connection.subscribe(player);
    }

    // اختيار الشيخ
    if (interaction.isStringSelectMenu() && interaction.customId === 'select_reader') {
      const selectedReader = readers.find((r) => r.value === interaction.values[0]);
      if (!selectedReader) {
        await interaction.reply({ content: '❌ خطأ في اختيار الشيخ.', ephemeral: true });
        return;
      }

      const filePath = path.join(__dirname, 'audio', selectedReader.value);
      if (!fs.existsSync(filePath)) {
        await interaction.reply({
          content: '❌ الملف الصوتي غير موجود على السيرفر.',
          ephemeral: true,
        });
        return;
      }

      const resource = createAudioResource(filePath, { inlineVolume: true });
      resource.volume.setVolume(0.5); // الصوت الافتراضي 50%
      currentResource = resource;
      player.play(resource);

      await interaction.update({
        components: createControlComponents(),
      });
      return;
    }

    // أزرار التحكم
    if (interaction.isButton()) {
      let volumeChanged = false;
      let volumePercent = 50;

      switch (interaction.customId) {
        case 'pause':
          player.pause();
          await interaction.reply({ content: '⏸️ تم إيقاف التلاوة مؤقتًا.', ephemeral: true });
          break;
        case 'play':
          player.unpause();
          await interaction.reply({ content: '▶️ تم استئناف التلاوة.', ephemeral: true });
          break;
        case 'stop':
          player.stop();
          await interaction.reply({ content: '⏹️ تم إيقاف التلاوة.', ephemeral: true });
          break;
        case 'vol_up':
          if (currentResource?.volume) {
            let current = currentResource.volume.volume;
            current = Math.min(current + 0.1, 2.0);
            currentResource.volume.setVolume(current);
            volumeChanged = true;
            volumePercent = Math.round(current * 100);
            await interaction.reply({ content: `🔊 تم رفع الصوت إلى ${volumePercent}%`, ephemeral: true });
          }
          break;
        case 'vol_down':
          if (currentResource?.volume) {
            let current = currentResource.volume.volume;
            current = Math.max(current - 0.1, 0.1);
            currentResource.volume.setVolume(current);
            volumeChanged = true;
            volumePercent = Math.round(current * 100);
            await interaction.reply({ content: `🔉 تم خفض الصوت إلى ${volumePercent}%`, ephemeral: true });
          }
          break;
      }
    }
  },
};
