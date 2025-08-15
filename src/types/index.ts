export interface User {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'field_owner' | 'regular_user';
  avatar?: string;
  phone?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Court {
  id: string;
  name: string;
  description: string;
  image: string;
  pricePerHour: number;
  ownerId: string;
  facilities: string[];
  location: string;
  isActive: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  courtId: string;
  userId: string;
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
  id: string;
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
  register: (userData: Omit<User, 'id' | 'createdAt' | 'isActive'>) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}