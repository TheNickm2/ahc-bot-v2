import { getTopSellersAhc, Logger } from '@/utils';
import { Collection } from 'discord.js';
import schedule from 'node-schedule';

let topSellersAhc: Collection<string, number> = new Collection();
// let topSellersUpc: Collection<string, number> = new Collection();
let lastUpdated = new Date();

export async function initializeTopSellerCache() {
  const job = schedule.scheduleJob('0 0 * * * *', async () => {
    await revalidateTopSellers();
  });
  job.invoke();
}

export function getTopSellers() {
  return {
    AHC: topSellersAhc,
    // UPC: topSellersUpc,
    lastUpdated,
  };
}

async function revalidateTopSellers() {
  topSellersAhc = await getTopSellersAhc() || new Collection();
  // topSellersUpc = await getTopSellersUpc() || new Collection();
  lastUpdated = new Date();
  Logger.info(`Top seller cache updated.`);
}