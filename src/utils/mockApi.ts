import { User, Court, Booking, DashboardStats } from '@/types';

const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'admin@futsal.com',
    name: 'Super Admin',
    role: 'super_admin',
    avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
    phone: '+1234567890',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true,
    password: 'admin123',
  },
  {
    id: '2',
    email: 'owner@futsal.com',
    name: 'Field Owner One',
    role: 'field_owner',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
    phone: '+1234567891',
    createdAt: '2024-01-02T00:00:00Z',
    isActive: true,
    password: 'owner1',
  },
  {
    id: '4',
    email: 'owner2@futsal.com',
    name: 'Field Owner Two',
    role: 'field_owner',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
    phone: '+1234567893',
    createdAt: '2024-01-04T00:00:00Z',
    isActive: true,
    password: 'owner2',
  },
  {
    id: '3',
    email: 'user@futsal.com',
    name: 'Regular User',
    role: 'regular_user',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face',
    phone: '+1234567892',
    createdAt: '2024-01-03T00:00:00Z',
    isActive: true,
    password: 'user123',
  },
];

const mockCourts: Court[] = [
  {
    id: '1',
    name: 'Premium Court A',
    description: 'High-quality synthetic grass court with professional lighting',
    image: 'https://images.pexels.com/photos/1618200/pexels-photo-1618200.jpeg?auto=compress&cs=tinysrgb&w=800',
    pricePerHour: 50,
    ownerId: '2',
    facilities: ['Changing Rooms', 'Parking', 'Floodlights', 'Equipment Rental'],
    location: 'Downtown Sports Complex',
    isActive: true,
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Court B',
    description: 'Standard futsal court perfect for casual games',
    image: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=800',
    pricePerHour: 35,
    ownerId: '2',
    facilities: ['Changing Rooms', 'Parking'],
    location: 'Community Center',
    isActive: true,
    createdAt: '2024-01-16T00:00:00Z',
  },
  {
    id: '3',
    name: 'Elite Court',
    description: 'Professional-grade court with spectator seating',
    image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800',
    pricePerHour: 75,
    ownerId: '2',
    facilities: ['Changing Rooms', 'Parking', 'Floodlights', 'Equipment Rental', 'Spectator Seating', 'Refreshments'],
    location: 'Elite Sports Arena',
    isActive: true,
    createdAt: '2024-01-17T00:00:00Z',
  },
  {
    id: '4',
    name: 'Arena Court X',
    description: 'Modern indoor court with climate control and premium facilities',
    image: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg?auto=compress&cs=tinysrgb&w=800',
    pricePerHour: 60,
    ownerId: '4',
    facilities: ['Changing Rooms', 'Parking', 'Air Conditioning', 'Sound System', 'CCTV Security'],
    location: 'North Side Arena',
    isActive: true,
    createdAt: '2024-01-18T00:00:00Z',
  },
  {
    id: '5',
    name: 'Training Ground Y',
    description: 'Perfect for training sessions and team practice',
    image: 'https://images.pexels.com/photos/1884574/pexels-photo-1884574.jpeg?auto=compress&cs=tinysrgb&w=800',
    pricePerHour: 40,
    ownerId: '4',
    facilities: ['Equipment Rental', 'First Aid', 'WiFi'],
    location: 'Training Center',
    isActive: true,
    createdAt: '2024-01-19T00:00:00Z',
  },
];

const mockBookings: Booking[] = [
  {
    id: '1',
    courtId: '1',
    userId: '3',
    date: '2024-02-15',
    startTime: '18:00',
    endTime: '19:00',
    totalPrice: 50,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2024-02-10T00:00:00Z',
    notes: 'Birthday celebration game',
  },
  {
    id: '2',
    courtId: '2',
    userId: '3',
    date: '2024-02-16',
    startTime: '20:00',
    endTime: '21:00',
    totalPrice: 35,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: '2024-02-11T00:00:00Z',
  },
  {
    id: '3',
    courtId: '4',
    userId: '3',
    date: '2024-02-20',
    startTime: '16:00',
    endTime: '17:00',
    totalPrice: 60,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: '2024-02-12T00:00:00Z',
    notes: 'Team practice session',
  },
  {
    id: '4',
    courtId: '5',
    userId: '3',
    date: '2024-02-22',
    startTime: '19:00',
    endTime: '20:00',
    totalPrice: 40,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: '2024-02-13T00:00:00Z',
  },
];

// Mock API functions with simulated latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  auth: {

    login: async (email: string, password: string) => {
      await delay(1000);
      const user = mockUsers.find(u => u.email === email);
      if (user && password === user.password) {
        // Don't return password in response
        const { password: _pw, ...userWithoutPassword } = user;
        return { success: true, user: userWithoutPassword };
      }
      return { success: false, error: 'Invalid credentials' };
    },
    
    register: async (userData: Omit<User, 'id' | 'createdAt' | 'isActive'> & { password: string }) => {
      await delay(1000);
      const { password, ...rest } = userData;
      const newUser: User & { password: string } = {
        ...rest,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true,
        password,
      };
      mockUsers.push(newUser);
      // Don't return password in response
      const { password: _pw, ...userWithoutPassword } = newUser;
      return { success: true, user: userWithoutPassword };
    },
  },

  users: {
    getAll: async () => {
      await delay(500);
      return mockUsers;
    },
    
    getById: async (id: string) => {
      await delay(300);
      return mockUsers.find(u => u.id === id);
    },
    
    update: async (id: string, userData: Partial<User>) => {
      await delay(500);
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...userData };
        return mockUsers[userIndex];
      }
      throw new Error('User not found');
    },
    
    delete: async (id: string) => {
      await delay(500);
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        mockUsers.splice(userIndex, 1);
        return true;
      }
      return false;
    },
  },

  courts: {
    getAll: async () => {
      await delay(500);
      return mockCourts;
    },
    
    getById: async (id: string) => {
      await delay(300);
      return mockCourts.find(c => c.id === id);
    },
    
    create: async (courtData: Omit<Court, 'id' | 'createdAt'>) => {
      await delay(800);
      const newCourt: Court = {
        ...courtData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      mockCourts.push(newCourt);
      return newCourt;
    },
    
    update: async (id: string, courtData: Partial<Court>) => {
      await delay(500);
      const courtIndex = mockCourts.findIndex(c => c.id === id);
      if (courtIndex !== -1) {
        mockCourts[courtIndex] = { ...mockCourts[courtIndex], ...courtData };
        return mockCourts[courtIndex];
      }
      throw new Error('Court not found');
    },
    
    delete: async (id: string) => {
      await delay(500);
      const courtIndex = mockCourts.findIndex(c => c.id === id);
      if (courtIndex !== -1) {
        mockCourts.splice(courtIndex, 1);
        return true;
      }
      return false;
    },
  },

  bookings: {
    getAll: async () => {
      await delay(500);
      return mockBookings;
    },
    
    getByUserId: async (userId: string) => {
      await delay(400);
      return mockBookings.filter(b => b.userId === userId);
    },
    
    getByCourtId: async (courtId: string) => {
      await delay(400);
      return mockBookings.filter(b => b.courtId === courtId);
    },
    
    create: async (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
      await delay(800);
      const newBooking: Booking = {
        ...bookingData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      mockBookings.push(newBooking);
      return newBooking;
    },
    
    update: async (id: string, bookingData: Partial<Booking>) => {
      await delay(500);
      const bookingIndex = mockBookings.findIndex(b => b.id === id);
      if (bookingIndex !== -1) {
        mockBookings[bookingIndex] = { ...mockBookings[bookingIndex], ...bookingData };
        return mockBookings[bookingIndex];
      }
      throw new Error('Booking not found');
    },
    
    delete: async (id: string) => {
      await delay(500);
      const bookingIndex = mockBookings.findIndex(b => b.id === id);
      if (bookingIndex !== -1) {
        mockBookings.splice(bookingIndex, 1);
        return true;
      }
      return false;
    },
  },

  dashboard: {
    getStats: async (userId?: string, role?: string): Promise<DashboardStats> => {
      await delay(600);
      
      let filteredBookings = mockBookings;
      let filteredCourts = mockCourts;
      
      if (role === 'field_owner' && userId) {
        // Field owners can only see their own courts and related bookings
        filteredCourts = mockCourts.filter(c => c.ownerId === userId);
        filteredBookings = mockBookings.filter(b => 
          filteredCourts.some(c => c.id === b.courtId)
        );
      } else if (role === 'regular_user' && userId) {
        // Regular users can only see their own bookings
        filteredBookings = mockBookings.filter(b => b.userId === userId);
        filteredCourts = []; // Regular users don't own courts
      }
      
      const totalRevenue = filteredBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalPrice, 0);
      
      return {
        totalBookings: filteredBookings.length,
        totalRevenue,
        activeCourts: filteredCourts.filter(c => c.isActive).length,
        totalUsers: role === 'super_admin' ? mockUsers.filter(u => u.isActive).length : 0,
        recentBookings: filteredBookings.slice(-5),
        upcomingBookings: filteredBookings.filter(b => 
          new Date(b.date) > new Date() && b.status === 'confirmed'
        ).slice(0, 5),
      };
    },
  },
};