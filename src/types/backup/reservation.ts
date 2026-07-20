export type VisitType = 'cabin' | 'camping';

export interface Reservation {
  id: number;
  userId: number;
  parkId: number;
  startDate: Date;
  endDate: Date;
  numPeople: number;
  visitType: VisitType;
  status: 'Active' | 'Past';
  createdAt: Date;
}

