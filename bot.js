const TelApi = require('node-telegram-bot-api')
const token = '[DELETED]'
const axios = require('axios')
const db = require('./database')

const bot = new TelApi(token, { polling: true })

var convert = require('xml-js');
var gettingMoney = 0

let iconv = require('iconv-lite');

const start = () => {

    bot.setMyCommands([
        { command: '/start', description: 'Начало начал' },
        { command: '/info', description: 'Возник вопрос' },
        { command: '/go', description: 'Показать курс валюты' },


    ])

    bot.on('message', async msg => {
        console.log('Получено сообщение:');
        console.log(msg.message_id);
        console.log(msg.from.username);
        console.log(msg.chat.id);
        console.log(msg.text);
        const text = msg.text;
        const chatId = msg.chat.id;
        // const userName = msg.from.username;

        userName = msg.from.first_name + ' ' + msg.from.last_name
        if (text === '/start') {
            await db.insertUserInfo(chatId, userName);
            await bot.sendMessage(chatId, 'Добро пожаловать!')
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/5ba/fb7/5bafb75c-6bee-39e0-a4f3-a23e523feded/1.webp')
            return 0;
        }
        if (text === '/info') {
            await db.updateUserInfo(chatId, 0);
            await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/5ba/fb7/5bafb75c-6bee-39e0-a4f3-a23e523feded/46.webp')
            await bot.sendMessage(chatId, 'Что за бот?')
            await bot.sendMessage(chatId, 'Бот позволяет узнавать курс валют')
            return 0;
        }
        if (text === '/go') {
            // await getMoney(chatId, '10/11/2002');

            // gettingMoney = 1
            await db.updateUserInfo(chatId, 1)
            await chooseMoney(chatId)
            return 0;
        }

        try {

            await getMoney(chatId, text);
            await db.updateUserInfo(chatId, 0);
        } catch (error) {
            console.log(error.message);
            bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/5ba/fb7/5bafb75c-6bee-39e0-a4f3-a23e523feded/7.webp')

        }
    })

}

start()

bot.on('callback_query', async(msg) => {
    console.log(msg.data)
    console.log(msg.from.id)
    const text = msg.data
    const chatId = msg.from.id
    if (text === '/USD') {
        console.log('!!!!!!!!!!USD!!!!!!');
        await db.updateUserInfo(chatId, 9);
        await bot.sendMessage(chatId, 'Введите дату в формате дд/мм/гггг')
    }
    if (text === '/EUR') {
        console.log('????EUR????');
        await db.updateUserInfo(chatId, 10);
        await bot.sendMessage(chatId, 'Введите дату в формате дд/мм/гггг')
    }
})

var config = {
    headers: { 'Content-Type': 'text/xml' }
};


async function chooseMoney(chatId) {
    return bot.sendMessage(chatId, 'Выберите валюту:', likeButton = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'USD', callback_data: '/USD' }, { text: 'EUR', callback_data: '/EUR' }]
            ]
        })
    })
}

async function getMoney(chatId, date) {
    date = date.replace('.', '/');
    date = date.replace('.', '/');

    var cy = await db.getUserState(chatId);
    if (cy > 3) {
        let response = await axios.get('https://www.cbr.ru/scripts/XML_daily.asp?date_req=' + date, {
            responseType: 'arraybuffer',
            responseEncoding: 'binary'
        });

        response = iconv.decode(Buffer.from(response.data), 'windows-1251')
        var result = convert.xml2json(response, { compact: true, spaces: 4 });
        result = JSON.parse(result)
        result = result['ValCurs']['Valute']
            // await bot.sendMessage(chatId, result[0]['Name']);



        for (var i = 0; i < result.length; i++) {
            if (result[i]['CharCode']['_text'] == "USD" && cy == 9) {
                var answer = 'Курс валюты ' + result[i]['Name']['_text'] + ' за ' + date + ' составляет ' + result[i]['Value']['_text']
                await bot.sendMessage(chatId, answer);
                return 0;
            }
            if (result[i]['CharCode']['_text'] == "EUR" && cy == 10) {
                var answer = 'Курс валюты ' + result[i]['Name']['_text'] + ' за ' + date + ' составляет ' + result[i]['Value']['_text']

                await bot.sendMessage(chatId, answer);
                return 0;
            }
        }

        // console.log(result);

    }

}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}