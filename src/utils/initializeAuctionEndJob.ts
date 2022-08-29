import { getRedisKeyValue, setRedisKeyValue } from '@/utils';
import { endAuction } from '@/utils/endAuction';
import { Logger } from '@/utils/logger';
import { Client, TextChannel } from 'discord.js';
import schedule from 'node-schedule';
import Sugar from 'sugar';

export let isAuctionActive = false;

export async function activateAuction(
  endDate: Date,
  client: Client,
  channel: TextChannel,
) {
  try {
    const redisDatePromise = setRedisKeyValue(
      'auctionEndDate',
      endDate.toUTCString(),
    );
    const redisActivePromise = setRedisKeyValue('auctionActive', 'true');
    const redisChannelIdPromise = setRedisKeyValue(
      'auctionChannelId',
      channel.id,
    );
    const initJobPromise = initializeAuctionEndJob(endDate, client);
    const [dateResult, activateResult, initJobResult, channelIdResult] =
      await Promise.all([
        redisDatePromise,
        redisActivePromise,
        initJobPromise,
        redisChannelIdPromise,
      ]);
    if (!dateResult || !activateResult || !channelIdResult || !initJobPromise) {
      Logger.error(
        `Failed to activate auction. Date: ${dateResult}, Activate: ${activateResult}, Create Job Result: ${initJobResult}`,
      );
    }
    return Boolean(
      dateResult && activateResult && channelIdResult && initJobPromise,
    );
  } catch (err) {
    Logger.error(err);
  }
}

export async function initializeAuctionEndJob(endDate: Date, client: Client) {
  try {
    Logger.info('Initializing auction end job');
    const job = schedule
      .scheduleJob(endDate, async () => {
        await endAuction(client);
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
