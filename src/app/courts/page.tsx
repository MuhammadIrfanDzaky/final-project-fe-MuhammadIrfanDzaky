'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
// Simple modal component
function Modal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">&times;</button>
        {children}
      </div>
    </div>
  );
}
import PageLayout from '@/components/layout/PageLayout';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { Court } from '@/types';
import { canAccessCourt, canManageCourt } from '@/utils/roleGuard';
import Link from 'next/link';

export default function CourtsPage() {
  const { user } = useAuth();
  const [showBookingsCourtId, setShowBookingsCourtId] = useState<number | null>(null);
  const [courtBookings, setCourtBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  // Fetch bookings for a specific court
  const handleViewBookings = async (courtId: number) => {
    setShowBookingsCourtId(courtId);
    setBookingsLoading(true);
    try {
      const allBookings = await api.getBookings();
      const now = new Date();
      // Only show bookings for this court, upcoming or today
      const filtered = (allBookings as Booking[]).filter(b => b.courtId === courtId && new Date(b.date) >= new Date(now.toISOString().split('T')[0]));
      setCourtBookings(filtered);
    } catch (e) {
      setCourtBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };
  const [courts, setCourts] = useState<Court[]>([]);
  const [filteredCourts, setFilteredCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteCourtId, setDeleteCourtId] = useState<number | null>(null);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
  const data = await api.getCourts();
    let filteredData: Court[] = data as Court[];
        if (user?.role === 'field_owner') {
          filteredData = (data as Court[]).filter((court: Court) => court.ownerId === user.id);
        } else if (user?.role === 'super_admin') {
          filteredData = data as Court[]; // super_admin sees all courts
        } else if (user?.role === 'regular_user') {
          filteredData = data as Court[];
        }
        setCourts(filteredData);
        setFilteredCourts(filteredData); // Show all by default
      } catch (error) {
        console.error('Error fetching courts:', error);
  toast.error('Failed to load courts');
      } finally {
        setLoading(false);
      }
    };
    fetchCourts();
  }, [user]);

  // Filter courts when filters/search change
  useEffect(() => {
    let filtered = courts;
    if (searchTerm) {
      filtered = filtered.filter(court =>
        court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (priceFilter !== 'all') {
      filtered = filtered.filter(court => {
        if (priceFilter === 'low') return court.pricePerHour < 40;
        if (priceFilter === 'medium') return court.pricePerHour >= 40 && court.pricePerHour <= 60;
        if (priceFilter === 'high') return court.pricePerHour > 60;
        return true;
      });
    }
    if (locationFilter !== 'all') {
      filtered = filtered.filter(court => court.location === locationFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(court =>
        statusFilter === 'active' ? court.isActive : !court.isActive
      );
    }
    setFilteredCourts(filtered);
  }, [courts, searchTerm, priceFilter, locationFilter, statusFilter]);

  const handleDeleteCourt = async (courtId: number) => {
    try {
    await api.deleteCourt(courtId);
  window.alert('Court deleted successfully');
      // Refetch courts after delete
        const data = await api.getCourts() as Court[];
        let filteredData: Court[] = data;
        if (user?.role === 'field_owner') {
          filteredData = data.filter((court: Court) => court.ownerId === user.id);
        }
        setCourts(filteredData);
    } catch (error) {
      console.error('Error deleting court:', error);
      toast.error('Failed to delete court');
    }
  };

  const clearFilters = () => {
    setPriceFilter('all');
    setLocationFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  const getUniqueLocations = () => {
    const locations = courts.map(court => court.location);
    return Array.from(new Set(locations));
  };

  const canCreateCourt = user?.role === 'super_admin' || user?.role === 'field_owner';

  if (loading) {
    return (
      <PageLayout title="Courts">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-9 w-64 bg-gray-200 animate-pulse rounded" />
            <div className="h-9 w-32 bg-gray-200 animate-pulse rounded" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg shadow-sm p-6 bg-white flex flex-col">
                <div className="h-48 w-full bg-gray-200 animate-pulse rounded mb-4" />
                <div className="mb-2">
                  <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-1" />
                  <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="space-y-2 mt-auto">
                  <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 w-16 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Courts" subtitle="Browse and manage futsal courts">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" title="Search">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </span>
            <input
              type="text"
              placeholder="Search courts by name, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border rounded px-3 py-2 w-full"
            />
          </div>
          <div className="flex gap-2 items-center">
            <form className="flex gap-2 items-center" onSubmit={e => e.preventDefault()}>
              <select
                value={priceFilter}
                onChange={e => setPriceFilter(e.target.value)}
                className="border rounded px-2 py-1"
                aria-label="Price Range"
              >
                <option value="all">All Prices</option>
                <option value="low">Under $40/hr</option>
                <option value="medium">$40-60/hr</option>
                <option value="high">$60+/hr</option>
              </select>
              <select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                className="border rounded px-2 py-1"
                aria-label="Location"
              >
                <option value="all">All Locations</option>
                {getUniqueLocations().map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="border rounded px-2 py-1"
                aria-label="Status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <button type="button" onClick={clearFilters} className="border rounded px-3 py-1 bg-gray-100 hover:bg-gray-200">Clear Filters</button>
            </form>
            {canCreateCourt && (
              <Link href="/courts/create" className="inline-flex items-center border rounded px-3 py-2 bg-primary text-white hover:bg-primary/80">
                <span className="h-4 w-4 mr-2 flex items-center justify-center" title="Add">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </span>
                Add Court
              </Link>
            )}
          </div>
        </div>

        {/* Courts Grid */}
        {filteredCourts.length === 0 ? (
          <div className="text-center py-12">
            <span className="h-12 w-12 text-gray-400 mx-auto mb-4 flex items-center justify-center" title="Location">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
            </span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || priceFilter !== 'all' || locationFilter !== 'all' || statusFilter !== 'all' ? 'No courts found' : 'No courts available'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || priceFilter !== 'all' || locationFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters' 
                : user?.role === 'field_owner' 
                  ? 'Get started by adding your first court'
                  : 'No courts are currently available for booking'
              }
            </p>
            {canCreateCourt && !searchTerm && priceFilter === 'all' && locationFilter === 'all' && statusFilter === 'all' && (
              <Link href="/courts/create" className="inline-flex items-center border rounded px-3 py-2 bg-primary text-white hover:bg-primary/80">
                <span className="h-4 w-4 mr-2 flex items-center justify-center" title="Add">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </span>
                Add Court
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCourts.map((court) => (
              <div key={court.id} className="border rounded-lg shadow-sm overflow-hidden flex flex-col bg-white card-hover">
                <div className="relative">
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-48 object-cover"
                  />
                  {canManageCourt(user, court) && (
                    <div className="absolute top-4 right-4 flex gap-1">
                      <a href={`/courts/${court.id}/edit`} className="inline-flex items-center border rounded px-2 py-1 bg-gray-100 hover:bg-gray-200 mr-1" title="Edit">
                        <span className="h-4 w-4 flex items-center justify-center" title="Edit">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
                        </span>
                      </a>
                      <button onClick={() => setDeleteCourtId(court.id)} className="inline-flex items-center border rounded px-2 py-1 bg-red-100 hover:bg-red-200" title="Delete">
                        <span className="h-4 w-4 flex items-center justify-center" title="Delete">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                        </span>
                      </button>
                      {deleteCourtId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
                            <h2 className="text-lg font-bold mb-2">Delete Court</h2>
                            <p className="mb-4">Are you sure you want to delete this court? This action cannot be undone.</p>
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setDeleteCourtId(null)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                              <button onClick={() => { if (deleteCourtId) { handleDeleteCourt(deleteCourtId); setDeleteCourtId(null); } }} className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">Delete</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col p-6">
                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-900">{court.name}</span>
                      <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                        <span className="text-lg font-bold text-primary">${court.pricePerHour}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <span className="h-3 w-3 flex items-center justify-center" title="Location">
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
                      </span>
                      {court.location}
                    </div>
                  </div>
                  <div className="space-y-4 mt-4 flex-1 flex flex-col justify-between">
                    <div className="flex gap-2 mt-auto">
                      {canAccessCourt(user, court) && (
                        <a href={`/courts/${court.id}`} className="flex-1 inline-block text-center border rounded px-3 py-2 bg-blue-500 text-white hover:bg-blue-600">
                          View Details
                        </a>
                      )}
                      {user?.role === 'regular_user' && (
                        <a href={`/courts/${court.id}/book`} className="flex-1 inline-block text-center border rounded px-3 py-2 bg-gray-100 hover:bg-gray-200">
                          Book Now
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}