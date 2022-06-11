import { Commands } from './commands';
import { CacheType, Client, Intents, Interaction } from 'discord.js';
import { EventEmitter } from 'events';
import * as Dotenv from 'dotenv';
import { initLogger, Logger } from '@/utils';
import { initializeAhcMemberCache, initializeTopSellerCache } from '@/cache';

Dotenv.config();

const Emitter = new EventEmitter();

function Main() {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      Logger.error('BOT_TOKEN environment variable is required.');
      return;
    }

    const botClient = new Client({
      intents: [
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
      ],
      ws: {
        properties: {
          $browser: 'Discord iOS',
        },
      },
    });

    botClient.on('ready', () => {
      initLogger(botClient);
      Logger.info(`Logged in as ${botClient.user?.username}`);
      (async () => {
        initializeTopSellerCache();
        initializeAhcMemberCache();
      })();
    });

    botClient.on('interactionCreate', InteractionHandler);

    Commands.forEach((command) => {
      command.registerEvents(Emitter);
    });

    // * debug-level logging for discord.js websocket connection
    // botClient.on('debug', (msg) => Logger.debug(msg));

    botClient.login(botToken);
  } catch (err) {
    if (err) {
      Logger.error(
        `An error occurred while creating the bot client. See error below.\n${err}`,
      );
    } else {
      Logger.error(
        `An error occurred while creating the bot client. No error message has been provided.`,
      );
    }
  }
}

async function InteractionHandler(interaction: Interaction<CacheType>) {
  try {
    if (interaction.isCommand()) {
      const command = Commands.find(
        (cmd) => cmd.createCommand().name === interaction.commandName,
      );
      if (!command) return;
      await command.executeCommand(interaction);
    } else if (interaction.isButton() || interaction.isModalSubmit()) {
      Emitter.emit(interaction.customId, interaction);
    }
  } catch (err) {
    if (err) {
      Logger.error(
        `An error occurred while handling an interaction. See error below.\n${err}\n\n${
          (err as Error).stack
        }`,
      );
    } else {
      Logger.error(
        `An error occurred while handling an interaction. No error message has been provided.`,
      );
    }
  }
}

Main();
