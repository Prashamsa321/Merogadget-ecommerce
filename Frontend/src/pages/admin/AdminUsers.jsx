import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import api from '../../services/api';
import { Search } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data.users || []);
    } catch (err) {
      error('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users
    .filter(user => user.role !== 'admin')
    .filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const openRoleModal = (user) => {
    const newRoleValue = user.role === 'admin' ? 'user' : 'admin';
    setSelectedUser(user);
    setNewRole(newRoleValue);
    setRoleModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (selectedUser) {
      try {
        await api.put(`/auth/users/${selectedUser._id}/role`, { role: newRole });
        success(`${selectedUser.name || selectedUser.email}'s role changed to ${newRole}`);
        fetchUsers();
      } catch (err) {
        error('Failed to update user role');
      } finally {
        setRoleModalOpen(false);
        setSelectedUser(null);
      }
    }
  };

  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await api.delete(`/auth/users/${userToDelete._id}`);
        success(`${userToDelete.name || userToDelete.email} deleted successfully`);
        fetchUsers();
      } catch (err) {
        error('Failed to delete user');
      } finally {
        setDeleteModalOpen(false);
        setUserToDelete(null);
      }
    }
  };

  const handleCancelRoleModal = () => {
    setRoleModalOpen(false);
    setSelectedUser(null);
  };

  const handleCancelDeleteModal = () => {
    setDeleteModalOpen(false);
    setUserToDelete(null);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (roleModalOpen) handleCancelRoleModal();
        if (deleteModalOpen) handleCancelDeleteModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [roleModalOpen, deleteModalOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header + Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-shrink-0 text-center md:text-left">
          <p className="eyebrow mb-1 text-xs">Community</p>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D1A00]">Users Management</h1>
          <p className="text-xs text-[#7A6A5A] mt-0.5">
            Total: <span className="font-bold text-[#3D1A00]">{filteredUsers.length}</span> users
          </p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-3 bg-white rounded-2xl p-3 border border-orange-100 shadow-soft">
          <div className="w-full sm:w-64 md:w-72 relative">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-cream border border-orange-100 rounded-full text-sm text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#A8998A]" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-[#FFF4E6]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Email</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Role</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Member Since</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#7A6A5A]">
                    <p className="font-semibold text-[#3D1A00]">No users found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center shadow-md">
                          <span className="text-white font-bold">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#3D1A00]">{user.name || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7A6A5A]">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                          admin
                        </span>
                      ) : (
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          user
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#7A6A5A]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openRoleModal(user)}
                          className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50"
                          title="Change Role"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={handleCancelRoleModal}
        onConfirm={handleConfirmRoleChange}
        title="Change User Role"
        message={`Are you sure you want to change "${selectedUser?.name || selectedUser?.email}"'s role from ${selectedUser?.role} to ${newRole}?`}
        confirmText="Change Role"
        cancelText="Cancel"
        type="warning"
      />

    </div>
  );
};

export default AdminUsers;