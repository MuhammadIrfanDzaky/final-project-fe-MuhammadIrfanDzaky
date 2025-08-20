'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/utils/mockApi';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { toast } from 'react-toastify';

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Local state for form fields
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<any>({});
  const [isDirty, setIsDirty] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.checked });
    setIsDirty(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const newErrors: any = {};
    if (!form.name || form.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    if (!form.email || !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }
    if (form.newPassword && !form.currentPassword) {
      newErrors.currentPassword = 'Current password is required to set new password';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const updateData: any = {
        name: form.name,
        email: form.email,
        phone: form.phone,
      };
      if (form.newPassword) {
        if (form.currentPassword !== 'password') {
          setErrors({ currentPassword: 'Current password is incorrect' });
          setLoading(false);
          return;
        }
        updateData.password = form.newPassword;
      }
      await mockApi.users.update(user.id, updateData);
  toast.success('Profile updated successfully');
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsDirty(false);
      setErrors({});
    } catch (error) {
      console.error('Error updating profile:', error);
  toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'field_owner':
        return 'Field Owner';
      case 'regular_user':
        return 'Regular User';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'field_owner':
        return 'bg-blue-100 text-blue-800';
      case 'regular_user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute route="/profile">
      <PageLayout title="Profile Settings" subtitle="Manage your account information and preferences">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Overview */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-6">
              <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-20 w-20 object-cover rounded-full" />
                ) : (
                  <span className="text-lg font-bold text-gray-600">{user.name.charAt(0)}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900">{user.name}</h3>
                <p className="text-gray-600 mb-2">{user.email}</p>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getRoleColor(user.role)}`}>
                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l7 7-7 13-7-13z" /></svg>
                    {getRoleLabel(user.role)}
                  </span>
                  <span className={user.isActive ? 'inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold' : 'inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-sm text-gray-600 mb-1">
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  Member since
                </div>
                <div className="text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* Edit Profile Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <input
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        className="pl-3 border rounded w-full h-9"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" /><polyline points="22,6 12,13 2,6" /></svg>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 border rounded w-full h-9"
                        value={form.email}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium">Phone Number (Optional)</label>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92V19a2 2 0 0 1-2 2A17.91 17.91 0 0 1 3 5a2 2 0 0 1 2-2h2.09a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11l-.27.27a16 16 0 0 0 6.29 6.29l.27-.27a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" /></svg>
                      <input
                        id="phone"
                        name="phone"
                        placeholder="Enter your phone number"
                        className="pl-10 border rounded w-full h-9"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>
              <hr className="my-6 border-gray-200" />
              {/* Password Change */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Change Password</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="currentPassword" className="block text-sm font-medium">Current Password</label>
                    <div className="relative">
                      <input
                        id="currentPassword"
                        name="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        placeholder="Enter your current password"
                        className="border rounded w-full h-9 pr-10"
                        value={form.currentPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 text-gray-500"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.29-3.16-10.94-7.5a10.97 10.97 0 0 1 1.67-2.88M1 1l22 22" /><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2.05 12A9.94 9.94 0 0 1 12 2c5.05 0 9.29 3.16 10.94 7.5a10.97 10.97 0 0 1-1.67 2.88" /></svg>
                        )}
                      </button>
                    </div>
                    {errors.currentPassword && (
                      <p className="text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium">New Password</label>
                    <div className="relative">
                      <input
                        id="newPassword"
                        name="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className="border rounded w-full h-9 pr-10"
                        value={form.newPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 text-gray-500"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.29-3.16-10.94-7.5a10.97 10.97 0 0 1 1.67-2.88M1 1l22 22" /><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2.05 12A9.94 9.94 0 0 1 12 2c5.05 0 9.29 3.16 10.94 7.5a10.97 10.97 0 0 1-1.67 2.88" /></svg>
                        )}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm New Password</label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className="border rounded w-full h-9 pr-10"
                        value={form.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="absolute right-0 top-0 h-full px-3 text-gray-500"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-5.05 0-9.29-3.16-10.94-7.5a10.97 10.97 0 0 1 1.67-2.88M1 1l22 22" /><path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M2.05 12A9.94 9.94 0 0 1 12 2c5.05 0 9.29 3.16 10.94 7.5a10.97 10.97 0 0 1-1.67 2.88" /></svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Leave password fields empty if you don't want to change your password.
                </p>
              </div>
              <hr className="my-6 border-gray-200" />
              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !isDirty}
                  className="min-w-32 bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
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
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};