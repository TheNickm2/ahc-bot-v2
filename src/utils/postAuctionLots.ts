import { embedAuctionLot } from '@/embeds';
import { downloadAuctionLots } from '@/utils/downloadAuctionLots';
import { Logger } from '@/utils';
import type { TextBasedChannel } from 'discord.js';
import {
  getAllAuctionLots,
  IAuctionLot,
  saveAuctionLot,
  saveHistoricalLot,
} from '@/database';

export async function postAuctionLots(channel: TextBasedChannel) {
  try {
    const clearOldResult = await removeExistingLots(channel);
    if (!clearOldResult) return;
    const googleSheetsLots = await downloadAuctionLots();
    if (!googleSheetsLots || !googleSheetsLots.length) return;

    for (const lot of googleSheetsLots) {
      const msgEmbed = embedAuctionLot(lot);
      if (!msgEmbed) continue;

      const result = await channel.send({
        embeds: [msgEmbed],
      });
      if (!result) continue;

      const auctionLot: IAuctionLot = {
        id: result.id,
        ...lot,
      };
      const dbResult = await saveAuctionLot(auctionLot);
    }
    return true;
  } catch (err) {
    Logger.error(err);
  }
}

async function removeExistingLots(channel: TextBasedChannel) {
  try {
    const existingLots = await getAllAuctionLots();
    if (!existingLots || !existingLots.length) return true;

    for (const lot of existingLots) {
      channel.messages
        .fetch(lot.id)
        .then((msg) => {
          if (msg.deletable) msg.delete();
        })
        .catch((err) => {}); // Silence error that occurs when message is already deleted
      await lot.delete();
    }
    return true;
  } catch (err) {
    Logger.error(err);
  }
}
