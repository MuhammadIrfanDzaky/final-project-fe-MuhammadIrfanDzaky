import { User } from '@/types';

export const hasPermission = (user: User | null, permission: string): boolean => {
  if (!user) return false;

  const permissions = {
    super_admin: [
      'manage_users',
      'manage_courts',
      'manage_bookings',
      'view_analytics',
      'system_settings',
      'view_all_data',
    ],
    field_owner: [
      'manage_own_courts',
      'view_own_bookings',
      'manage_own_bookings',
      'view_own_data',
    ],
    regular_user: [
      'view_courts',
      'create_booking',
      'manage_own_bookings',
      'view_own_data',
    ],
  };

  return permissions[user.role]?.includes(permission) || false;
};

export const canAccessRoute = (user: User | null, route: string): boolean => {
  if (!user) return false;

  // Super admin: access all pages
  if (user.role === 'super_admin') return true;

  // Field owner: dashboard, courts, bookings, profile, courts/create
  if (user.role === 'field_owner') {
    if (["/dashboard", "/courts", "/bookings", "/profile", "/courts/create"].includes(route)) return true;
    return false;
  }

  // Regular user: only courts, bookings, profile (not courts/create)
  if (user.role === 'regular_user') {
    if (["/courts", "/bookings", "/profile"].includes(route)) return true;
    return false;
  }

  return false;
};

export const canAccessCourt = (user: User | null, court: any): boolean => {
  if (!user || !court) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'field_owner') return court.ownerId === user.id;
  if (user.role === 'regular_user') return true;
  return false;
};

export const canManageCourt = (user: User | null, court: any): boolean => {
  if (!user || !court) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'field_owner') return court.ownerId === user.id;
  return false;
};

export const canAccessBooking = (user: User | null, booking: any, courts: any[]): boolean => {
  if (!user || !booking) return false;
  if (user.role === 'super_admin') return true;
  if (user.role === 'field_owner') {
    const court = courts.find(c => c.id === booking.courtId);
    return court && court.ownerId === user.id;
  }
  if (user.role === 'regular_user') return booking.userId === user.id;
  return false;
};