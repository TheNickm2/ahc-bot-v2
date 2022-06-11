import { getTopSellersAhc, getTopSellersUpc } from '@/utils';
import { Collection } from 'discord.js';
import schedule from 'node-schedule';

let topSellersAhc: Collection<string, number> = new Collection();
let topSellersUpc: Collection<string, number> = new Collection();

export async function initializeTopSellerCache() {
  const job = schedule.scheduleJob('0 0 * * * *', async () => {
    await revalidateTopSellers();
  });
  job.invoke();
}

export function getTopSellers() {
  return {
    AHC: topSellersAhc,
    UPC: topSellersUpc,
  };
}

async function revalidateTopSellers() {
  topSellersAhc = await getTopSellersAhc() || new Collection();
  topSellersUpc = await getTopSellersUpc() || new Collection();
}