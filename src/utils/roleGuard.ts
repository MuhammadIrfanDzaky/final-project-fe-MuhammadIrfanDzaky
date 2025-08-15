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

  const routePermissions = {
    '/dashboard': ['super_admin', 'field_owner'], // Removed regular_user
    '/courts': ['super_admin', 'field_owner', 'regular_user'],
    '/bookings': ['super_admin', 'field_owner', 'regular_user'],
    '/users': ['super_admin'],
    '/profile': ['super_admin', 'field_owner', 'regular_user'],
  };

  const allowedRoles = routePermissions[route as keyof typeof routePermissions];
  return allowedRoles?.includes(user.role) || false;
};

export const canAccessCourt = (user: User | null, court: any): boolean => {
  if (!user || !court) return false;
  
  // Super admin can access all courts
  if (user.role === 'super_admin') return true;
  
  // Field owners can only access their own courts
  if (user.role === 'field_owner') return court.ownerId === user.id;
  
  // Regular users can view all courts but not manage them
  if (user.role === 'regular_user') return true;
  
  return false;
};

export const canManageCourt = (user: User | null, court: any): boolean => {
  if (!user || !court) return false;
  
  // Super admin can manage all courts
  if (user.role === 'super_admin') return true;
  
  // Field owners can only manage their own courts
  if (user.role === 'field_owner') return court.ownerId === user.id;
  
  return false;
};

export const canAccessBooking = (user: User | null, booking: any, courts: any[]): boolean => {
  if (!user || !booking) return false;
  
  // Super admin can access all bookings
  if (user.role === 'super_admin') return true;
  
  // Field owners can access bookings for their courts
  if (user.role === 'field_owner') {
    const court = courts.find(c => c.id === booking.courtId);
    return court && court.ownerId === user.id;
  }
  
  // Regular users can only access their own bookings
  if (user.role === 'regular_user') return booking.userId === user.id;
  
  return false;
};