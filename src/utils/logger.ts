import chalk from 'chalk';
import { Client } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

let discordClient: Client | undefined;

export function initLogger(client: Client) {
  discordClient = client;
}

export const Logger = {
  debug: (msg: any) => {
    console.log(`[${chalk.gray('DEBUG')}] ${msg}`);
  },
  info: (msg: any) => {
    console.log(`[${chalk.cyan('INFO')}] ${msg}`);
  },
  warn: (msg: any) => {
    console.warn(`[${chalk.yellow('WARN')}] ${msg}`);
  },
  error: (msg: any) => {
    console.error(`[${chalk.red('ERROR')}] ${msg}`);
    try {
      const errorServerId = process.env.ERROR_SERVER_ID;
      const errorChannelId = process.env.ERROR_CHANNEL_ID;
      if (!errorServerId || !errorChannelId || !discordClient) {
        return;
      }
      discordClient.guilds
        .fetch(errorServerId)
        .then((server) => {
          if (!server) {
            return;
          }
          server.channels
            .fetch(errorChannelId)
            .then((channel) => {
              if (!channel || !channel.isText()) {
                return;
              }
              channel.send(`${'`'}${msg}${'`'}`);
            })
            .catch((err) => {
              throw err;
            });
        })
        .catch((err) => {
          throw err;
        });
    } catch (err) {
      console.error(`Unable to send error message to Discord channel.`);
    }
  },
};
