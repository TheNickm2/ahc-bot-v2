import { getRedisKeyValue, setRedisKeyValue } from '@/utils';
import { endAuction } from '@/utils/endAuction';
import { Logger } from '@/utils/logger';
import schedule from 'node-schedule';
import Sugar from 'sugar';

export let isAuctionActive = false;

export async function activateAuction(endDate: Date) {
  try {
    const redisDatePromise = setRedisKeyValue(
      'auctionEndDate',
      endDate.toUTCString(),
    );
    const redisActivePromise = setRedisKeyValue('auctionActive', 'true');
    const initJobPromise = initializeAuctionEndJob(endDate);
    const [dateResult, activateResult, initJobResult] = await Promise.all([
      redisDatePromise,
      redisActivePromise,
      initJobPromise,
    ]);
    if (!dateResult || !activateResult || !initJobPromise) {
      Logger.error(
        `Failed to activate auction. Date: ${dateResult}, Activate: ${activateResult}, Create Job Result: ${initJobResult}`,
      );
    }
    return Boolean(dateResult && activateResult && initJobPromise);
  } catch (err) {
    Logger.error(err);
  }
}

export async function initializeAuctionEndJob(endDate: Date) {
  try {
    Logger.info('Initializing auction end job');
    const job = schedule
      .scheduleJob(endDate, async () => {
        await endAuction();
      })
      .addListener('success', () => Logger.info('Auction ended successfully'))
      .addListener('error', (err) =>
        Logger.error(`Failed to end auction: ${err}`),
      );
    return job;
  } catch (err) {
    Logger.error(err);
    return false;
  }
}
