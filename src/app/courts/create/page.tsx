'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { api } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Badge from '@/components/ui/badge';
import Link from 'next/link';

type CourtForm = {
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  image: string;
  facilities: string[];
};

const predefinedFacilities = [
  'Changing Rooms',
  'Parking',
  'Floodlights',
  'Equipment Rental',
  'Spectator Seating',
  'Refreshments',
  'Air Conditioning',
  'Sound System',
  'CCTV Security',
  'First Aid',
  'WiFi',
  'Lockers',
];

export default function CreateCourtPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [customFacility, setCustomFacility] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CourtForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      description: '',
      location: '',
      pricePerHour: 0,
      image: '',
      facilities: [],
    },
  });

  const watchedImage = watch('image');

  const canCreateCourt = user?.role === 'super_admin' || user?.role === 'field_owner';

  const handleFacilityToggle = (facility: string) => {
    const newFacilities = selectedFacilities.includes(facility)
      ? selectedFacilities.filter(f => f !== facility)
      : [...selectedFacilities, facility];
    
    setSelectedFacilities(newFacilities);
    setValue('facilities', newFacilities);
  };

  const handleAddCustomFacility = () => {
    if (customFacility.trim() && !selectedFacilities.includes(customFacility.trim())) {
      const newFacilities = [...selectedFacilities, customFacility.trim()];
      setSelectedFacilities(newFacilities);
      setValue('facilities', newFacilities);
      setCustomFacility('');
    }
  };

  const handleRemoveFacility = (facility: string) => {
    const newFacilities = selectedFacilities.filter(f => f !== facility);
    setSelectedFacilities(newFacilities);
    setValue('facilities', newFacilities);
  };

  const onSubmit = async (data: CourtForm) => {
    if (!user) return;
    // Basic validation
    if (!data.name || data.name.length < 2) {
      toast.error('Court name must be at least 2 characters');
      return;
    }
    if (!data.description || data.description.length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    if (!data.location || data.location.length < 5) {
      toast.error('Location must be at least 5 characters');
      return;
    }
    if (!data.image) {
      return;
    }
    setLoading(true);
    try {
  await api.createCourt({
        ...data,
        ownerId: user.role === 'field_owner' ? user.id : (user.role === 'super_admin' ? user.id : ''),
        isActive: true,
      });
      toast.success('Court created successfully!');
      router.push('/courts');
    } catch (err) {
      toast.error('Failed to create court. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!canCreateCourt) {
    return (
      <ProtectedRoute route="/courts/create">
        <PageLayout title="Access Denied">
          <div className="text-center py-12">
            <span className="h-12 w-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
              <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
            </span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to create courts.</p>
            <Button asChild className="mt-4">
              <Link href="/courts">Back to Courts</Link>
            </Button>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute route="/courts/create">
      <PageLayout title="Create New Court" subtitle="Add a new futsal court to the system">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button variant="outline" asChild>
              <Link href="/courts">
                <span className="h-4 w-4 mr-2 flex items-center justify-center">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                </span>
                Back to Courts
              </Link>
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the basic details about your futsal court
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Court Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Premium Court A"
                      {...register('name', {
                        required: 'Court name is required',
                        minLength: { value: 2, message: 'Court name must be at least 2 characters' },
                      })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Downtown Sports Complex"
                      {...register('location', {
                        required: 'Location is required',
                        minLength: { value: 5, message: 'Location must be at least 5 characters' },
                      })}
                    />
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your court, its features, and what makes it special..."
                    rows={4}
                    {...register('description', {
                      required: 'Description is required',
                      minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    })}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    </span>
                    <Input
                      id="pricePerHour"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="50.00"
                      className="pl-10"
                      {...register('pricePerHour', {
                        valueAsNumber: true,
                        required: 'Price per hour is required',
                        min: { value: 1, message: 'Price must be at least $1' },
                      })}
                    />
                  </div>
                  {errors.pricePerHour && (
                    <p className="text-sm text-destructive">{errors.pricePerHour.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Court Image */}
            <Card>
              <CardHeader>
                <CardTitle>Court Image</CardTitle>
                <CardDescription>
                  Add an image to showcase your court
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                    </span>
                    <Input
                      id="image"
                      type="url"
                      placeholder="https://example.com/court-image.jpg"
                      className="pl-10"
                      {...register('image', {
                        required: 'Image URL is required',
                        pattern: {
                          value: /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp|svg))$/i,
                          message: 'Please enter a valid image URL',
                        },
                      })}
                    />
                  </div>
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image.message}</p>
                  )}
                  <p className="text-sm text-gray-600">
                    Use a high-quality image that shows your court clearly. Recommended size: 800x600px or larger.
                  </p>
                </div>

                {watchedImage && (
                  <div className="mt-4">
                    <Label>Preview</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <img
                        src={watchedImage}
                        alt="Court preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <CardTitle>Facilities & Amenities</CardTitle>
                <CardDescription>
                  Select the facilities available at your court
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Available Facilities</Label>
                  <div className="grid gap-2 mt-2 md:grid-cols-3">
                    {predefinedFacilities.map((facility) => (
                      <div
                        key={facility}
                        className={`
                          p-3 border rounded-lg cursor-pointer transition-colors
                          ${selectedFacilities.includes(facility)
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        onClick={() => handleFacilityToggle(facility)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{facility}</span>
                          {selectedFacilities.includes(facility) && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Add Custom Facility</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom facility"
                      value={customFacility}
                      onChange={(e) => setCustomFacility(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomFacility();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddCustomFacility}
                      disabled={!customFacility.trim()}
                    >
                      <span className="h-4 w-4 flex items-center justify-center">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </span>
                    </Button>
                  </div>
                </div>

                {selectedFacilities.length > 0 && (
                  <div>
                    <Label>Selected Facilities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedFacilities.map((facility) => (
                        <Badge key={facility} variant="secondary" className="flex items-center gap-1">
                          {facility}
                          <button
                            type="button"
                            onClick={() => handleRemoveFacility(facility)}
                            className="ml-1 hover:text-destructive"
                          >
                            <span className="h-3 w-3 flex items-center justify-center">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {errors.facilities && (
                  <p className="text-sm text-destructive">{errors.facilities.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/courts">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading} className="min-w-32">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="h-4 w-4 mr-2 flex items-center justify-center">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                    </span>
                    Create Court
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};