import type { IAuctionLot } from '@/database';
import { HexColorString, MessageEmbed } from 'discord.js';
import DotEnv from 'dotenv';

DotEnv.config();

const EMOTES = {
  COIN: process.env.EMOTE_COIN,
  CHECK: process.env.EMOTE_CHECK,
  CANCEL: process.env.EMOTE_CANCEL,
  LIST_ITEM: process.env.EMOTE_LIST_ITEM,
};

const EMBED_COLOR =
  (process.env.EMBED_COLOR as HexColorString) || ('#b072ff' as HexColorString);

export function embedAuctionLot(
  lotInfo: Omit<IAuctionLot, 'id'>,
  lotNumber: Number,
  declareWinner: boolean = false,
) {
  if (!lotInfo.startingBid) {
    return;
  }

  const fields: { name: string; value: string; inline?: boolean }[] = [
    {
      name: 'Starting Bid',
      value: `${EMOTES.COIN} ${lotInfo.startingBid.toLocaleString('en-us')}`,
      inline: true,
    },
  ];

  if (lotInfo.currentBid || declareWinner) {
    fields.push({
      name: declareWinner ? 'Winning Bid' : 'Current Bid',
      value: `${EMOTES.COIN} ${
        lotInfo.currentBid?.toLocaleString('en-us') || 'No Bids'
      }`,
      inline: true,
    });
  }

  if (lotInfo.currentLeader || declareWinner) {
    fields.push({
      name: declareWinner ? 'Winner' : 'Current Leader',
      value: `${
        lotInfo.currentLeader ? `<@${lotInfo.currentLeader}>` : 'No Winner'
      }`,
      inline: true,
    });
  }

  return new MessageEmbed()
    .setTitle(`Lot ${lotNumber}: ${lotInfo.title}`)
    .setDescription(lotInfo.description)
    .setImage(lotInfo.image || '')
    .setFields(fields)
    .setColor(EMBED_COLOR);
}
