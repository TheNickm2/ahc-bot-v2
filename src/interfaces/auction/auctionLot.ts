export interface AuctionBid {
  interactionId: string;
  userId: string;
  bidValue: number;
}

export interface AuctionLot {
  messageId: string;
  title: string;
  description: string;
  startingBid: number;
  currentBid?: number;
  currentLeaderId?: string;
  imageUrl: string;
  paid?: boolean;
  sent?: boolean;
  bids?: AuctionBid[];
}
