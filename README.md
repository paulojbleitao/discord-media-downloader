## Discord Media Downloader

This is a simple script powered by [discord.js](https://github.com/discordjs/discord.js) to help you mass download media from a specific Discord channel.

### Dependencies

To run this script, you need `node.js` installed in your computer. You also need a package manager like `npm` or `yarn`. I personally prefer `yarn`, but `npm` works fine too.

To set this up, all you need after installing the previously mentioned tools is to clone this repository, navigate to its folder, and type

```
npm install
```

if you're using `npm`. If you're using `yarn`, it's even easier. Type:

```
yarn
```

### Usage

After getting that out of the way, the only thing you're missing is a Discord bot account. [This tutorial](https://discordpy.readthedocs.io/en/rewrite/discord.html) might help.

At the very beginning of the `discord-media-downloader.js` file, you'll notice there are three fields for you to fill in. You'll have to inform your bot's access token, the name of the server you're trying to download media from, and the desired channel's name.

Now, all that's left is typing:

```
node discord-media-downloader.js
```

And waiting for a bit. It might take a while, especially if you're accessing a channel that has a lot of messages. Eventually, the program will print "All done!" on the console, signaling that it has finished.

You'll find all your images/videos/etc in a folder with the same name of the channel you just downloaded from. There'll also be a `links.txt` file containing every link posted in that channel. If you want media from other servers or channels, just alter the configuration variables accordingly and run the script again.
