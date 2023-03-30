import { Commands } from './commands';
import {
  CacheType,
  ChatInputCommandInteraction,
  Client,
  GatewayIntentBits,
  Interaction,
  InteractionType,
} from 'discord.js';
import { EventEmitter } from 'events';
import * as Dotenv from 'dotenv';
import { getRedisKeyValue, initializeAuctionEndJob, Logger } from '@/utils';
import { initializeAhcMemberCache, initializeTopSellerCache } from '@/cache';
import { connect, connection } from 'mongoose';
import Sugar from 'sugar';

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
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
      ],
      ws: {
        properties: {
          browser: 'Discord iOS',
        },
      },
    });

    botClient.on('ready', () => {
      Logger.info(`Logged in as ${botClient.user?.username}`);
      (async () => {
        initializeTopSellerCache();
        initializeAhcMemberCache();
        const isAuctionActive = await getRedisKeyValue('auctionActive');
        if (isAuctionActive === 'true') {
          const endDate = Sugar.Date.create(
            (await getRedisKeyValue('auctionEndDate')) || undefined,
          );
          if (endDate) {
            initializeAuctionEndJob(endDate, botClient);
          }
        }
      })();
    });

    botClient.on('interactionCreate', InteractionHandler);

    Commands.forEach((command) => {
      command.registerEvents(Emitter);
    });

    // * debug-level logging for discord.js websocket connection
    // botClient.on('debug', (msg) => Logger.debug(msg));

    // Initialize database connection
    connect(process.env.MONGODB_STRING ?? '')
      .then(() =>
        Logger.info(`MongoDB connection ready on port ${connection.port}`),
      )
      .catch((err) => Logger.error(err));

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
    if (interaction.type === InteractionType.ApplicationCommand) {
      const command = Commands.find(
        (cmd) => cmd.createCommand().name === interaction.commandName,
      );
      if (!command) return;
      await command.executeCommand(interaction as ChatInputCommandInteraction);
    } else if (
      interaction.type === InteractionType.MessageComponent ||
      interaction.type === InteractionType.ModalSubmit
    ) {
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
