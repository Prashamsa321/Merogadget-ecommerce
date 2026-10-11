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

      {/* Header + inline stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-shrink-0 text-center md:text-left">
          <p className="eyebrow mb-1 text-xs">Inbox</p>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D1A00]">Contact Messages</h1>
          <p className="text-xs text-[#7A6A5A] mt-0.5">View customer inquiries</p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-3 bg-white rounded-2xl px-4 py-2.5 border border-orange-100 shadow-soft">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Total</span>
            <span className="text-lg font-bold text-blue-600">{stats.total}</span>
          </div>
          <div className="w-px h-6 bg-orange-100"></div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Read</span>
            <span className="text-lg font-bold text-orange-600">{stats.read}</span>
          </div>
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
                        className="text-orange-600 hover:text-orange-700 transition-colors font-semibold text-sm px-3 py-1.5 rounded-full hover:bg-orange-50"
                      >
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

      {/* View Contact Modal */}
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
              <h3 className="text-lg font-bold text-[#3D1A00]">
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
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest pt-1">
                  From
                </label>
                <div>
                  <p className="font-bold text-[#3D1A00]">{selectedContact.name}</p>
                  <p className="text-sm text-[#7A6A5A] break-all">{selectedContact.email}</p>
                </div>
              </div>

              {/* Subject */}
              <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest pt-1">
                  Subject
                </label>
                <p className="text-[#3D1A00] font-semibold break-words">{selectedContact.subject}</p>
              </div>

              {/* Date */}
              <div className="grid grid-cols-[110px_1fr] gap-3 items-start">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest pt-1">
                  Date
                </label>
                <p className="text-[#5C4B3A] break-words">
                  {new Date(selectedContact.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Message */}
              <div className="pt-2">
                <label className="text-xs font-bold text-[#A8998A] uppercase tracking-widest mb-3 block">
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