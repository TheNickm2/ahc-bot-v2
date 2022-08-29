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

  if (lotInfo.currentBid) {
    fields.push({
      name: declareWinner ? 'Winning Bid' : 'Current Bid',
      value: `${EMOTES.COIN} ${lotInfo.currentBid.toLocaleString('en-us')}`,
      inline: true,
    });
  }

  if (lotInfo.currentLeader) {
    fields.push({
      name: declareWinner ? 'Winner' : 'Current Leader',
      value: `<@${lotInfo.currentLeader}>`,
      inline: true,
    });
  }

  return new MessageEmbed()
    .setTitle(lotInfo.title)
    .setDescription(lotInfo.description)
    .setImage(lotInfo.image || '')
    .setFields(fields)
    .setColor(EMBED_COLOR);
}
