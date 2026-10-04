import React, { useState, useEffect } from 'react';
import { contactService } from '../../services/contactService';
import { useToast } from '../../context/ToastContext';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, read: 0, replied: 0 });
  const { success, error } = useToast();

  useEffect(() => {
    fetchContacts();
    fetchStats();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactService.getAllContacts();
      setContacts(data.contacts || []);
    } catch (err) {
      error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await contactService.getContactStats();
      setStats(data.stats || { total: 0, pending: 0, read: 0, replied: 0 });
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const handleViewContact = async (contact) => {
    try {
      const data = await contactService.getContactById(contact._id);
      setSelectedContact(data.contact);
    } catch (err) {
      error('Failed to load message details');
    }
  };

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="eyebrow mb-1">Inbox</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Contact Messages</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">View customer inquiries</p>
        </div>
        <div className="text-sm text-[#7A6A5A]">
          Total: <span className="text-[#3D1A00] font-bold">{contacts.length}</span> messages
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-soft p-5 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-blue-50 rounded-2xl flex items-center justify-center text-xl">💬</div>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-xs text-[#7A6A5A] mt-1 uppercase tracking-widest font-semibold">Total</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-amber-50 rounded-2xl flex items-center justify-center text-xl">⏳</div>
          </div>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <div className="text-xs text-[#7A6A5A] mt-1 uppercase tracking-widest font-semibold">Pending</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-orange-50 rounded-2xl flex items-center justify-center text-xl">👁️</div>
          </div>
          <div className="text-2xl font-bold text-orange-600">{stats.read}</div>
          <div className="text-xs text-[#7A6A5A] mt-1 uppercase tracking-widest font-semibold">Read</div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-5 border border-orange-100">
          <div className="flex items-center justify-between mb-3">
            <div className="w-11 h-11 bg-green-50 rounded-2xl flex items-center justify-center text-xl">✅</div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.replied}</div>
          <div className="text-xs text-[#7A6A5A] mt-1 uppercase tracking-widest font-semibold">Replied</div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-[#FFF4E6]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">From</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Subject</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-50">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-[#7A6A5A]">
                    <div className="text-5xl mb-3">📭</div>
                    <p className="font-semibold text-[#3D1A00]">No messages found</p>
                    <p className="text-sm mt-1">New customer inquiries will appear here</p>
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                          {contact.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#3D1A00]">{contact.name}</p>
                          <p className="text-sm text-[#7A6A5A]">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[#3D1A00] font-medium">{contact.subject.substring(0, 20)}</p>
                      <p className="text-sm text-[#7A6A5A] line-clamp-1">
                        {contact.message.substring(0, 30)}...
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#7A6A5A]">
                      {new Date(contact.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewContact(contact)}
                        className="text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 font-semibold text-sm px-3 py-1.5 rounded-full hover:bg-orange-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Contact Modal — z-[100] to cover sticky header */}
      {selectedContact && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3D1A00]/70 backdrop-blur-md p-4"
          onClick={() => setSelectedContact(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-orange-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-orange-100 p-5 flex justify-between items-center z-10 rounded-t-3xl">
              <h3 className="text-lg font-bold text-[#3D1A00] flex items-center gap-2">
                <span className="text-xl">📧</span>
                Message Details
              </h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-[#A8998A] hover:text-[#3D1A00] transition-colors text-2xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-orange-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">

              {/* From */}
              <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest flex items-center gap-2 pt-1">
                  <span className="text-base">👤</span>
                  From
                </label>
                <div>
                  <p className="font-bold text-[#3D1A00]">{selectedContact.name}</p>
                  <p className="text-sm text-[#7A6A5A] break-all">{selectedContact.email}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest flex items-center gap-2 pt-1">
                  <span className="text-base">📌</span>
                  Subject
                </label>
                <p className="text-[#3D1A00] font-semibold break-words">{selectedContact.subject}</p>
              </div>

              {/* Date */}
              <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest flex items-center gap-2 pt-1">
                  <span className="text-base">📅</span>
                  Date
                </label>
                <p className="text-[#5C4B3A] break-words">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Message */}
              <div className="pt-2">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest flex items-center gap-2 mb-3">
                  <span className="text-base">💬</span>
                  Message
                </label>
                <div className="bg-[#FFF4E6] rounded-2xl p-4 border border-orange-100">
                  <p className="text-[#5C4B3A] whitespace-pre-wrap break-words leading-relaxed">
                    {selectedContact.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-orange-100 p-5 flex justify-end rounded-b-3xl">
              <button
                onClick={() => setSelectedContact(null)}
                className="px-6 py-2.5 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-500/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;