import { Logger } from '@/utils';
import { getRedisKeyValue } from '@/utils/redis';

export async function getAuctionEndDate() {
  try {
    const end = await getRedisKeyValue('auctionEndDate');
    if (!end) return;
    return new Date(end);
  } catch (err) {
    Logger.error(err);
  }
}
