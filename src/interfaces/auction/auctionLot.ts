export interface AuctionBid {
  userId: string;
  messageId: string;
  interactionId: string;
  amount: number;
}

export interface AuctionLot {
  messageId: string;
  title: string;
  description: string;
  imageUrl: string;
  startingBid: number;
  currentBid?: number;
  currentLeaderId?: string;
  paid?: boolean;
  sent?: boolean;
}

export interface AuctionLotHistory {
  messageId: string;
  data: string;
  winnerId: string;
  winningBid: number;
}
