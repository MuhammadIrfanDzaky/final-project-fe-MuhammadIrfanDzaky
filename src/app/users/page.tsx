'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi } from '@/utils/mockApi';
import { User as UserType } from '@/types';
import { hasPermission } from '@/utils/roleGuard';
import PageLayout from '@/components/layout/PageLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      const data = await mockApi.users.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
  window.alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleUpdateUser = async (userId: string, userData: Partial<UserType>) => {
    try {
      await mockApi.users.update(userId, userData);
  window.alert('User updated successfully');
      fetchUsers();
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
  window.alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await mockApi.users.delete(userId);
      window.alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      window.alert('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await mockApi.users.update(userId, { isActive });
      window.alert(`User ${isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      window.alert('Failed to update user status');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" /></svg>
        );
      case 'field_owner':
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l7 7-7 13-7-13z" /></svg>
        );
      case 'regular_user':
      default:
        return (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M6 20v-2a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v2" /></svg>
        );
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

  const canManageUsers = hasPermission(user, 'manage_users');

  if (!canManageUsers) {
    return (
      <ProtectedRoute route="/users">
        <PageLayout title="Access Denied">
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l7 7-7 13-7-13z" /></svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You don't have permission to access this page.</p>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  if (loading) {
    return (
      <ProtectedRoute route="/users">
        <PageLayout title="Users">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="h-9 w-64 bg-gray-200 rounded animate-pulse" />
              <div className="h-9 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PageLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute route="/users">
      <PageLayout title="Users" subtitle="Manage system users and permissions">
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
              <input
                placeholder="Search users by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border rounded h-9 w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-40 border rounded h-9"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="field_owner">Field Owner</option>
                <option value="regular_user">Regular User</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-32 border rounded h-9"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                  ? 'No users found' 
                  : 'No users available'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Users will appear here once they register'}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((userItem) => (
                <div key={userItem.id} className="bg-white rounded-lg shadow p-4 card-hover">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                        {userItem.avatar ? (
                          <img src={userItem.avatar} alt={userItem.name} className="h-12 w-12 object-cover rounded-full" />
                        ) : (
                          <span className="text-lg font-bold text-gray-600">{userItem.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{userItem.name}</h3>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {/* Edit User Modal Replacement */}
                      {editDialogOpen && selectedUser?.id === userItem.id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
                            <h2 className="text-lg font-bold mb-2">Edit User</h2>
                            <p className="text-gray-600 mb-4">Update user information and permissions</p>
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                                <input
                                  id="name"
                                  value={selectedUser.name}
                                  onChange={(e) => setSelectedUser({
                                    ...selectedUser,
                                    name: e.target.value
                                  })}
                                  className="border rounded w-full px-2 py-1"
                                />
                              </div>
                              <div>
                                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                                <input
                                  id="email"
                                  type="email"
                                  value={selectedUser.email}
                                  onChange={(e) => setSelectedUser({
                                    ...selectedUser,
                                    email: e.target.value
                                  })}
                                  className="border rounded w-full px-2 py-1"
                                />
                              </div>
                              <div>
                                <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                  id="phone"
                                  value={selectedUser.phone || ''}
                                  onChange={(e) => setSelectedUser({
                                    ...selectedUser,
                                    phone: e.target.value
                                  })}
                                  className="border rounded w-full px-2 py-1"
                                />
                              </div>
                              <div>
                                <label htmlFor="role" className="block text-sm font-medium mb-1">Role</label>
                                <select
                                  id="role"
                                  value={selectedUser.role}
                                  onChange={(e) => setSelectedUser({
                                    ...selectedUser,
                                    role: e.target.value as UserType['role']
                                  })}
                                  className="border rounded w-full px-2 py-1"
                                >
                                  <option value="super_admin">Super Admin</option>
                                  <option value="field_owner">Field Owner</option>
                                  <option value="regular_user">Regular User</option>
                                </select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  id="active"
                                  type="checkbox"
                                  checked={selectedUser.isActive}
                                  onChange={(e) => setSelectedUser({
                                    ...selectedUser,
                                    isActive: e.target.checked
                                  })}
                                />
                                <label htmlFor="active" className="text-sm">Active</label>
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                              <button className="border rounded px-3 py-1" onClick={() => { setEditDialogOpen(false); setSelectedUser(null); }}>
                                Cancel
                              </button>
                              <button className="bg-blue-600 text-white rounded px-3 py-1" onClick={() => selectedUser && handleUpdateUser(selectedUser.id, selectedUser)}>
                                Save Changes
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Delete User Confirm Replacement */}
                      <button className="p-1 hover:bg-gray-100 rounded" title="Delete user" onClick={() => handleDeleteUser(userItem.id)}>
                        <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Role</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${getRoleColor(userItem.role)}`}>
                        {getRoleIcon(userItem.role)}
                        {getRoleLabel(userItem.role)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Status</span>
                      <div className="flex items-center gap-2">
                        <span className={userItem.isActive ? 'inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold' : 'inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold'}>
                          {userItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <input
                          type="checkbox"
                          checked={userItem.isActive}
                          onChange={(e) => handleToggleUserStatus(userItem.id, e.target.checked)}
                        />
                      </div>
                    </div>
                    {userItem.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">Phone</span>
                        <span className="text-sm text-gray-600">{userItem.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Joined</span>
                      <span className="text-sm text-gray-600">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
};