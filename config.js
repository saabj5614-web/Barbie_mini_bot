/**
 * Barbie Mini Bot - Unified Config
 * Full WhatsApp Bot + Telegram Pairing
 */

module.exports = {
    // ========== TELEGRAM ==========
    TELEGRAM_BOT_TOKEN: "8970157625:AAErGgG2uv-wQRZANYlF4QjEp9iavC5bjFc",
    OWNER_TELEGRAM_ID: 7268245780,

    // ========== WHATSAPP OWNER ==========
    ownerNumber: ['923483763349'],
    ownerName: ['𓆩 𝑀𝑅 𝑅𝛯𝐻𝐴𝑁 𓆪'],

    // ========== BOT INFO ==========
    botName: 'Barbie Mini Bot',
    prefix: '.',
    sessionName: 'session',
    sessionID: process.env.SESSION_ID || '',
    newsletterJid: '120363161513685998@newsletter',
    updateZipUrl: '',

    // Sticker
    packname: 'Barbie Mini Bot',

    // Behavior
    selfMode: false,
    autoRead: false,
    autoTyping: false,
    autoBio: false,
    autoSticker: false,
    autoReact: false,
    autoReactMode: 'bot',
    autoDownload: false,

    // Group defaults
    defaultGroupSettings: {
      antilink: false,
      antilinkAction: 'delete',
      antitag: false,
      antitagAction: 'delete',
      antiall: false,
      antiviewonce: false,
      antibot: false,
      antibotAction: 'warn',
      anticall: false,
      antigroupmention: false,
      antigroupmentionAction: 'delete',
      antigroupstatus: false,
      antigroupstatusAction: 'delete',
      antisticker: false,
      antistickerAction: 'delete',
      antibadword: false,
      antibadwordAction: 'delete',
      welcome: false,
      welcomeMessage: '╭╼━≪•𝙽𝙴𝚆 𝙼𝙴𝙼𝙱𝙴𝚁•≫━╾╮\n┃𝚆𝙴𝙻𝙲𝙾𝙼𝙴: @user 👋\n┃Member count: #memberCount\n┃𝚃𝙸𝙼𝙴: time⏰\n╰━━━━━━━━━━━━━━━╯\n\n*@user* Welcome to *@group*! 🎉\n*Group 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝚃𝙸𝙾𝙽*\ngroupDesc\n\n> *ᴘᴏᴡᴇʀᴇᴅ ʙʏ Barbie Mini Bot*',
      goodbye: false,
      goodbyeMessage: 'Goodbye @user 👋 We will never miss you!',
      antiSpam: false,
      antidelete: false,
      nsfw: false,
      detect: false,
      chatbot: false,
      autosticker: false
    },

    apiKeys: {
      openai: '',
      deepai: '',
      remove_bg: ''
    },

    messages: {
      wait: '⏳ Please wait...',
      success: '✅ Success!',
      error: '❌ Error occurred!',
      ownerOnly: '👑 This command is only for bot owner!',
      adminOnly: '🛡️ This command is only for group admins!',
      groupOnly: '👥 This command can only be used in groups!',
      privateOnly: '💬 This command can only be used in private chat!',
      botAdminNeeded: '🤖 Bot needs to be admin to execute this command!',
      invalidCommand: '❓ Invalid command! Type .menu for help'
    },

    timezone: 'Asia/Karachi',
    maxWarnings: 3,

    social: {
      github: '',
      instagram: '',
      youtube: '',
      channel: 'https://t.me/killer_king_302'
    },

    // ========== MONGODB ==========
    MONGO_URI: "mongodb+srv://saabj5614_db_user:1J3ZugaURat9tM1Y@barbie.ypcng5s.mongodb.net/rehanbot?retryWrites=true&w=majority&appName=Barbie",

    // ========== CHANNELS (Force Join) ==========
    // Yahan apne channels daalo. required: true = force join
    // Empty link wale skip ho jayenge
    // 6+ slots ready hain
    CHANNELS: [
      {
        id: "@killer_king_302",
        name: "Telegram Channel",
        link: "https://t.me/killer_king_302",
        required: true
      },
      {
        id: "whatsapp_channel_1",
        name: "WhatsApp Channel 1",
        link: "",
        required: false
      },
      {
        id: "whatsapp_channel_2",
        name: "WhatsApp Channel 2",
        link: "",
        required: false
      },
      {
        id: "channel_3",
        name: "Channel 3",
        link: "",
        required: false
      },
      {
        id: "channel_4",
        name: "Channel 4",
        link: "",
        required: false
      },
      {
        id: "channel_5",
        name: "Channel 5",
        link: "",
        required: false
      },
      {
        id: "channel_6",
        name: "Channel 6",
        link: "",
        required: false
      }
    ],

    // ========== PREMIUM ==========
    PREMIUM: {
      enabled: true,
      freeLimit: 2,
      contact: "https://t.me/killer_king_302"
    }
};
