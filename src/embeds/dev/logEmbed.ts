import { HexColorString, EmbedBuilder } from 'discord.js';

const LogLevelEmojis = {
  debug: '🐞',
  info: '📝',
  warn: '⚠️',
  error: '🔴',
};

const LogLevelColors = {
  debug: '#56606a',
  info: '#5865f2',
  warn: '#fee75c',
  error: '#ed4245',
} as { [key: string]: HexColorString };

const capitalizeFirstLetter = (string: string) =>
  string.charAt(0).toUpperCase() + string.slice(1);

export function embedLogMsg(
  msg: string,
  logLevel: 'debug' | 'info' | 'warn' | 'error',
) {
  return new EmbedBuilder()
    .setTitle(
      `${LogLevelEmojis[logLevel]} ${capitalizeFirstLetter(logLevel)} Log ${
        LogLevelEmojis[logLevel]
      }`,
    )
    .setDescription(`${'```'}\n${msg}\n${'```'}`)
    .addFields([
      {
        name: 'Log Level',
        value: capitalizeFirstLetter(logLevel),
      },
    ])
    .setColor(LogLevelColors[logLevel])
    .setTimestamp();
}
