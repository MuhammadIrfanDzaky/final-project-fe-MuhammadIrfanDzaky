'use client';

import React, { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/utils/api';
import { Court } from '@/types';
import { toast } from 'react-toastify';
import { canAccessCourt, canManageCourt } from '@/utils/roleGuard';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

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

interface ClientCourtDetailsProps {
    courtId: number;
}

export default function ClientCourtDetails({
    courtId,
    }: ClientCourtDetailsProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [showBookings, setShowBookings] = useState(false);
    const [courtBookings, setCourtBookings] = useState<Booking[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [showAllFacilities, setShowAllFacilities] = useState(false);
    // Fetch bookings for this court
    const handleViewBookings = async () => {
        setShowBookings(true);
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

    useEffect(() => {
        // Only run permission check after user context is loaded
        if (!user) return;
        let isMounted = true;
        async function fetchCourt() {
        try {
        const data = await api.getCourtById(courtId);
        if (!isMounted) return;
        if (!data || !canAccessCourt(user, data)) {
        toast.error('You do not have permission to view this court');
        router.push('/courts');
        return;
        }
        setCourt(data as Court);
        } finally {
            if (isMounted) setLoading(false);
        }
        }
        fetchCourt();
        return () => { isMounted = false; };
    }, [courtId, user, router]);

    const handleDeleteCourt = async () => {
        if (!court) return;
        try {
            await api.deleteCourt(court.id);
            toast.success('Court deleted successfully');
        router.push('/courts');
        } catch (error) {
        console.error('Error deleting court:', error);
        toast.error('Failed to delete court');
        }
    };

    if (loading || !user) {
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
            <div className="mx-auto">
            {/* Back + Edit/Delete */}
            <div className="flex justify-between items-center mb-6">
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
                        if (window.confirm(`Are you sure you want to delete \"${court.name}\"? This action cannot be undone and will cancel all associated bookings.`)) {
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

            {/* Details Grid: Image left, Info right */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Image left */}
                <div className="relative w-full">
                <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-80 object-cover rounded-lg shadow"
                />
                </div>
                {/* Info right */}
                <div className="space-y-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div>
                    <div className="text-2xl font-bold text-gray-900 mb-1" title={court.name}>{court.name}</div>
                    <div className="text-base text-gray-600 font-normal truncate" style={{maxWidth: '100%'}} title={court.description}>{court.description}</div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="grid grid-cols-[40px_120px_16px_1fr] gap-y-2 items-center text-lg font-semibold">
                    {/* Location row */}
                    <div className="flex items-center justify-center">
                        <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
                    </div>
                    <div>Location</div>
                    <div className="justify-self-center">:</div>
                    <div className="text-gray-600 font-normal">{court.location}</div>
                    {/* Pricing row */}
                    <div className="flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </div>
                    <div>Pricing</div>
                    <div className="justify-self-center">:</div>
                    <div className="text-gray-600 font-normal">${court.pricePerHour} / hour</div>
                    {/* Facilities row */}
                    <div className="flex items-center justify-center">
                        {/* Facility SVG icon */}
                        <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8" /></svg>
                    </div>
                    <div>Facilities</div>
                    <div className="justify-self-center">:</div>
                    <div>
                        {court.facilities.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center">
                            {(showAllFacilities ? court.facilities : court.facilities.slice(0, 3)).map((f) => (
                            <span key={f} className="inline-block px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                {f}
                            </span>
                            ))}
                            {court.facilities.length > 3 && !showAllFacilities && (
                            <button
                                type="button"
                                className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                                onClick={() => setShowAllFacilities(true)}
                            >
                                + {court.facilities.length - 3} more
                            </button>
                            )}
                            {court.facilities.length > 3 && showAllFacilities && (
                            <button
                                type="button"
                                className="px-2 py-1 rounded text-xs font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                                onClick={() => setShowAllFacilities(false)}
                            >
                                Show less
                            </button>
                            )}
                        </div>
                        ) : (
                        <span className="text-gray-500 text-base font-normal">No facilities listed</span>
                        )}
                    </div>
                    </div>
                </div>
                <div className="space-y-2">
                    {user?.role === 'regular_user' && (
                    <a href={`/courts/${court.id}/book`} className="w-full inline-flex items-center justify-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50 mb-2">
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                        Book This Court
                    </a>
                    )}
                    <button
                    type="button"
                    onClick={handleViewBookings}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 3" /></svg>
                    View Bookings
                    </button>
                    {/* Modal for court bookings */}
                    <Modal open={showBookings} onClose={() => setShowBookings(false)}>
                    <h2 className="text-xl font-bold mb-2">Bookings for this Court</h2>
                    {bookingsLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : courtBookings.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No upcoming bookings for this court.</div>
                    ) : (
                        <div className="space-y-2">
                        {courtBookings.map(b => (
                            <div key={b.id} className="flex justify-between items-center border rounded px-3 py-2">
                            <span className="font-medium">{b.date} {b.startTime}-{b.endTime}</span>
                            <span className={
                                b.status === 'confirmed' ? 'bg-green-100 text-green-800 px-2 py-1 rounded text-xs' :
                                b.status === 'pending' ? 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs' :
                                b.status === 'completed' ? 'bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs' :
                                b.status === 'cancelled' ? 'bg-red-100 text-red-800 px-2 py-1 rounded text-xs' :
                                'bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs'
                            }>
                                {b.status}
                            </span>
                            </div>
                        ))}
                        </div>
                    )}
                    </Modal>
                </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mt-10">
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