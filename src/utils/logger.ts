import chalk from 'chalk';

export const Logger = {
  debug: (msg: any) => {
    console.log(`[${chalk.gray('DEBUG')}] ${msg}`);
  },
  info: (msg: any) => {
    console.log(`[${chalk.blue('INFO')}] ${msg}`);
  },
  warn: (msg: any) => {
    console.warn(`[${chalk.yellow('WARN')}] ${msg}`);
  },
  error: (msg: any) => {
    console.error(`[${chalk.red('ERROR')}] ${msg}`);
  },
};
