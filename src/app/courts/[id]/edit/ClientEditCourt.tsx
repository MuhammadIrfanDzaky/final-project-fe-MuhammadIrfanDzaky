'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/utils/mockApi';
import { Court } from '@/types';
import { canManageCourt } from '@/utils/roleGuard';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Badge from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

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

interface ClientEditCourtProps {
    courtId: string;
}

export default function ClientEditCourt({
    courtId,
}: ClientEditCourtProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [court, setCourt] = useState<Court | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [customFacility, setCustomFacility] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset,
    } = useForm<CourtForm>({
        mode: 'onBlur',
        defaultValues: {
            name: '',
            description: '',
            location: '',
            pricePerHour: 0,
            image: '',
            facilities: [],
            isActive: true,
        },
    });

    // Add validation to facilities field
    useEffect(() => {
        register('facilities', {
            validate: value => (value && value.length > 0) || 'At least one facility is required',
        });
    }, [register]);

    const watchedImage = watch('image');

    useEffect(() => {
        if (!user) return; // Wait for user to be loaded
        let isMounted = true;
        async function fetchCourt() {
            try {
                const data = await mockApi.courts.getById(courtId);
                if (!isMounted) return;
                if (!data || !canManageCourt(user, data)) {
                    toast.error('You do not have permission to edit this court');
                    router.push('/courts');
                    return;
                }
                setCourt(data);
                setSelectedFacilities(data.facilities);
                reset({
                    name: data.name,
                    description: data.description,
                    location: data.location,
                    pricePerHour: data.pricePerHour,
                    image: data.image,
                    facilities: data.facilities,
                    isActive: data.isActive,
                });
            } catch (error) {
                console.error('Error fetching court:', error);
                toast.error('Failed to load court details');
                router.push('/courts');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchCourt();
        return () => { isMounted = false; };
    }, [courtId, user, router, reset]);

    const handleFacilityToggle = (facility: string) => {
        const next = selectedFacilities.includes(facility)
        ? selectedFacilities.filter((f) => f !== facility)
        : [...selectedFacilities, facility];
        setSelectedFacilities(next);
        setValue('facilities', next);
    };

    const handleAddCustomFacility = () => {
        if (
        customFacility.trim() &&
        !selectedFacilities.includes(customFacility.trim())
        ) {
        const next = [...selectedFacilities, customFacility.trim()];
        setSelectedFacilities(next);
        setValue('facilities', next);
        setCustomFacility('');
        }
    };

    const handleRemoveFacility = (f: string) => {
        const next = selectedFacilities.filter((x) => x !== f);
        setSelectedFacilities(next);
        setValue('facilities', next);
    };

    const onSubmit = async (data: CourtForm) => {
        if (!court) return;
        setSaving(true);
        try {
            await mockApi.courts.update(court.id, data);
            toast.success('Court updated successfully!');
            router.push(`/courts/${court.id}`);
        } catch (error) {
            console.error('Error updating court:', error);
            toast.error('Failed to update court');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) {
        return (
        <ProtectedRoute route="/courts">
            <PageLayout title="Edit Court">
            <div className="max-w-4xl mx-auto space-y-6">
                <Skeleton className="h-8 w-32" />
                <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                    </Card>
                ))}
                </div>
            </div>
            </PageLayout>
        </ProtectedRoute>
        );
    }

    if (!court) {
        return (
        <ProtectedRoute route="/courts">
            <PageLayout title="Access Denied">
            <div className="text-center py-12">
                                <span className="h-12 w-12 text-gray-400 mx-auto mb-4 flex items-center justify-center">
                                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
                                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                Access Denied
                </h3>
                <p className="text-gray-500">
                            {/* <ArrowLeft className="h-4 w-4 mr-2" /> */}
                </p>
                <Button asChild className="mt-4">
                <Link href="/courts">Back to Courts</Link>
                </Button>
            </div>
            </PageLayout>
        </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute route="/courts">
        <PageLayout title="Edit Court" subtitle={`Editing ${court.name}`}>
            <div className="max-w-4xl mx-auto">
            <Button variant="outline" asChild className="mb-6">
                <Link href={`/courts/${court.id}`}>
                                <span className="h-4 w-4 mr-2 flex items-center justify-center">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                                </span>
                Back to Court Details
                </Link>
            </Button>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                                    {/* <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" /> */}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label htmlFor="name">Court Name</Label>
                        <Input
                            id="name"
                            {...register('name', {
                                required: 'Court name is required',
                                minLength: { value: 2, message: 'Court name must be at least 2 characters' },
                            })}
                        />
                        {errors.name && (
                        <p className="text-sm text-destructive">
                            {errors.name.message}
                        </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 flex items-center justify-center">
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21c-4.97-6.16-8-9.5-8-13A8 8 0 0 1 20 8c0 3.5-3.03 6.84-8 13z" /><circle cx="12" cy="8" r="3" /></svg>
                            </span>
                            <Input
                                id="location"
                                className="pl-10"
                                {...register('location', {
                                    required: 'Location is required',
                                    minLength: { value: 5, message: 'Location must be at least 5 characters' },
                                })}
                            />
                        </div>
                        {errors.location && (
                        <p className="text-sm text-destructive">
                            {errors.location.message}
                        </p>
                        )}
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            {...register('description', {
                                required: 'Description is required',
                                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                            })}
                        />
                        {errors.description && (
                            <p className="text-sm text-destructive">
                                {errors.description.message}
                            </p>
                        )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="pricePerHour">Price per Hour ($)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 flex items-center justify-center">
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                                </span>
                                <Input
                                    id="pricePerHour"
                                    type="number"
                                    step="0.01"
                                    className="pl-10"
                                    {...register('pricePerHour', {
                                        valueAsNumber: true,
                                        required: 'Price per hour is required',
                                        min: { value: 1, message: 'Price must be at least $1' },
                                    })}
                                />
                            </div>
                            {errors.pricePerHour && (
                                <p className="text-sm text-destructive">
                                    {errors.pricePerHour.message}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                id="isActive"
                                type="checkbox"
                                checked={watch('isActive')}
                                onChange={e => setValue('isActive', e.target.checked)}
                            />
                            <Label htmlFor="isActive" className="text-sm">
                                {/* <Image className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" /> */}
                            </Label>
                        </div>
                    </div>
                    </div>
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle>Court Image</CardTitle>
                    <CardDescription>
                    Update the image to showcase your court
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Label htmlFor="image">Image URL</Label>
                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 flex items-center justify-center">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                        </span>
                    <Input
                        id="image"
                        type="url"
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
                    <p className="text-sm text-destructive">
                        {errors.image.message}
                    </p>
                    )}
                    {watchedImage && (
                    <div className="mt-4 border rounded-lg overflow-hidden">
                        <img
                        src={watchedImage}
                        alt="Preview"
                        className="w-full h-48 object-cover"
                        onError={(e) => void (e.currentTarget.style.display = 'none')}
                        />
                    </div>
                    )}
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle>Facilities & Amenities</CardTitle>
                    <CardDescription>
                    Update the facilities available at your court
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-3">
                                        {predefinedFacilities.map((f) => (
                                            <div
                                                key={f}
                                                onClick={() => handleFacilityToggle(f)}
                                                className={`p-3 border rounded-lg cursor-pointer ${
                                                    selectedFacilities.includes(f)
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex justify-between">
                                                    <span className="text-sm">{f}</span>
                                                    {selectedFacilities.includes(f) && (
                                                        <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                    </div>

                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Custom facility"
                                                value={customFacility}
                                                onChange={(e) => setCustomFacility(e.target.value)}
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

                                        {selectedFacilities.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {selectedFacilities.map((f) => (
                                                    <Badge key={f} variant="secondary" className="flex items-center gap-1">
                                                        {f}
                                                        <button type="button" onClick={() => handleRemoveFacility(f)}>
                                                            <span className="h-3 w-3 flex items-center justify-center">
                                                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                                                            </span>
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                    {errors.facilities && (
                    <p className="text-sm text-destructive">
                        {errors.facilities.message}
                    </p>
                    )}
                </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                    <Link href={`/courts/${court.id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving}>
                    {saving ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Saving…
                    </>
                    ) : (
                    <>
                        <span className="h-4 w-4 mr-2 flex items-center justify-center">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
                        </span>
                        Save Changes
                    </>
                    )}
                </Button>
                </div>
            </form>
            </div>
        </PageLayout>
        </ProtectedRoute>
    );
}