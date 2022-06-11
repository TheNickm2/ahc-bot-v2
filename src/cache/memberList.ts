import { AhfGuildMember, getAhcMembers, getUpcMembers, Logger } from '@/utils';
import { Collection } from 'discord.js';
import schedule from 'node-schedule';

let ahcMembers = new Collection<string, AhfGuildMember>();
let upcMembers = new Collection<string, AhfGuildMember>();
let lastUpdated = new Date();

export async function initializeAhcMemberCache() {
  const job = schedule.scheduleJob('0 0 * * * *', async () => {
    await revalidateMembers();
  });
  job.invoke();
}

export function getMembers() {
  return {
    AHC: ahcMembers,
    UPC: upcMembers,
    lastUpdated,
  };
}

async function revalidateMembers() {
  ahcMembers = (await getAhcMembers()) || new Collection();
  upcMembers = (await getUpcMembers()) || new Collection();
  lastUpdated = new Date();
  Logger.info(`Member list cache updated.`);
}
