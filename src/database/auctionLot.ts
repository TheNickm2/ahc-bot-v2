import { Logger } from '@/utils';
import { Schema, model, connection } from 'mongoose';

export interface IAuctionLot {
  title: string;
  description: string;
  image?: string;
  startingBid: number;
  currentBid?: number;
  currentLeader?: string;
  id: string;
}

const auctionLotSchema = new Schema<IAuctionLot>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: String,
  startingBid: { type: Number, required: true },
  currentBid: Number,
  currentLeader: String,
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
    Logger.error(err);
  }
}

export async function getAllAuctionLots() {
  try {
    const result = await AuctionLot.find();
    if (result && result.length) {
      return result;
    }
  } catch (err) {
    Logger.error(err);
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
    Logger.error(err);
  }
}

export async function deleteAuctionLot(lotId: string) {
  try {
    const result = await AuctionLot.findOneAndDelete({ id: lotId });
    if (result) {
      return true;
    }
  } catch (err) {
    Logger.error(err);
  }
}

export async function deleteAllAuctionLots() {
  try {
    const result = await AuctionLot.deleteMany();
    if (result) {
      return true;
    }
  }
  catch (err) {
    Logger.error(err);
  }
}
