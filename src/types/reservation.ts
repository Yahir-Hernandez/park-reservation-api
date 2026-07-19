export interface Reservation {
  id: number;
  userId: number;
  parkId: number;
  startDate: Date;
  endDate: Date;
  numPeople: number;
  visitType: string;
  status: string;
  createdAt: Date;
}

export type ReserFilter = Partial<Reservation>;