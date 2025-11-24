import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { locationService } from '../services/locationService';
import PasswordRequirements from '../components/PasswordRequirements';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  document_number: string;
  document_type: string;
  venue_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  code: string;
  name: string;
  description: string;
}

interface Location {
  id: string;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
}

const Users: React.FC = () => {
  const { user, token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [userLocations, setUserLocations] = useState<string[]>([]); // Location IDs assigned to selected user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showAssignLocationModal, setShowAssignLocationModal] = useState(false);
  
  // Selected user for operations
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    document_number: '',
    document_type: 'CC',
    venue_id: '',
    role_id: '',
    is_active: true
  });

  const [editUser, setEditUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    document_number: '',
    document_type: 'CC',
    venue_id: '',
    is_active: true
  });
  
  // Reset password form state
  const [resetPasswordData, setResetPasswordData] = useState({
    new_password: ''
  });

  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchRoles();
      fetchLocations();
    }
  }, [token]);

  const fetchUsers = async () => {
    try {
      if (!token) return;
      console.log('Fetching users...'); // Debug log
      setLoading(true); // Force loading state
      const data = await authService.getAllUsers(token);
      console.log('Users fetched:', data); // Debug log
      setUsers(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching users:', err); // Debug log
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      if (!token) return;
      const data = await authService.getAllRoles(token);
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await locationService.getLocations();
      setLocations(data.filter((loc: Location) => loc.is_active));
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  // ================================================
  // USER CREATION
  // ================================================

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'first_name', 'last_name', 'document_number', 'role_id'];
    const missingFields = requiredFields.filter(field => !newUser[field as keyof typeof newUser]);
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          document_number: newUser.document_number,
          document_type: newUser.document_type,
          venue_id: newUser.venue_id || null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error?.includes('already exists')) {
          toast.error('Email already registered in the system');
        } else {
          toast.error(errorData.error || 'Error creating user');
        }
        return;
      }

      // Assign role if selected
      if (newUser.role_id && token) {
        const userData = await response.json();
        await authService.assignRole(token, userData.id, parseInt(newUser.role_id));
      }

      // Generate temporary password for display
      const tempPass = generateTemporaryPassword();
      setTempPassword(tempPass);

      await fetchUsers();
      setShowCreateModal(false);
      resetCreateForm();
      
      toast.success('User created successfully');
      toast.success(`Temporary password: ${tempPass}`, { duration: 10000 });
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ================================================
  // USER EDITING
  // ================================================

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      document_number: user.document_number,
      document_type: user.document_type,
      venue_id: user.venue_id || '',
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;

    // Validate required fields
    const requiredFields = ['email', 'first_name', 'last_name', 'document_number'];
    const missingFields = requiredFields.filter(field => !editUser[field as keyof typeof editUser]);
    
    console.log('Edit user data:', editUser); // Debug log
    console.log('Missing fields:', missingFields); // Debug log
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Additional validation for email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editUser.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      const requestBody = {
        email: editUser.email,
        first_name: editUser.first_name,
        last_name: editUser.last_name,
        document_number: editUser.document_number,
        document_type: editUser.document_type,
        ...(editUser.venue_id && { venue_id: editUser.venue_id }),
        is_active: editUser.is_active
      };
      
      console.log('Sending update request:', requestBody); // Debug log
      
      const response = await fetch(`/api/auth/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        if (errorData.error?.includes('already exists') || errorData.error?.includes('already in use')) {
          toast.error('Email already in use by another user');
        } else {
          toast.error(errorData.error || 'Error updating user');
        }
        return;
      }
      
      const responseData = await response.json();
      console.log('Success response:', responseData); // Debug log

      console.log('About to fetch users after update...'); // Debug log
      await fetchUsers();
      console.log('Users fetched after update, closing modal...'); // Debug log
      setRefreshKey(prev => prev + 1); // Force re-render
      setShowEditModal(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ================================================
  // USER ACTIVATION/DEACTIVATION
  // ================================================

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    const action = isActive ? 'deactivate' : 'activate';
    const confirmMessage = isActive 
      ? 'Are you sure you want to deactivate this user?'
      : 'Are you sure you want to activate this user?';
    
    if (!confirm(confirmMessage)) return;

    try {
      // Find the user to get all required fields
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const requestBody = {
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        document_number: user.document_number,
        document_type: user.document_type,
        ...(user.venue_id && { venue_id: user.venue_id }),
        is_active: !isActive
      };

      console.log('Toggle user status request:', requestBody); // Debug log

      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Toggle status response:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Toggle status error:', errorData); // Debug log
        throw new Error(errorData.error || 'Error updating user status');
      }

      await fetchUsers();
      const successMessage = isActive 
        ? 'User deactivated successfully'
        : 'User activated successfully';
      toast.success(successMessage);
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ================================================
  // PASSWORD RESET
  // ================================================

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordModal(true);
  };

  const handleConfirmResetPassword = async () => {
    if (!selectedUser) return;

    // Validate that admin provided a password
    if (!resetPasswordData.new_password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    const confirmMessage = `Are you sure you want to set this password for ${selectedUser.first_name} ${selectedUser.last_name}?`;
    if (!confirm(confirmMessage)) return;

    try {
      const response = await fetch(`/api/auth/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          new_password: resetPasswordData.new_password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error resetting password');
        return;
      }

      setShowResetPasswordModal(false);
      setSelectedUser(null);
      setResetPasswordData({ new_password: '' }); // Clear form
      toast.success('Password reset successfully by administrator');
      
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ================================================
  // ROLE ASSIGNMENT
  // ================================================

  const handleAssignRole = async (roleId: number) => {
    if (!selectedUser || !token) return;

    try {
      await authService.assignRole(token, selectedUser.id, roleId);
      setShowAssignRoleModal(false);
      setSelectedUser(null);
      await fetchUsers();
      toast.success('Role assigned successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ================================================
  // LOCATION ASSIGNMENT
  // ================================================

  const handleAssignLocation = async (user: User) => {
    setSelectedUser(user);
    setShowAssignLocationModal(true);
    
    // Fetch current user locations
    if (token) {
      try {
        const data = await authService.getUserLocations(token, user.id);
        setUserLocations(data.location_ids || []);
      } catch (err) {
        console.error('Error fetching user locations:', err);
        setUserLocations([]);
      }
    }
  };

  const handleToggleLocation = async (locationId: string) => {
    if (!selectedUser || !token) return;

    const isAssigned = userLocations.includes(locationId);

    try {
      if (isAssigned) {
        await authService.removeLocation(token, selectedUser.id, locationId);
        setUserLocations(userLocations.filter(id => id !== locationId));
        toast.success('Venue removed successfully');
      } else {
        await authService.assignLocation(token, selectedUser.id, locationId);
        setUserLocations([...userLocations, locationId]);
        toast.success('Venue assigned successfully');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // ================================================
  // UTILITY FUNCTIONS
  // ================================================

  const generateTemporaryPassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const resetCreateForm = () => {
    setNewUser({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      document_number: '',
      document_type: 'CC',
      venue_id: '',
      role_id: '',
      is_active: true
    });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.length >= 3 && name.length <= 50;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">Manage users and assign system roles</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Users List</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create User
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200" key={refreshKey}>
              {users.map((user) => (
                <tr key={`${user.id}-${refreshKey}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                    <div className="text-sm text-gray-500">{user.document_type}: {user.document_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowAssignRoleModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Assign Role
                      </button>
                      <button
                        onClick={() => handleAssignLocation(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Assign Venues
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="text-orange-600 hover:text-orange-900"
                      >
                        Reset Password
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                        className={`${
                          user.is_active 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {user.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-golden-400 to-golden-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 font-golden">Create New User</h3>
                  <p className="text-sm text-gray-600">Add a new user to the system</p>
                </div>
              </div>
              
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Full Name *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={newUser.first_name}
                      onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                      placeholder="First Name"
                      minLength={3}
                      maxLength={50}
                    />
                    <input
                      type="text"
                      required
                      value={newUser.last_name}
                      onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                      placeholder="Last Name"
                      minLength={3}
                      maxLength={50}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <select
                      required
                      value={newUser.document_type}
                      onChange={(e) => setNewUser({ ...newUser, document_type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                    >
                      <option value="CC">Identity Card</option>
                    </select>
                    <input
                      type="text"
                      required
                      value={newUser.document_number}
                      onChange={(e) => setNewUser({ ...newUser, document_number: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                      placeholder="Document Number"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Role *
                  </label>
                  <select
                    required
                    value={newUser.role_id}
                    onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Initial Status *
                  </label>
                  <select
                    value={newUser.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setNewUser({ ...newUser, is_active: e.target.value === 'active' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-500 focus:border-golden-500 transition-all duration-200 bg-white/80"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Secure Password *
                  </label>
                  <PasswordRequirements
                    password={newUser.password}
                    onPasswordChange={(password) => setNewUser({ ...newUser, password })}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetCreateForm();
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-golden-500 to-amber-500 hover:from-golden-600 hover:to-amber-600 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">✏️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
                  <p className="text-sm text-gray-600">Update user information</p>
                </div>
              </div>
              
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Full Name *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      required
                      value={editUser.first_name}
                      onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                      placeholder="First Name"
                      minLength={3}
                      maxLength={50}
                    />
                    <input
                      type="text"
                      required
                      value={editUser.last_name}
                      onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                      placeholder="Last Name"
                      minLength={3}
                      maxLength={50}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Status *
                  </label>
                  <select
                    value={editUser.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setEditUser({ ...editUser, is_active: e.target.value === 'active' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Role Modal */}
      {showAssignRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Role to {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleAssignRole(role.id)}
                    className="w-full text-left p-3 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">{role.name}</div>
                    <div className="text-sm text-gray-500">{role.description}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowAssignRoleModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reset Password for {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter a secure password for this user.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password *
                </label>
                <input
                  type="password"
                  value={resetPasswordData.new_password}
                  onChange={(e) => setResetPasswordData({ new_password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 bg-white/80"
                  placeholder="Enter secure password (8+ chars, letters, numbers, symbols)"
                  required
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 <strong>Tip:</strong> Use a mix of letters, numbers, and symbols for better security
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedUser(null);
                    setResetPasswordData({ new_password: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmResetPassword}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Set New Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign Location Modal */}
      {showAssignLocationModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Venues to {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Select the venues where this user can work. Click on a venue to toggle assignment.
              </p>
              
              {locations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No venues available. Please create venues first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {locations.map((location) => {
                    const isAssigned = userLocations.includes(location.id);
                    return (
                      <button
                        key={location.id}
                        onClick={() => handleToggleLocation(location.id)}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          isAssigned
                            ? 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">{location.name}</div>
                            <div className="text-sm text-gray-500">{location.code}</div>
                            {location.address && (
                              <div className="text-xs text-gray-400 mt-1">{location.address}</div>
                            )}
                          </div>
                          <div className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                            isAssigned
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {isAssigned ? 'Assigned' : 'Not Assigned'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowAssignLocationModal(false);
                    setSelectedUser(null);
                    setUserLocations([]);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;