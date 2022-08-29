import { embedLogMsg } from '@/embeds';
import chalk from 'chalk';
import { WebhookClient } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const logLevel = process.env.LOG_LEVEL?.trim().toLowerCase() || 'error';

export const Logger = {
  debug: (msg: any) => {
    console.log(`[${chalk.gray('DEBUG')}] ${msg}`);
    if (logLevel === 'debug') {
      writeLogToDiscord(msg, 'debug');
    }
  },
  info: (msg: any) => {
    console.log(`[${chalk.cyan('INFO')}] ${msg}`);
    if (logLevel === 'info' || logLevel === 'debug') {
      writeLogToDiscord(msg, 'info');
    }
  },
  warn: (msg: any) => {
    console.warn(`[${chalk.yellow('WARN')}] ${msg}`);
    if (logLevel === 'warn' || logLevel === 'info' || logLevel === 'debug') {
      writeLogToDiscord(msg, 'warn');
    }
  },
  error: (msg: any) => {
    console.error(`[${chalk.red('ERROR')}] ${msg}`);
    if (
      logLevel === 'error' ||
      logLevel === 'warn' ||
      logLevel === 'info' ||
      logLevel === 'debug'
    ) {
      writeLogToDiscord(msg, 'error');
    }
  },
};

async function writeLogToDiscord(
  msg: string,
  logLevel: 'debug' | 'info' | 'warn' | 'error',
) {
  const webhookUrl = process.env.ERROR_LOG_WEBHOOK_URL;
  if (!webhookUrl) return;
  const webhookClient = new WebhookClient({
    url: webhookUrl,
  });
  const logEmbed = embedLogMsg(msg, logLevel);
  const result = await webhookClient.send({
    embeds: [logEmbed],
  });
}
