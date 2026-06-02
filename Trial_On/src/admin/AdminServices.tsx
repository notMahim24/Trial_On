import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Search, X, Check, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface Service {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link: string;
  created_at?: string;
}

const AdminServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [link, setLink] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setImageUrl('');
    setLink('');
    setEditingService(null);
    setError(null);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setTitle(service.title);
    setDescription(service.description || '');
    setImageUrl(service.image_url || '');
    setLink(service.link || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    const payload = { title, description, image_url: imageUrl, link };
    
    try {
      const url = editingService ? `/api/services/${editingService.id}` : '/api/services';
      const method = editingService ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save service');
      }
      
      await fetchServices();
      setIsModalOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete service');
      await fetchServices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredServices = services.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-admin-display text-admin-gold mb-2 tracking-wide font-bold">Services</h2>
          <p className="text-admin-ivory/60 text-sm">Manage the services displayed on the frontend.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-admin-gold text-admin-bg px-6 py-2.5 rounded-none text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-2 hover:bg-admin-gold/90 transition-colors"
        >
          <Plus size={16} /> Add New Service
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-black/20 p-4 border border-admin-gold/10">
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-admin-ivory/40" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-admin-gold/20 text-admin-ivory pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-admin-gold/50 transition-colors"
          />
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-2 border-admin-gold/30 border-t-admin-gold rounded-full animate-spin" />
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-20 bg-black/20 border border-admin-gold/10">
          <p className="text-admin-ivory/50">No services found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <motion.div 
              key={service.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/20 border border-admin-gold/10 overflow-hidden group hover:border-admin-gold/30 transition-colors"
            >
              <div className="aspect-video relative bg-admin-bg overflow-hidden flex items-center justify-center border-b border-admin-gold/10">
                {service.image_url ? (
                  <img src={service.image_url} alt={service.title} className="w-full h-full object-cover p-4" />
                ) : (
                  <ImageIcon size={40} className="opacity-20 text-admin-gold" />
                )}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenEdit(service)}
                    className="p-2 bg-black/50 hover:bg-admin-gold text-admin-ivory hover:text-black rounded-full backdrop-blur-sm transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(service.id)}
                    className="p-2 bg-black/50 hover:bg-red-500 text-admin-ivory rounded-full backdrop-blur-sm transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-admin-gold mb-2">{service.title}</h3>
                <p className="text-sm text-admin-ivory/60 line-clamp-2">{service.description || 'No description provided.'}</p>
                {service.link && (
                  <a href={service.link} target="_blank" rel="noopener noreferrer" className="text-xs text-[#8b7355] hover:text-admin-gold mt-4 inline-block underline">
                    {service.link}
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111111] border border-admin-gold/20 p-8 w-full max-w-xl shadow-2xl relative"
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-admin-ivory/40 hover:text-admin-ivory p-2"
            >
              <X size={20} />
            </button>
            <h3 className="text-2xl font-admin-display text-admin-gold mb-6">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm p-4 mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-admin-ivory/60 text-[10px] uppercase font-bold tracking-widest mb-2">Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  className="w-full bg-black/50 border border-admin-gold/20 text-admin-ivory px-4 py-3 focus:outline-none focus:border-admin-gold/50"
                  placeholder="e.g. AI Personal Stylist"
                />
              </div>
              
              <div>
                <label className="block text-admin-ivory/60 text-[10px] uppercase font-bold tracking-widest mb-2">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="w-full bg-black/50 border border-admin-gold/20 text-admin-ivory px-4 py-3 h-24 focus:outline-none focus:border-admin-gold/50 custom-scrollbar"
                  placeholder="Service description..."
                />
              </div>

              <div>
                <label className="block text-admin-ivory/60 text-[10px] uppercase font-bold tracking-widest mb-2">Image URL</label>
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  className="w-full bg-black/50 border border-admin-gold/20 text-admin-ivory px-4 py-3 focus:outline-none focus:border-admin-gold/50"
                  placeholder="https://..."
                />
              </div>
              
              <div>
                <label className="block text-admin-ivory/60 text-[10px] uppercase font-bold tracking-widest mb-2">Link (Optional)</label>
                <input 
                  type="text" 
                  value={link} 
                  onChange={(e) => setLink(e.target.value)} 
                  className="w-full bg-black/50 border border-admin-gold/20 text-admin-ivory px-4 py-3 focus:outline-none focus:border-admin-gold/50"
                  placeholder="/contact or https://..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-admin-gold text-admin-bg py-3 text-xs uppercase font-bold tracking-widest hover:bg-admin-gold/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingService ? 'Save Changes' : 'Create Service')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-admin-gold/20 text-admin-ivory py-3 text-xs uppercase font-bold tracking-widest hover:bg-admin-gold/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminServices;
