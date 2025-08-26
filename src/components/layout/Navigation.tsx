'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Button from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { hasPermission } from '@/utils/roleGuard';
import FutsalLogo from '@/components/ui/futsal-logo';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
      ),
      permission: null,
      roles: ['super_admin', 'field_owner'],
    },
    {
      name: 'Courts',
      href: '/courts',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 2v20M2 12h20" /></svg>
      ),
      permission: null,
      roles: ['super_admin', 'field_owner', 'regular_user'],
    },
    {
      name: 'Bookings',
      href: '/bookings',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
      ),
      permission: null,
      roles: ['super_admin', 'field_owner', 'regular_user'],
    },
    {
      name: 'Users',
      href: '/users',
      icon: (
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" /><path d="M17 11v-1a4 4 0 0 0-4-4h-1" /><path d="M17 21v-2a4 4 0 0 0-4-4h-1" /><circle cx="17" cy="17" r="4" /></svg>
      ),
      permission: 'manage_users',
      roles: ['super_admin'],
    },
  ];

  const filteredNavItems = navigationItems.filter(item => {
    if (!user) return false;
    // Only show dashboard for super_admin and field_owner
    if (item.name === 'Dashboard' && !['super_admin', 'field_owner'].includes(user.role)) return false;
    // Only show users for super_admin
    if (item.name === 'Users' && user.role !== 'super_admin') return false;
    // Only show courts and bookings for all roles
    if ((item.name === 'Courts' || item.name === 'Bookings') && !['super_admin', 'field_owner', 'regular_user'].includes(user.role)) return false;
    if (item.permission && !hasPermission(user, item.permission)) {
      return false;
    }
    return true;
  });

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push('/auth/login');
  };

  if (!user) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white/80 backdrop-blur-sm"
        >
          {isMobileMenuOpen ? (
            <span className="h-4 w-4 flex items-center justify-center" title="Close">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </span>
          ) : (
            <span className="h-4 w-4 flex items-center justify-center" title="Menu">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-gray-200">
            <FutsalLogo size={32} />
            <span className="text-xl font-bold text-gray-900">Dribble</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.avatar || ''} />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || ''}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role ? user.role.replace('_', ' ') : ''}
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <span className="w-4 h-4 flex items-center justify-center" title="Profile">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1" /></svg>
                </span>
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <span className="w-4 h-4 flex items-center justify-center" title="Logout">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 16l-4-4m0 0l4-4m-4 4h12" /><path d="M13 4v16" /></svg>
                </span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;