export interface MonthlyDashboardResponse {
  kpis: {
    totalStudents: number;
    newStudentsThisMonth: number;
    activeSubscriptions: number;
    expiringThisMonth: number;
  };

  revenue: {
    expectedMonthlyRevenue: number;
    collectedRevenue: number;      
    pendingRevenue: number;       
    totalDiscountsGiven: number;
  };

  occupancyOverview: {
    totalPhysicalSeats: number; 
    totalCapacitySlots: number;
    occupiedSlots: number;
    overallOccupancyRate: number;
  };

  shiftAnalytics: Array<{
    shiftId: string;
    shiftName: string;
    shiftPrice: number;
    occupiedSeats: number;
    totalSeats: number;
    revenueGenerated: number;
    occupancyRate: number; 
  }>;

  floorOccupancy: Array<{
    floorId: string;
    floorName: string;
    totalSeats: number;
    uniqueOccupiedSeats: number;
  }>;

  actionableLists: {
    recentSubscriptions: RecentSubscription[];
    expiringSoon: ExpiringSubscription[];
  };
}

export interface RecentSubscription {
  id: string;
  studentName: string;
  studentId: string;
  floorName: string;
  seatNo: number;
  shiftName: string[];
  startDate: string;
  endDate: string;
  amountPaid: number;
  discount: number;
  paymentStatus: "PAID" | "PARTIAL" | "UNPAID"; 
  status: string;
}

export interface ExpiringSubscription {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  endDate: string;
  daysRemaining: number;
}