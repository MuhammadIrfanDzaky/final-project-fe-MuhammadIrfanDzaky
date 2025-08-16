
'use client';


import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
// Removed react-hook-form. Will use local state for form fields.
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/utils/mockApi';
import { Court } from '@/types';
import { canManageCourt } from '@/utils/roleGuard';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
// Removed all custom UI components and icons. Using native HTML and inline SVGs only.
import Link from 'next/link';

export async function generateStaticParams() {
  const courts = await mockApi.courts.getAll();
  return courts.map((court) => ({
    id: court.id,
  }));
}

type CourtForm = {
  name: string;
  description: string;
  location: string;
  pricePerHour: number;
  image: string;
  facilities: string[];
  isActive: boolean;
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

export default function EditCourtPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [customFacility, setCustomFacility] = useState('');

  const courtId = params.id as string;

  // Local state for form fields
  const [form, setForm] = useState<{
    name: string;
    description: string;
    location: string;
    pricePerHour: number;
    image: string;
    facilities: string[];
    isActive: boolean;
  }>({
    name: '',
    description: '',
    location: '',
    pricePerHour: 0,
    image: '',
    facilities: [],
    isActive: true,
  });
  const [errors, setErrors] = useState<any>({});
  const watchedImage = form.image;

  useEffect(() => {
    fetchCourt();
  }, [courtId]);

  const fetchCourt = async () => {
    try {
      const data = await mockApi.courts.getById(courtId);
      if (data) {
        // Check if user can manage this court
        if (!canManageCourt(user, data)) {
          window.alert('You do not have permission to edit this court');
          router.push('/courts');
          return;
        }
        setCourt(data);
        setSelectedFacilities(data.facilities);
        setForm({
          name: data.name,
          description: data.description,
          location: data.location,
          pricePerHour: data.pricePerHour,
          image: data.image,
          facilities: data.facilities,
          isActive: data.isActive,
        });
      } else {
  window.alert('Court not found');
        router.push('/courts');
      }
    } catch (error) {
      console.error('Error fetching court:', error);
  window.alert('Failed to load court details');
      router.push('/courts');
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityToggle = (facility: string) => {
    const newFacilities = selectedFacilities.includes(facility)
      ? selectedFacilities.filter(f => f !== facility)
      : [...selectedFacilities, facility];
    
    setSelectedFacilities(newFacilities);
  setForm(f => ({ ...f, facilities: newFacilities }));
  };

  const handleAddCustomFacility = () => {
    if (customFacility.trim() && !selectedFacilities.includes(customFacility.trim())) {
      const newFacilities = [...selectedFacilities, customFacility.trim()];
      setSelectedFacilities(newFacilities);
  setForm(f => ({ ...f, facilities: newFacilities }));
      setCustomFacility('');
    }
  };

  const handleRemoveFacility = (facility: string) => {
    const newFacilities = selectedFacilities.filter(f => f !== facility);
    setSelectedFacilities(newFacilities);
  setForm(f => ({ ...f, facilities: newFacilities }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm(f => ({ ...f, [name]: checked }));
    } else if (type === 'number') {
      setForm(f => ({ ...f, [name]: Number(value) }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!court) return;
    const newErrors: any = {};
    if (!form.name || form.name.length < 2) {
      newErrors.name = 'Court name must be at least 2 characters';
    }
    if (!form.description || form.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    if (!form.location || form.location.length < 5) {
      newErrors.location = 'Location must be at least 5 characters';
    }
    if (!form.image) {
      newErrors.image = 'Please enter a valid image URL';
    }
    if (!selectedFacilities || selectedFacilities.length < 1) {
      newErrors.facilities = 'At least one facility is required';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    setSaving(true);
    try {
      await mockApi.courts.update(court.id, {
        ...form,
        facilities: selectedFacilities,
      });
      window.alert('Court updated successfully!');
      router.push(`/courts/${court.id}`);
    } catch (error) {
      console.error('Error updating court:', error);
      window.alert('Failed to update court');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute route="/courts">
        <PageLayout title="Edit Court">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="space-y-4">
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (!court || !canManageCourt(user, court)) {
    return (
      <ProtectedRoute route="/courts">
        <PageLayout title="Access Denied">
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2h-1.5" /><path d="M3 6a2 2 0 0 1 2-2h1.5" /><rect x="3" y="10.5" width="18" height="11" rx="2" /></svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to edit this court.</p>
            <a href="/courts" className="inline-block mt-4 px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">Back to Courts</a>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute route="/courts">
      <PageLayout title="Edit Court" subtitle={`Editing ${court.name}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <a href={`/courts/${court.id}`} className="inline-flex items-center px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              Back to Court Details
            </a>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">Basic Information</h3>
              <p className="text-gray-600 mb-4">Update the basic details about your futsal court</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium">Court Name</label>
                  <input
                    id="name"
                    name="name"
                    placeholder="e.g., Premium Court A"
                    className="border rounded w-full h-9 px-3"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="location" className="block text-sm font-medium">Location</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10.5V6a2 2 0 0 0-2-2h-1.5" /><path d="M3 6a2 2 0 0 1 2-2h1.5" /><rect x="3" y="10.5" width="18" height="11" rx="2" /></svg>
                    <input
                      id="location"
                      name="location"
                      placeholder="e.g., Downtown Sports Complex"
                      className="pl-10 border rounded w-full h-9 px-3"
                      value={form.location}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.location && (
                    <p className="text-sm text-red-600">{errors.location}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe your court, its features, and what makes it special..."
                  rows={4}
                  className="border rounded w-full px-3 py-2"
                  value={form.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="pricePerHour" className="block text-sm font-medium">Price per Hour ($)</label>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                    <input
                      id="pricePerHour"
                      name="pricePerHour"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="50.00"
                      className="pl-10 border rounded w-full h-9 px-3"
                      value={form.pricePerHour}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.pricePerHour && (
                    <p className="text-sm text-red-600">{errors.pricePerHour}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label htmlFor="isActive" className="block text-sm font-medium">Court Status</label>
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={form.isActive}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-sm">{form.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Court Image */}
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">Court Image</h3>
              <p className="text-gray-600 mb-4">Update the image to showcase your court</p>
              <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium">Image URL</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="12" cy="12" r="5" /></svg>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    placeholder="https://example.com/court-image.jpg"
                    className="pl-10 border rounded w-full h-9 px-3"
                    value={form.image}
                    onChange={handleChange}
                  />
                </div>
                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}
              </div>
              {watchedImage && (
                <div className="mt-4">
                  <label className="block text-sm font-medium">Preview</label>
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
            </div>
            {/* Facilities */}
            <div className="bg-white rounded-lg shadow p-6 mb-4">
              <h3 className="text-lg font-bold mb-2">Facilities & Amenities</h3>
              <p className="text-gray-600 mb-4">Update the facilities available at your court</p>
              <div>
                <label className="block text-sm font-medium">Available Facilities</label>
                <div className="grid gap-2 mt-2 md:grid-cols-3">
                  {predefinedFacilities.map((facility) => (
                    <div
                      key={facility}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedFacilities.includes(facility) ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-gray-200 hover:border-gray-300'}`}
                      onClick={() => handleFacilityToggle(facility)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{facility}</span>
                        {selectedFacilities.includes(facility) && (
                          <span className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="w-2 h-2 bg-white rounded-full" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <label className="block text-sm font-medium">Add Custom Facility</label>
                <div className="flex gap-2">
                  <input
                    placeholder="Enter custom facility"
                    value={customFacility}
                    onChange={(e) => setCustomFacility(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomFacility();
                      }
                    }}
                    className="border rounded w-full h-9 px-3"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomFacility}
                    disabled={!customFacility.trim()}
                    className="px-3 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  </button>
                </div>
              </div>
              {selectedFacilities.length > 0 && (
                <div className="mt-4">
                  <label className="block text-sm font-medium">Selected Facilities</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFacilities.map((facility) => (
                      <span key={facility} className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                        {facility}
                        <button
                          type="button"
                          onClick={() => handleRemoveFacility(facility)}
                          className="ml-1 hover:text-red-600"
                        >
                          <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {errors.facilities && (
                <p className="text-sm text-red-600">{errors.facilities}</p>
              )}
            </div>
            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <a href={`/courts/${court.id}`} className="px-4 py-2 border rounded text-blue-600 border-blue-600 hover:bg-blue-50">Cancel</a>
              <button type="submit" disabled={saving} className="min-w-32 bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center disabled:opacity-50">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2z" /></svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};