'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { mockApi } from '@/utils/mockApi';
import { Court } from '@/types';
import { canAccessCourt } from '@/utils/roleGuard';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-toastify';
import Link from 'next/link';

interface ClientBookCourtProps {
  courtId: string;
}

export default function ClientBookCourt({
  courtId,
}: ClientBookCourtProps) {
  const { user } = useAuth();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    notes: '',
  });
  const router = useRouter();

  useEffect(() => {
    async function fetchCourt() {
      try {
        const data = await mockApi.courts.getById(courtId);
        if (!data || !canAccessCourt(user, data)) {
          toast.error('You do not have permission to book this court');
          router.push('/courts');
        } else {
          setCourt(data);
        }
      } catch (error) {
        toast.error('Failed to load court details');
        router.push('/courts');
      } finally {
        setLoading(false);
      }
    }
    fetchCourt();
  }, [courtId, user, router]);

  const handleInputChange = (field: string, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateDuration = () => {
    if (!bookingData.startTime || !bookingData.endTime) return 0;
    const start = new Date(`2000-01-01T${bookingData.startTime}`);
    const end = new Date(`2000-01-01T${bookingData.endTime}`);
    return end > start
      ? (end.getTime() - start.getTime()) / 1000 / 60 / 60
      : 0;
  };

  const calculateTotalCost = () => {
    if (!court) return 0;
    return calculateDuration() * court.pricePerHour;
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!court || !user) return;
    if (
      !bookingData.date ||
      !bookingData.startTime ||
      !bookingData.endTime
    ) {
      toast.error('Please fill in all required fields');
      return;
    }
    const duration = calculateDuration();
    if (duration < 1) {
      toast.error('Minimum booking duration is 1 hour');
      return;
    }
    setSubmitting(true);
    try {
      // Simulate API create
      toast.success('Court booked successfully!');
      router.push('/bookings');
    } catch (error) {
      toast.error('Failed to book court. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute route="/courts">
        <PageLayout title="Book Court">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-32" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
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
            <span className="h-12 w-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
            </span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Court Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The court you're trying to book doesn't exist or you don't have
              permission.
            </p>
            <Button asChild>
              <Link href="/courts">Back to Courts</Link>
            </Button>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  const duration = calculateDuration();
  const totalCost = calculateTotalCost();

  return (
    <ProtectedRoute route="/courts">
      <PageLayout title={`Book ${court.name}`} subtitle="Reserve your court time">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="outline" asChild>
            <Link href={`/courts/${court.id}`}>
              <span className="h-4 w-4 mr-2 flex items-center justify-center">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
              </span>
              Back to Court Details
            </Link>
          </Button>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-5 w-5 flex items-center justify-center">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
                    </span>
                    {court.name}
                  </CardTitle>
                  <CardDescription>{court.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <img
                    src={court.image}
                    alt={court.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div className="flex justify-between text-sm">
                    <span>Hourly Rate</span>
                    <span>${court.pricePerHour}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status</span>
                    <Badge
                      className={
                        court.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }
                    >
                      {court.isActive ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {court.facilities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Facilities</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {court.facilities.map((f) => (
                      <Badge key={f} variant="secondary">
                        {f}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="h-5 w-5 flex items-center justify-center">
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                    </span>
                    Book This Court
                  </CardTitle>
                  <CardDescription>Fill in the details below</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={bookingData.date}
                        onChange={(e) =>
                          handleInputChange('date', e.target.value)
                        }
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time *</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={bookingData.startTime}
                          onChange={(e) =>
                            handleInputChange('startTime', e.target.value)
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time *</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={bookingData.endTime}
                          onChange={(e) =>
                            handleInputChange('endTime', e.target.value)
                          }
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        rows={3}
                        value={bookingData.notes}
                        onChange={(e) =>
                          handleInputChange('notes', e.target.value)
                        }
                      />
                    </div>

                    {duration > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Duration</span>
                          <span>
                            {duration} hour{duration !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Rate</span>
                          <span>${court.pricePerHour}/hr</span>
                        </div>
                        <div className="flex justify-between font-medium text-lg border-t pt-2">
                          <span>Total Cost</span>
                          <span>${totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!court.isActive || submitting || duration < 1}
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 mr-2 flex items-center justify-center animate-spin">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                          </span>
                          Booking...
                        </>
                      ) : (
                        <>
                          <span className="h-4 w-4 mr-2 flex items-center justify-center">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                          </span>
                          Book Court – ${totalCost.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Policy</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p>• Minimum booking duration: 1 hour</p>
                  <p>• Cancellation allowed up to 24 hours before</p>
                  <p>• Payment required at time of booking</p>
                  <p>• Refunds available for valid cancellations</p>
                  <p>• Please arrive 10 minutes early</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}