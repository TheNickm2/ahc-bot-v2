import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import * as DotEnv from 'dotenv';
import { Commands } from '@/commands';
import type { Command } from '@/commands';
import { Logger } from '@/utils';

DotEnv.config();

const botToken = process.env.BOT_TOKEN;
const appId = process.env.APP_ID;

if (!botToken || !appId) {
  Logger.error('BOT_TOKEN and APP_ID are required environment variables.');
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(botToken);

(async () => {
  Logger.info('Started refreshing application (slash) commands');

  const commandsList = Object.keys(Commands).map((_k, index) => {
    const command = Commands[index] as Command;
    return command.createCommand().toJSON();
  });

  await rest.put(Routes.applicationCommands(appId), {
    body: commandsList,
  });

  Logger.info('Successfully refreshed application (slash) commands');
})();
