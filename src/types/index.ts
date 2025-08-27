export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'super_admin' | 'field_owner' | 'regular_user';
  password: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Court {
  id: number;
  name: string;
  description: string;
  image: string;
  pricePerHour: number;
  ownerId: number;
  facilities: string[];
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: number;
  courtId: number;
  userId: number;
  date: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
  notes?: string;
}

export interface TimeSlot {
  id: number;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
  bookingId?: string;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeCourts: number;
  totalUsers: number;
  recentBookings: Booking[];
  upcomingBookings: Booking[];
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: { email: string; password: string; name: string; role: string; phone: string; }) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}