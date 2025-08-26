'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { DashboardStats, Booking, Court, User } from '@/types';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookingGrowth, setBookingGrowth] = useState<number | null>(null);
  const [revenueGrowth, setRevenueGrowth] = useState<number | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsersThisWeek, setNewUsersThisWeek] = useState<number>(0);
  const [firstTimeBookersThisMonth, setFirstTimeBookersThisMonth] = useState<number>(0);

  useEffect(() => {
    // Redirect regular users to courts page
    if (user?.role === 'regular_user') {
      router.push('/courts');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        // Fetch courts and users
        const [courtsDataRaw, usersDataRaw] = await Promise.all([
          api.getCourts(),
          user?.role === 'super_admin' ? api.getUsers() : Promise.resolve([]),
        ]);
        const courtsData = courtsDataRaw as Court[];
        const usersData = usersDataRaw as User[];
        const bookingsRaw = await api.getBookings();
        const bookings = bookingsRaw as Booking[];
        const userBookings = user?.role === 'field_owner'
          ? bookings.filter((b) => courtsData.some((c) => c.id === b.courtId && c.ownerId === user.id))
          : bookings;

        const totalRevenue = userBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const activeCourts = user?.role === 'field_owner'
          ? courtsData.filter((c) => c.ownerId === user.id && c.isActive).length
          : courtsData.filter((c) => c.isActive).length;
        const totalUsers = usersData.length;
        const totalBookings = userBookings.length;
        const now = new Date();
        const recentBookings = userBookings
          .filter((b) => {
            const created = new Date(b.createdAt);
            return (now.getTime() - created.getTime()) < 7 * 24 * 60 * 60 * 1000;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);
        const upcomingBookings = userBookings
          .filter((b) => new Date(b.date) > now && b.status === 'confirmed')
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .slice(0, 5);


        // Calculate booking growth: (thisMonth - lastMonth) / lastMonth * 100
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        const bookingsThisMonth = userBookings.filter(b => {
          const d = new Date(b.createdAt);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        });
        const bookingsLastMonth = userBookings.filter(b => {
          const d = new Date(b.createdAt);
          return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        });
        // Booking growth
        let bookingGrowthValue: number | null = null;
        if (bookingsLastMonth.length === 0 && bookingsThisMonth.length > 0) {
          bookingGrowthValue = 100;
        } else if (bookingsLastMonth.length === 0 && bookingsThisMonth.length === 0) {
          bookingGrowthValue = 0;
        } else {
          bookingGrowthValue = ((bookingsThisMonth.length - bookingsLastMonth.length) / bookingsLastMonth.length) * 100;
        }
        setBookingGrowth(bookingGrowthValue);
        // Revenue growth
        const revenueThisMonth = bookingsThisMonth.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        const revenueLastMonth = bookingsLastMonth.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        let revenueGrowthValue: number | null = null;
        if (revenueLastMonth === 0 && revenueThisMonth > 0) {
          revenueGrowthValue = 100;
        } else if (revenueLastMonth === 0 && revenueThisMonth === 0) {
          revenueGrowthValue = 0;
        } else {
          revenueGrowthValue = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
        }
        setRevenueGrowth(revenueGrowthValue);

        setStats({
          totalBookings,
          totalRevenue,
          activeCourts,
          totalUsers,
          recentBookings,
          upcomingBookings,
        });
        setCourts(courtsData);
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
      // Fetch new users this week (admin)
      if (user.role === 'super_admin') {
        api.getNewUsersThisWeek().then(
          (res: any) => setNewUsersThisWeek(res.count)
        ).catch(
          () => setNewUsersThisWeek(0)
        );
      }
    }
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== 'field_owner' || !stats || courts.length === 0) return;
    // Get all bookings for this owner's courts (not just recent/upcoming)
    const ownerCourtIds = courts.filter(c => c.ownerId === user.id).map(c => c.id);
    // Use all bookings for the logic
    api.getBookings().then((allBookingsRaw: any) => {
      const allBookings = allBookingsRaw as Booking[];
      // Map userId to all their bookings (across all courts)
      const userToBookings: { [userId: string]: Booking[] } = {};
      allBookings.forEach(b => {
        if (!userToBookings[b.userId]) userToBookings[b.userId] = [];
        userToBookings[b.userId].push(b);
      });
      // For each user, check if their first booking is on this owner's court and within the current month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      let count = 0;
      Object.entries(userToBookings).forEach(([userId, bookings]) => {
        const sorted = bookings.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        const first = sorted[0];
        if (
          first &&
          ownerCourtIds.includes(first.courtId) &&
          new Date(first.createdAt).getMonth() === currentMonth &&
          new Date(first.createdAt).getFullYear() === currentYear
        ) {
          count++;
        }
      });
      setFirstTimeBookersThisMonth(count);
    });
  }, [user, stats, courts]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case 'super_admin':
        return 'System Overview';
      case 'field_owner':
        return 'Your Courts & Bookings';
      default:
        return 'Dashboard';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // "Render nothing — regular users are redirected."
  if (user?.role === 'regular_user') {
    return null;
  }
  
  return (
    <ProtectedRoute route="/dashboard">
      {loading ? (
        <PageLayout title="Dashboard">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-16 mb-2 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded bg-gray-200 animate-pulse" />
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageLayout>
      ) : (
        // loaded state code here
        <PageLayout 
          title={`${getGreeting()}, ${user?.name}!`}
          subtitle={getRoleBasedTitle()}
        >
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium">Total Bookings</span>
                  <span className="text-gray-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </span>
                </div>
                <div className="text-2xl font-bold">{stats?.totalBookings ?? 0}</div>
                <div className="text-xs text-green-600 mt-1">
                  {bookingGrowth !== null ?
                    (bookingGrowth === 0 ? 'No change from last month'
                      : bookingGrowth > 0 ? `+${bookingGrowth.toFixed(0)}% from last month`
                      : `${bookingGrowth.toFixed(0)}% from last month`)
                    : '...'}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium">Revenue</span>
                  <span className="text-gray-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><text x="7" y="17" fontSize="12" fill="currentColor">$</text></svg>
                  </span>
                </div>
                <div className="text-2xl font-bold">${stats?.totalRevenue ?? 0}</div>
                <div className="text-xs text-green-600 mt-1">
                  {revenueGrowth !== null ?
                    (revenueGrowth === 0 ? 'No change from last month'
                      : revenueGrowth > 0 ? `+${revenueGrowth.toFixed(0)}% from last month`
                      : `${revenueGrowth.toFixed(0)}% from last month`)
                    : '...'}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium">Active Courts</span>
                  <span className="text-gray-400">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 2v20M2 12h20" /></svg>
                  </span>
                </div>
                <div className="text-2xl font-bold">{stats?.activeCourts ?? 0}</div>
                <div className="text-xs text-green-600 mt-1">All systems operational</div>
              </div>
              {/* Stat card 4: role-based */}
              {user?.role === 'super_admin' ? (
                <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 font-medium">Total Users</span>
                    <span className="text-gray-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" /><path d="M17 11v-1a4 4 0 0 0-4-4h-1" /><path d="M17 21v-2a4 4 0 0 0-4-4h-1" /><circle cx="17" cy="17" r="4" /></svg>
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
                  <div className="text-xs text-green-600 mt-1">+{newUsersThisWeek} new this week</div>
                </div>
              ) : user?.role === 'field_owner' ? (
                <div className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500 font-medium">New Bookers This Month</span>
                    <span className="text-gray-400">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
                    </span>
                  </div>
                  <div className="text-2xl font-bold">{firstTimeBookersThisMonth}</div>
                  <div className="text-xs text-green-600 mt-1">First bookings on your courts this month</div>
                </div>
              ) : null}
            </div>

            {/* Bookings Overview */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Recent Bookings */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                  <h2 className="text-xl font-bold mb-1">Recent Bookings</h2>
                  <div className="text-gray-500 text-sm">Latest booking activity (newly created bookings)</div>
                </div>
                <div className="space-y-3">
                  {stats?.recentBookings && stats.recentBookings.length > 0 ? (
                    stats.recentBookings.map((booking, i) => {
                      const court = courts.find(c => c.id === booking.courtId);
                      const bookingUser = users.find(u => u.id === booking.userId) || user;
                      return (
                        <div key={booking.id} className="flex items-center justify-between bg-green-50 rounded p-3">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 flex items-center justify-center bg-green-100 rounded">
                              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                            </span>
                            <div>
                              <div className="font-semibold text-gray-900">{court?.name || booking.courtId}</div>
                              <div className="text-xs text-gray-500">{bookingUser?.name || 'Regular User'} &bull; {booking.date} &bull; {booking.startTime}-{booking.endTime}</div>
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full lowercase">{booking.status}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400 text-center py-8">No recent bookings</div>
                  )}
                </div>
                <div className="pt-4">
                  <a href="/bookings" className="block w-full text-center text-sm font-medium text-gray-700 border-t pt-4 hover:underline">View All Bookings</a>
                </div>
              </div>

              {/* Upcoming Bookings */}
              <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center">
                <div className="mb-4 w-full">
                  <h2 className="text-xl font-bold mb-1">Upcoming Bookings</h2>
                  <div className="text-gray-500 text-sm">Confirmed bookings scheduled for future dates</div>
                </div>
                {stats?.upcomingBookings && stats.upcomingBookings.length > 0 ? (
                  <div className="w-full space-y-3">
                    {stats.upcomingBookings.map((booking) => {
                      const court = courts.find(c => c.id === booking.courtId);
                      const bookingUser = users.find(u => u.id === booking.userId) || user;
                      return (
                        <div key={booking.id} className="flex items-center justify-between bg-blue-50 rounded p-3">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 flex items-center justify-center bg-blue-100 rounded">
                              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </span>
                            <div>
                              <div className="font-semibold text-gray-900">{court?.name || booking.courtId}</div>
                              <div className="text-xs text-gray-500">{bookingUser?.name || 'Regular User'} &bull; {booking.date} &bull; {booking.startTime}-{booking.endTime}</div>
                            </div>
                          </div>
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full lowercase">{booking.status}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-1 py-12">
                    <span className="h-16 w-16 flex items-center justify-center text-gray-300 mb-4">
                      <svg width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </span>
                    <div className="text-gray-400 mb-4">No upcoming bookings</div>
                    <a href="/courts" className="inline-block px-8 py-3 rounded bg-green-400 text-white font-semibold hover:bg-green-500 transition">Browse Courts</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </PageLayout>
      )}
    </ProtectedRoute>
  );
};