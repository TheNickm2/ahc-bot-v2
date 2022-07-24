import type { AuctionLot } from "@/interfaces";

export interface Auction {
  id: string;
  lots: AuctionLot[];
  endDate: Date;
  isActive: boolean;
}
