import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Mail, MailOpen, Trash2, Eye } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const AdminContacts: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/contact');
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (id: string, currentStatus: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !currentStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
      
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: !currentStatus });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete message');
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage && selectedMessage.id === id) setSelectedMessage(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    if (!msg.is_read) {
      handleToggleRead(msg.id, msg.is_read);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-admin-display text-admin-gold mb-2 tracking-wide font-bold">Contact Messages</h2>
          <p className="text-admin-ivory/60 text-sm">View and manage inquiries from customers.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left List */}
        <div className="w-full lg:w-1/2 xl:w-5/12 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-ivory/40" />
            <input
              type="text"
              placeholder="Search by name, email, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-admin-gold/20 text-admin-ivory pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-admin-gold/50 transition-colors"
            />
          </div>

          <div className="bg-black/20 border border-admin-gold/10 flex flex-col h-[600px] overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center items-center flex-grow">
                <div className="w-6 h-6 border-2 border-admin-gold/30 border-t-admin-gold rounded-full animate-spin" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex justify-center flex-col items-center flex-grow opacity-50 p-8 text-center">
                <Mail size={32} className="mb-4 text-admin-gold" />
                <p>No messages found.</p>
              </div>
            ) : (
              <div className="overflow-y-auto custom-scrollbar flex-grow">
                {filteredMessages.map(msg => (
                  <div
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className={cn(
                      "p-4 border-b border-admin-gold/5 cursor-pointer hover:bg-admin-gold/5 transition-colors group",
                      selectedMessage?.id === msg.id && "bg-admin-gold/10 border-l-2 border-l-admin-gold"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {!msg.is_read ? (
                          <div className="w-2 h-2 rounded-full bg-admin-gold" title="Unread" />
                        ) : (
                          <div className="w-2 h-2" />
                        )}
                        <span className={cn("text-sm font-bold truncate", !msg.is_read ? "text-admin-gold" : "text-admin-ivory")}>
                          {msg.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-admin-ivory/40 whitespace-nowrap ml-2">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={cn("text-xs truncate mb-1", !msg.is_read ? "text-admin-ivory font-semibold" : "text-admin-ivory/60")}>
                      {msg.subject || 'No Subject'}
                    </p>
                    <p className="text-xs text-admin-ivory/40 truncate">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Reader */}
        <div className="w-full lg:w-1/2 xl:w-7/12">
          {selectedMessage ? (
            <div className="bg-black/20 border border-admin-gold/10 h-full min-h-[600px] flex flex-col">
              <div className="p-6 border-b border-admin-gold/10 flex justify-between items-start bg-black/40">
                <div>
                  <h3 className="text-xl font-admin-display text-admin-gold mb-2">{selectedMessage.subject || 'No Subject'}</h3>
                  <div className="text-sm text-admin-ivory/60">
                    <span className="font-bold text-admin-ivory mr-2">{selectedMessage.name}</span>
                    <a href={`mailto:${selectedMessage.email}`} className="text-[#8b7355] hover:underline">
                      &lt;{selectedMessage.email}&gt;
                    </a>
                  </div>
                  <div className="text-xs text-admin-ivory/40 mt-1">
                    {new Date(selectedMessage.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleToggleRead(selectedMessage.id, selectedMessage.is_read)}
                    title={selectedMessage.is_read ? "Mark as unread" : "Mark as read"}
                    className="p-2 bg-black/50 border border-admin-gold/20 text-admin-ivory hover:text-admin-gold transition-colors"
                  >
                    {selectedMessage.is_read ? <Mail size={16} /> : <MailOpen size={16} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedMessage.id)}
                    title="Delete message"
                    className="p-2 bg-black/50 border border-admin-gold/20 text-admin-ivory hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-8 flex-grow overflow-y-auto custom-scrollbar bg-black/10">
                <p className="text-admin-ivory/80 leading-relaxed whitespace-pre-wrap font-admin-body text-sm md:text-base">
                  {selectedMessage.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-admin-gold/10 border-dashed h-full min-h-[600px] flex flex-col items-center justify-center opacity-30 text-center p-8">
              <Eye size={48} className="mb-4 text-admin-gold" />
              <p className="text-admin-ivory uppercase tracking-[0.2em] font-bold text-xs">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContacts;
