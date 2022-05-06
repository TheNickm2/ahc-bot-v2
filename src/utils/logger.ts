import chalk from 'chalk';

export const Logger = {
  debug: (msg: string) => {
    console.log(`[${chalk.gray('DEBUG')}] ${msg}`);
  },
  info: (msg: string) => {
    console.log(`[${chalk.blue('INFO')}] ${msg}`);
  },
  warn: (msg: string) => {
    console.warn(`[${chalk.yellow('WARN')}] ${msg}`);
  },
  error: (msg: string) => {
    console.error(`[${chalk.red('ERROR')}] ${msg}`);
  },
};
