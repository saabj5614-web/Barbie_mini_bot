/**
 * Telegram Pairing Module for Barbie Mini Bot
 */
const TelegramBot = require('node-telegram-bot-api');
const { default: makeWASocket, useMultiFileAuthState, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const mongoose = require('mongoose');

let bot = null;
const activePairs = new Map();

const userSchema = new mongoose.Schema({
  telegramId: { type: Number, required: true, unique: true },
  username: String,
  firstName: String,
  isVerified: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  premiumUntil: Date,
  pairCountToday: { type: Number, default: 0 },
  lastPairDate: String,
  isBanned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

let User;
try {
  User = mongoose.model('User');
} catch {
  User = mongoose.model('User', userSchema);
}

async function getUser(tid) {
  let u = await User.findOne({ telegramId: tid });
  if (!u) u = await User.create({ telegramId: tid });
  return u;
}

async function updateUser(tid, data) {
  return User.findOneAndUpdate({ telegramId: tid }, { ...data }, { new: true, upsert: true });
}

async function canGeneratePair(tid) {
  const user = await getUser(tid);
  const today = new Date().toISOString().slice(0, 10);
  if (user.lastPairDate !== today) {
    user.pairCountToday = 0;
    user.lastPairDate = today;
    await user.save();
  }
  if (user.isPremium) {
    if (user.premiumUntil && user.premiumUntil < new Date()) {
      user.isPremium = false;
      await user.save();
    } else return { allowed: true };
  }
  if (user.pairCountToday >= (config.PREMIUM?.freeLimit || 2)) return { allowed: false };
  return { allowed: true };
}

async function increasePairCount(tid) {
  const today = new Date().toISOString().slice(0, 10);
  await User.findOneAndUpdate({ telegramId: tid }, { $inc: { pairCountToday: 1 }, lastPairDate: today });
}

function getForceJoinKeyboard() {
  const buttons = [];
  (config.CHANNELS || []).forEach(ch => {
    if (ch.link) buttons.push([{ text: `📢 ${ch.name}`, url: ch.link }]);
  });
  buttons.push([{ text: '✅ Verify', callback_data: 'verify_channels' }]);
  return { inline_keyboard: buttons };
}

async function checkChannelMembership(telegramId) {
  const required = (config.CHANNELS || []).filter(c => c.required && c.link);
  const results = [];
  for (const channel of required) {
    if (channel.id === 'whatsapp_channel') {
      results.push({ joined: true });
      continue;
    }
    try {
      const member = await bot.getChatMember(channel.id, telegramId);
      results.push({ joined: ['member', 'administrator', 'creator'].includes(member.status) });
    } catch {
      results.push({ joined: false });
    }
  }
  return results;
}

async function generatePairCode(number, telegramId) {
  return new Promise(async (resolve) => {
    try {
      const sessionPath = path.join(__dirname, 'sessions', `pair_${telegramId}`);
      if (!fs.existsSync(path.join(__dirname, 'sessions'))) fs.mkdirSync(path.join(__dirname, 'sessions'), { recursive: true });

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
      const { version } = await fetchLatestBaileysVersion();

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false
      });

      sock.ev.on('creds.update', saveCreds);

      if (!sock.authState.creds.registered) {
        setTimeout(async () => {
          try {
            const code = await sock.requestPairingCode(number);
            console.log(`[Telegram Pair] Code for ${number}: ${code}`);
            resolve(code);
            setTimeout(() => { try { sock.end(undefined); } catch {} }, 120000);
          } catch (e) {
            console.error('Pair error:', e.message);
            resolve(null);
          }
        }, 3000);
      } else resolve(null);
    } catch (e) {
      console.error(e);
      resolve(null);
    }
  });
}

async function startTelegramBot() {
  if (!config.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️ No Telegram token, skipping Telegram bot');
    return;
  }

  // Connect Mongo if not already
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(config.MONGO_URI);
      console.log('✅ MongoDB Connected (Telegram)');
    } catch (e) {
      console.error('Mongo error:', e.message);
    }
  }

  bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });
  console.log('✅ Telegram Pairing Bot started');

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const tid = msg.from.id;
    try {
      const user = await getUser(tid);
      await updateUser(tid, { username: msg.from.username, firstName: msg.from.first_name });
      if (user.isBanned) return bot.sendMessage(chatId, '❌ Banned.');
      if (user.isVerified) {
        return bot.sendMessage(chatId, '✅ Verified!\n\nApna WhatsApp number bhejo (example: 923001234567)', { parse_mode: 'Markdown' });
      }
      await bot.sendMessage(chatId, `🌸 *Welcome to Barbie Mini Bot*\n\nOwner: 𓆩 𝑀𝑅 𝑅𝛯𝐻𝐴𝑁 𓆪\n\nPehle channel join karo, phir Verify dabao.`, {
        parse_mode: 'Markdown',
        reply_markup: getForceJoinKeyboard()
      });
    } catch (e) {
      console.error(e);
      bot.sendMessage(chatId, '❌ Error');
    }
  });

  bot.on('callback_query', async (q) => {
    if (q.data !== 'verify_channels') return;
    const chatId = q.message.chat.id;
    const tid = q.from.id;
    try {
      const results = await checkChannelMembership(tid);
      if (results.some(r => !r.joined)) {
        await bot.answerCallbackQuery(q.id, { text: '❌ Channel join nahi kiya!', show_alert: true });
        return bot.sendMessage(chatId, '❌ Pehle channel join karo.', { reply_markup: getForceJoinKeyboard() });
      }
      await updateUser(tid, { isVerified: true });
      await bot.answerCallbackQuery(q.id, { text: '✅ Verified!' });
      await bot.sendMessage(chatId, '✅ *Verified!*\n\nAb apna WhatsApp number bhejo (example: 923001234567)', { parse_mode: 'Markdown' });
    } catch (e) {
      bot.sendMessage(chatId, '❌ Error');
    }
  });

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return;
    const chatId = msg.chat.id;
    const tid = msg.from.id;
    const text = msg.text.trim().replace(/\D/g, '');

    try {
      const user = await getUser(tid);
      if (user.isBanned) return bot.sendMessage(chatId, '❌ Banned.');
      if (!user.isVerified) {
        return bot.sendMessage(chatId, '⚠️ Pehle /start karke channel join + Verify karo.', { reply_markup: getForceJoinKeyboard() });
      }
      if (text.length < 10 || text.length > 15) {
        return bot.sendMessage(chatId, '❌ Invalid number. Example: 923001234567');
      }

      const { allowed } = await canGeneratePair(tid);
      if (!allowed) {
        return bot.sendMessage(chatId, `🔒 Free limit khatam.\nPremium ke liye: ${config.PREMIUM.contact}`);
      }

      if (activePairs.has(tid)) return bot.sendMessage(chatId, '⏳ Wait...');

      await bot.sendMessage(chatId, '⏳ Pair code generate ho raha hai...');
      activePairs.set(tid, true);

      const code = await generatePairCode(text, tid);
      activePairs.delete(tid);

      if (code) {
        await increasePairCount(tid);
        await bot.sendMessage(chatId, `🎉 *Pair Code Ready!*\n\n📱 Number: *${text}*\n🔑 Code: *${code}*\n\n1. WhatsApp → Linked Devices\n2. Link with phone number instead\n3. Code daalo\n\nCode 1-2 min mein expire ho sakta hai.`, { parse_mode: 'Markdown' });
      } else {
        await bot.sendMessage(chatId, '❌ Code generate nahi hua. Try again.');
      }
    } catch (e) {
      console.error(e);
      activePairs.delete(tid);
      bot.sendMessage(chatId, '❌ Error');
    }
  });

  // Owner commands
  bot.onText(/\/stats/, async (msg) => {
    if (msg.from.id !== config.OWNER_TELEGRAM_ID) return;
    const total = await User.countDocuments();
    const verified = await User.countDocuments({ isVerified: true });
    const premium = await User.countDocuments({ isPremium: true });
    bot.sendMessage(msg.chat.id, `📊 Total: ${total}\nVerified: ${verified}\nPremium: ${premium}`);
  });

  bot.onText(/\/premium (\d+) (\d+)/, async (msg, match) => {
    if (msg.from.id !== config.OWNER_TELEGRAM_ID) return;
    const tid = parseInt(match[1]);
    const days = parseInt(match[2]);
    const until = new Date();
    until.setDate(until.getDate() + days);
    await updateUser(tid, { isPremium: true, premiumUntil: until });
    bot.sendMessage(msg.chat.id, `✅ Premium given to ${tid} for ${days} days`);
    try { await bot.sendMessage(tid, `🎉 Premium activated for ${days} days!`); } catch {}
  });
}

module.exports = { startTelegramBot };
