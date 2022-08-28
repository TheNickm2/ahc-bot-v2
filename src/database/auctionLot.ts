import { Schema, model, connection } from 'mongoose';

export interface IAuctionLot {
  title: string;
  description: string;
  image?: string;
  startingBid: number;
  currentBid?: number;
  currentLeader?: string;
  paid?: boolean;
  sent?: boolean;
  id: string;
}

const auctionLotSchema = new Schema<IAuctionLot>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  startingBid: { type: Number, required: true },
  currentBid: Number,
  currentLeader: String,
  paid: Boolean,
  sent: Boolean,
  id: { type: String, required: true, unique: true },
});

const AuctionLot = model<IAuctionLot>('AuctionLot', auctionLotSchema);

export async function getAuctionLot(lotId: string) {
  try {
    const result = await AuctionLot.findOne({ id: lotId });
    if (result) {
      return result;
    }
  } catch (err) {
    console.error(err);
  }
}

export async function saveAuctionLot(lot: IAuctionLot) {
  try {
    const existingLot = await getAuctionLot(lot.id);
    if (existingLot) {
      existingLot.overwrite(lot);
      await existingLot.save();
      return existingLot;
    } else {
      const result = await AuctionLot.create(lot);
      return result;
    }
  } catch (err) {
    console.error(err);
  }
}
