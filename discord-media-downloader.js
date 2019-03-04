const Discord = require('discord.js');
const https = require('https');
const fs = require('fs');

const client = new Discord.Client();

// Configuration variables
const BOT_TOKEN = 'YOUR TOKEN HERE';
const SERVER_NAME = 'DESIRED SERVER NAME HERE';
const CHANNEL_NAME = 'DESIRED CHANNEL NAME HERE';

let links = [];

let filenames = {};

function determineAttachmentName(attachment) {
    const fn = attachment.filename;
    if (fs.existsSync(`${CHANNEL_NAME}/${fn}`)) {
        if (filenames[fn]) {
            filenames[fn]++;
        } else {
            filenames[fn] = 1;
        }
        const [name, extension] = fn.split('.');

        return `${name} (${filenames[fn]}).${extension}`;
    }

    return fn;
}

function retrieveAttachments(msg) {
    if (msg.attachments) {
        msg.attachments.forEach(attachment => {
            if (!fs.existsSync(CHANNEL_NAME)) fs.mkdirSync(CHANNEL_NAME);
            const file = fs.createWriteStream(`${CHANNEL_NAME}/${determineAttachmentName(attachment)}`);
            const request = https.get(attachment.url, function(response) {
                response.pipe(file);
            });
        });
    }
}

function retrieveLinks(msg, links) {
    if (msg.embeds) {
        msg.content.split(' ').forEach(word => {
            if ((word.startsWith('http://') || word.startsWith('https://')) && !links.includes(word)) {
                links.push(word);
            }
        });
    }
}

client.on('ready', async () => {
    console.log(`Attempting to download media from the ${CHANNEL_NAME} channel in ${SERVER_NAME} server...`)
    const desiredGuild = client.guilds.filter(guild => guild.name === SERVER_NAME).array()[0];
    const desiredChannel = desiredGuild.channels.filter(channel => channel.name === CHANNEL_NAME).array()[0];
    let msgs = (await desiredChannel.fetchMessages()).array();
    while (msgs.length !== 0) {
        msgs.forEach(msg => { 
            retrieveAttachments(msg);
            retrieveLinks(msg, links);
        });
        const lastMsg = msgs[msgs.length - 1];
        msgs = (await desiredChannel.fetchMessages({ before: lastMsg.id })).array();
    }

    fs.writeFileSync('links.txt', links.join('\n') + '\n');
    console.log('All done!');
});

client.login(BOT_TOKEN);
