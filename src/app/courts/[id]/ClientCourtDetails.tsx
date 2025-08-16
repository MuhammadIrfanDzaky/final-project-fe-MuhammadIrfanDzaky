'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/utils/mockApi';
import { Court } from '@/types';
import { canAccessCourt, canManageCourt } from '@/utils/roleGuard';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

interface ClientCourtDetailsProps {
  courtId: string;
}

export default function ClientCourtDetails({
  courtId,
}: ClientCourtDetailsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourt() {
      try {
        const data = await mockApi.courts.getById(courtId);
        if (!data || !canAccessCourt(user, data)) {
          window.alert('You do not have permission to view this court');
          router.push('/courts');
        } else {
          setCourt(data);
        }
      } catch (error) {
        console.error('Error fetching court:', error);
  window.alert('Failed to load court details');
        router.push('/courts');
      } finally {
        setLoading(false);
      }
    }
    fetchCourt();
  }, [courtId, user, router]);

  const handleDeleteCourt = async () => {
    if (!court) return;
    try {
      await mockApi.courts.delete(court.id);
  window.alert('Court deleted successfully');
      router.push('/courts');
    } catch (error) {
      console.error('Error deleting court:', error);
  window.alert('Failed to delete court');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute route="/courts">
        <PageLayout title="Court Details">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="h-64 w-full rounded-lg bg-gray-200 animate-pulse" />
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="h-32 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-24 w-full bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (!court) {
    return (
      <ProtectedRoute route="/courts">
        <PageLayout title="Court Not Found">
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2h-1.5" /><path d="M3 6a2 2 0 0 1 2-2h1.5" /><rect x="3" y="10.5" width="18" height="11" rx="2" /></svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Court Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The court you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <a href="/courts" className="inline-block px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">Back to Courts</a>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute route="/courts">
      <PageLayout title={court.name} subtitle={court.location}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back + Edit/Delete */}
          <div className="flex justify-between items-center">
            <a href="/courts" className="inline-flex items-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              Back to Courts
            </a>
            {canManageCourt(user, court) && (
              <div className="flex gap-2">
                <a href={`/courts/${court.id}/edit`} className="inline-flex items-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
                  Edit Court
                </a>
                <button
                  className="inline-flex items-center px-4 py-2 border rounded text-red-600 border-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${court.name}"? This action cannot be undone and will cancel all associated bookings.`)) {
                      handleDeleteCourt();
                    }
                  }}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={court.image}
                  alt={court.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute top-4 right-4">
                  <span className="inline-block bg-white/90 text-gray-900 text-lg px-3 py-1 rounded shadow">${court.pricePerHour}/hr</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2h-1.5" /><path d="M3 6a2 2 0 0 1 2-2h1.5" /><rect x="3" y="10.5" width="18" height="11" rx="2" /></svg>
                  Location
                </div>
                <p className="text-gray-600">{court.location}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-lg font-semibold mb-2">Description</div>
                <p className="text-gray-600 leading-relaxed">{court.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center gap-2 text-lg font-semibold mb-2">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                  Pricing
                </div>
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  ${court.pricePerHour}
                  <span className="text-lg font-normal text-gray-600">/hour</span>
                </div>
                <p className="text-sm text-gray-600">Competitive pricing for premium court experience</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <div className="text-lg font-semibold mb-2">Facilities & Amenities</div>
                <div className="text-sm text-gray-500 mb-2">Available facilities at this court</div>
                {court.facilities.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {court.facilities.map((f) => (
                      <span key={f} className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">{f}</span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No facilities listed</p>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-4 space-y-3">
                <div className="text-lg font-semibold mb-2">Court Information</div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Status</span>
                  <span className={court.isActive ? 'inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold' : 'inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold'}>
                    {court.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Added</span>
                  <span className="text-sm text-gray-600">{new Date(court.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">Court ID</span>
                  <span className="text-sm text-gray-600 font-mono">{court.id}</span>
                </div>
              </div>

              <div className="space-y-2">
                {user?.role === 'regular_user' && (
                  <a href={`/courts/${court.id}/book`} className="w-full inline-flex items-center justify-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50 mb-2">
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    Book This Court
                  </a>
                )}
                <a href="/bookings" className="w-full inline-flex items-center justify-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 3" /></svg>
                  View Bookings
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <div className="text-lg font-semibold mb-2">Booking Information</div>
            <div className="text-sm text-gray-500 mb-2">Important details for booking this court</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Operating Hours</h4>
                <p className="text-sm text-gray-600">Monday - Sunday: 6:00 AM - 11:00 PM</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Booking Policy</h4>
                <p className="text-sm text-gray-600">Minimum 1 hour booking. Cancellation allowed up to 24 hours before.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment</h4>
                <p className="text-sm text-gray-600">Payment required at time of booking. Refunds available for cancellations.</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact</h4>
                <p className="text-sm text-gray-600">For questions, contact the court owner through the booking system.</p>
              </div>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}