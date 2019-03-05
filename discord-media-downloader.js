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
let lastMsgId = undefined; // used to pick up where it left off if an error occurs

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
            const name = determineAttachmentName(attachment);
            const file = fs.createWriteStream(`${CHANNEL_NAME}/${name}`);
            const request = https.get(attachment.url, function(response) {
                response.pipe(file);
                response.on('error', () => {
                    console.log(`Something went wrong when downloading ${name} at ${msg.createdAt}.`)
                });
                response.on('end', () => request.end());
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

async function fetch(channel, before = undefined) {
    const options = before ? { before } : {};
    try {
        const messages = await channel.fetchMessages(options);
        return messages.array();
    } catch (e) {
        console.log(`Something went wrong! Error: ${e.name}`);
        console.log('Trying again...');
        return await fetch(channel, before);
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function iterateThroughMessages(channel, lastMsgId) {
    let msgs = await fetch(channel, lastMsgId);
    while (msgs.length !== 0) {
        msgs.forEach(msg => { 
            retrieveAttachments(msg);
            retrieveLinks(msg, links);
        });
        const lastMsg = msgs[msgs.length - 1];
        lastMsgId = lastMsg.id
        fs.writeFileSync('links.txt', links.join('\n') + '\n');
        await timeout(500); // handling rate limiting
        msgs = await fetch(channel, lastMsgId);
    }
}


function loginAndHandleErrors(client) {
    try {
        client.login(BOT_TOKEN);
    } catch (e) {
        console.log(`Something went wrong! Error: ${e.name}`);
        console.log('Reconnecting...');
        loginAndHandleErrors(client);
    }
}

client.on('ready', async () => {
    console.log(`Attempting to download media from the ${CHANNEL_NAME} channel in ${SERVER_NAME} server...`)
    const desiredGuild = client.guilds.filter(guild => guild.name === SERVER_NAME).array()[0];
    const desiredChannel = desiredGuild.channels.filter(channel => channel.name === CHANNEL_NAME).array()[0];
    await iterateThroughMessages(desiredChannel, lastMsgId);
    console.log('All done!');
});

loginAndHandleErrors(client);
process.on('error', () => loginAndHandleErrors(client)); // attempt to bypass random errors
