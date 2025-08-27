"use client";

import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';
import PageLayout from '@/components/layout/PageLayout';
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import { Booking, Court, User } from "@/types";
import { hasPermission, canAccessBooking } from "@/utils/roleGuard";

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter, paymentFilter]);

  const fetchBookings = async () => {
    try {
      const [bookingsDataRaw, courtsDataRaw, usersDataRaw] = await Promise.all([
        api.getBookings(),
        api.getCourts(),
        user?.role === 'super_admin' ? api.getUsers() : Promise.resolve([]),
      ]);

      const bookingsData = bookingsDataRaw as Booking[];
      const courtsData = courtsDataRaw as Court[];
      const usersData = usersDataRaw as User[];

      // Filter bookings based on user role and permissions
      let filteredData = bookingsData;
      if (user?.role === 'field_owner') {
        // Field owners can only see bookings for their courts
        const userCourts = courtsData.filter(court => court.ownerId === user.id);
        filteredData = bookingsData.filter(booking => 
          userCourts.some(court => court.id === booking.courtId)
        );
      } else if (user?.role === 'regular_user') {
        // Regular users can only see their own bookings
        filteredData = bookingsData.filter(booking => booking.userId === user.id);
      }
      // Super admin sees all bookings

      setBookings(filteredData);
      setCourts(courtsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
  toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const court = courts.find(c => c.id === booking.courtId);
        const bookingUser = users.find(u => u.id === booking.userId) || user;
        return (
          court?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          court?.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bookingUser?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.date.includes(searchTerm)
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === paymentFilter);
    }

    setFilteredBookings(filtered);
  };

  const handleUpdateBookingStatus = async (bookingId: number, status: Booking['status']) => {
    try {
      await api.updateBooking(bookingId, { status });
      toast.success('Booking status updated successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const handleUpdatePaymentStatus = async (bookingId: number, paymentStatus: Booking['paymentStatus']) => {
    try {
      await api.updateBooking(bookingId, { paymentStatus });
      toast.success('Payment status updated successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    try {
  await api.deleteBooking(bookingId);
  toast.success('Booking deleted successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
  toast.error('Failed to delete booking');
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <svg className="h-4 w-4" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="green" /></svg>;
      case 'cancelled': return <svg className="h-4 w-4" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="red" /></svg>;
      case 'pending': return <svg className="h-4 w-4" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="yellow" /></svg>;
      default: return <svg className="h-4 w-4" aria-hidden="true"><circle cx="2" cy="2" r="2" fill="gray" /></svg>;
    }
  };

  const canManageBookings = hasPermission(user, 'manage_bookings') || hasPermission(user, 'manage_own_bookings');

  if (loading) {
    return (
      <div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-9 w-64 bg-gray-200 animate-pulse rounded" />
            <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border rounded-lg shadow-sm p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                    <div className="h-4 w-48 bg-gray-200 animate-pulse rounded" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <PageLayout title="Bookings" subtitle="Manage court bookings and reservations">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" title="Search">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search bookings by court, user, or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border rounded px-3 py-2 w-full"
            />
          </div>
          <div className="flex gap-2 items-center">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border rounded px-2 py-1"
              aria-label="Status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={e => setPaymentFilter(e.target.value)}
              className="border rounded px-2 py-1"
              aria-label="Payment"
            >
              <option value="all">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
            {user?.role === 'regular_user' && (
              <a href="/courts" className="inline-flex items-center border rounded px-3 py-2 bg-primary text-white hover:bg-primary/80">
                <span className="h-4 w-4 mr-2 flex items-center justify-center" title="Add">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </span>
                New Booking
              </a>
            )}
          </div>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <span className="h-12 w-12 text-gray-400 mx-auto mb-4 flex items-center justify-center" title="Calendar">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
            </span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all' 
                ? 'No bookings found' 
                : 'No bookings yet'
              }
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : user?.role === 'regular_user'
                  ? 'Start by creating your first booking'
                  : user?.role === 'field_owner'
                    ? 'No bookings for your courts yet'
                    : 'No bookings in the system yet'
              }
            </p>
            {user?.role === 'regular_user' && !searchTerm && statusFilter === 'all' && paymentFilter === 'all' && (
              <a href="/courts" className="inline-flex items-center border rounded px-3 py-2 bg-primary text-white hover:bg-primary/80">
                <span className="h-4 w-4 mr-2 flex items-center justify-center" title="Add">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </span>
                Browse Courts
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const court = courts.find(c => c.id === booking.courtId);
              const bookingUser = users.find(u => u.id === booking.userId) || user;
              // Check if user can access this specific booking
              if (!canAccessBooking(user, booking, courts)) {
                return null;
              }
              return (
                <div key={booking.id} className="border rounded-lg shadow-sm p-6 bg-white card-hover">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {court?.name || 'Unknown Court'}
                          </h3>
                          <span className={getPaymentStatusColor(booking.paymentStatus)} style={{padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>
                            {booking.paymentStatus}
                          </span>
                          <span className={getStatusColor(booking.status)} style={{padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="h-4 w-4 flex items-center justify-center" title="Date">
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                            </span>
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="h-4 w-4 flex items-center justify-center" title="Time">
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            </span>
                            {booking.startTime} - {booking.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="h-4 w-4 flex items-center justify-center" title="Location">
                              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
                            </span>
                            {court?.location || 'Unknown Location'}
                          </div>
                          {(user?.role === 'super_admin' || user?.role === 'field_owner') && (
                            <div className="flex items-center gap-1">
                              <span>Customer: {bookingUser?.name}</span>
                            </div>
                          )}
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-500 mt-2">
                            Note: {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right mr-4">
                        <div className="text-lg font-bold text-gray-900">
                          ${booking.totalPrice}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <button className="border rounded px-3 py-1 bg-gray-100 hover:bg-gray-200" onClick={() => setSelectedBooking(booking)}>
                        Details
                      </button>
                      {selectedBooking && selectedBooking.id === booking.id && (
                        <div
                          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                          onClick={() => setSelectedBooking(null)}
                        >
                          <div
                            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg"
                            onClick={e => e.stopPropagation()}
                          >
                            <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
                            <p className="text-gray-600 mb-6">Complete information for this booking</p>
                            <div className="mb-6">
                              <h4 className="font-semibold mb-1">Court Information</h4>
                              <div className="text-sm text-gray-800">{court?.name}</div>
                              <div className="text-sm text-gray-600">{court?.location}</div>
                            </div>
                            <div className="mb-6">
                              <h4 className="font-semibold mb-1">Booking Details</h4>
                              <div className="text-sm text-gray-800">Date: <span className="text-gray-600">{selectedBooking.date}</span></div>
                              <div className="text-sm text-gray-800">Time: <span className="text-gray-600">{selectedBooking.startTime} - {selectedBooking.endTime}</span></div>
                              <div className="text-sm text-gray-800">Total: <span className="text-gray-600">${selectedBooking.totalPrice}</span></div>
                            </div>
                            {(user?.role === 'super_admin' || user?.role === 'field_owner') && (
                              <div className="mb-6">
                                <h4 className="font-semibold mb-1">Customer</h4>
                                <div className="text-sm text-gray-800">{bookingUser?.name}</div>
                                <div className="text-sm text-gray-600">{bookingUser?.email}</div>
                              </div>
                            )}
                            <div className="flex gap-2 mb-6">
                              <span className={getStatusColor(selectedBooking.status)} style={{padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>
                                {selectedBooking.status}
                              </span>
                              <span className={getPaymentStatusColor(selectedBooking.paymentStatus)} style={{padding: '2px 8px', borderRadius: '4px', fontSize: '12px'}}>
                                {selectedBooking.paymentStatus}
                              </span>
                            </div>
                            <div className="flex justify-end">
                              <button className="border rounded px-4 py-2 bg-gray-100 hover:bg-gray-200" onClick={() => setSelectedBooking(null)}>
                                Close
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {canManageBookings && (user?.role === 'super_admin' || user?.role === 'field_owner' || booking.userId === user?.id) && (
                        <div className="flex gap-1 items-center">
                          {/* Payment confirmation action */}
                          {booking.paymentStatus === 'pending' && (user?.role === 'super_admin' || user?.role === 'field_owner') && (
                            <button
                              className="border rounded px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700"
                              onClick={() => handleUpdatePaymentStatus(booking.id, 'paid')}
                            >
                              Confirm Payment
                            </button>
                          )}
                          {/* Booking status actions */}
                          {booking.status === 'pending' && (user?.role === 'super_admin' || user?.role === 'field_owner') && (
                            <button
                              className="border rounded px-3 py-1 bg-gray-100 hover:bg-gray-200"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                            >
                              Confirm
                            </button>
                          )}
                          {booking.status === 'confirmed' && (
                            <button
                              className="border rounded px-3 py-1 bg-gray-100 hover:bg-gray-200"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            >
                              Complete
                            </button>
                          )}
                          {booking.status !== 'cancelled' && (
                            <button
                              className="border rounded px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          )}
                          {/* Completed indicator */}
                          {booking.status === 'completed' && (
                            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold ml-2">
                              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                              Completed
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}