import { Schema, model, connection } from 'mongoose';
import { Logger } from '@/utils/logger';

export interface IAuctionBid {
  interactionId: string;
  userId: string;
  lotId: string;
  bidAmount: number;
}

const auctionBidSchema = new Schema<IAuctionBid>({
  interactionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  lotId: { type: String, required: true },
  bidAmount: { type: Number, required: true },
});

const AuctionBid = model<IAuctionBid>('AuctionBid', auctionBidSchema);

export async function getAuctionBid(interactionId: string) {
  try {
    const result = await AuctionBid.findOne({ id: interactionId });
    if (result) {
      return result;
    }
  } catch (err) {
    Logger.error(err);
  }
}

export async function saveAuctionBid(bid: IAuctionBid) {
  try {
    const existingBid = await getAuctionBid(bid.interactionId);
    if (existingBid) {
      existingBid.overwrite(bid);
      await existingBid.save();
      return existingBid;
    } else {
      const result = await AuctionBid.create(bid);
      return result;
    }
  } catch (err) {
    Logger.error(err);
  }
}
