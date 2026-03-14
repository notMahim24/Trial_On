import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Edit2, ShieldAlert, X, FileEdit, Table } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Column {
  name: string;
  type: string;
  default_value: string | null;
  is_nullable: boolean;
}

interface TableDef {
  name: string;
  schema: string;
  columns?: Column[];
}

const AdminDatabase: React.FC = () => {
  const [tables, setTables] = useState<TableDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modals
  const [isNewTableModalOpen, setIsNewTableModalOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  
  const [selectedTable, setSelectedTable] = useState<TableDef | null>(null);
  const [isManageTableModalOpen, setIsManageTableModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('TEXT');

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/schema/tables');
      if (!res.ok) throw new Error('Failed to fetch tables / Unauthorized');
      const data = await res.json();
      setTables(data.tables || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schema/tables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: newTableName, columns: [] })
      });
      if (!res.ok) throw new Error(await res.text());
      setIsNewTableModalOpen(false);
      setNewTableName('');
      fetchTables();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable) return;
    try {
      const res = await fetch(`/api/schema/tables/${selectedTable.name}/columns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnName: newColumnName, columnType: newColumnType })
      });
      if (!res.ok) throw new Error(await res.text());
      setNewColumnName('');
      fetchTables();
      // Optimistically update
      setSelectedTable({
        ...selectedTable,
        columns: [...(selectedTable.columns || []), { name: newColumnName, type: newColumnType, is_nullable: true, default_value: null }]
      });
    } catch(err: any){
      alert(err.message);
    }
  };

  const handleDeleteColumn = async (columnName: string) => {
    if (!selectedTable || !confirm(`Remove column ${columnName} from ${selectedTable.name}?`)) return;
    try {
      const res = await fetch(`/api/schema/tables/${selectedTable.name}/columns/${columnName}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error(await res.text());
      fetchTables();
      setSelectedTable({
        ...selectedTable,
        columns: selectedTable.columns?.filter(c => c.name !== columnName)
      });
    } catch(err: any){
      alert(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-admin-display text-admin-gold mb-2 font-bold tracking-wide">Database Console</h2>
          <p className="text-admin-ivory/60 text-sm">Manage dynamic tables and schema (Requires Superuser Privileges).</p>
        </div>
        <button 
          onClick={() => setIsNewTableModalOpen(true)}
          className="bg-admin-gold text-admin-bg px-6 py-3 text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all flex items-center gap-2"
        >
          <Plus size={14} /> New Table
        </button>
      </div>

      {error ? (
        <div className="p-8 border border-red-500/20 bg-red-500/5 text-red-500 flex flex-col items-center justify-center text-center">
          <ShieldAlert size={48} className="mb-4 opacity-50" />
          <h3 className="font-bold text-lg mb-2">Insufficient Permissions or Connection Failed</h3>
          <p className="text-sm opacity-80 max-w-md">
            Dynamic database modifications require the Postgres Connection String or the Supabase Service Role Key to bypass Row Level Security.
          </p>
          <p className="text-xs opacity-50 mt-4 bg-black/50 p-4 rounded">{error}</p>
        </div>
      ) : loading ? (
                 <div className="flex justify-center flex-col items-center flex-grow p-12">
                   <div className="w-8 h-8 border-2 border-admin-gold/30 border-t-admin-gold rounded-full animate-spin mb-4" />
                   <div className="text-[10px] uppercase tracking-widest text-admin-gold animate-pulse">Scanning Schema...</div>
                 </div>
               ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {tables.length === 0 && (
              <div className="col-span-full text-center text-admin-ivory/50 p-12 border border-admin-gold/10 border-dashed">
                <Database size={48} className="mx-auto mb-4 opacity-20" />
                <p>No tables found in public schema.</p>
              </div>
           )}
           {tables.map((table, i) => (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               key={table.name} 
               className="bg-black/40 border border-admin-gold/20 p-6 flex flex-col"
             >
               <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-admin-gold/10 flex items-center justify-center border border-admin-gold/30 text-admin-gold">
                     <Table size={14} />
                   </div>
                   <h3 className="font-bold text-lg tracking-wide">{table.name}</h3>
                 </div>
               </div>
               
               <div className="mt-4 flex-grow">
                 <p className="text-[10px] uppercase tracking-widest text-admin-ivory/40 mb-3 font-bold border-b border-white/5 pb-2">Columns</p>
                 <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                   {table.columns?.map(col => (
                     <div key={col.name} className="flex justify-between items-center text-xs">
                       <span className="font-mono text-admin-ivory/80">{col.name}</span>
                       <span className="text-[10px] uppercase text-admin-gold/60">{col.type}</span>
                     </div>
                   ))}
                   {!table.columns && <span className="text-xs text-admin-ivory/40">Columns hidden...</span>}
                 </div>
               </div>

               <button 
                 onClick={() => { setSelectedTable(table); setIsManageTableModalOpen(true); }}
                 className="w-full mt-6 py-2 border border-admin-gold/20 text-admin-gold text-[10px] uppercase tracking-widest font-bold hover:bg-admin-gold/10 transition-colors"
               >
                 Manage Schema Structure
               </button>
             </motion.div>
           ))}
        </div>
      )}

      {/* New Table Modal */}
      <AnimatePresence>
        {isNewTableModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111] border border-admin-gold/20 w-full max-w-md p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-admin-display text-admin-gold font-bold tracking-wider">Create New Table</h3>
                <button onClick={() => setIsNewTableModalOpen(false)} className="text-admin-ivory/40 hover:text-admin-ivory">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateTable} className="space-y-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-admin-ivory/60 mb-2">Table Name</label>
                   <p className="text-[10px] text-admin-ivory/40 mb-2">Use lowercase letters and underscores only (e.g. `product_reviews`). The `id` and `created_at` columns will be added automatically.</p>
                  <input
                    type="text"
                    required
                    pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    className="w-full bg-black/40 border border-admin-gold/20 text-admin-ivory px-4 py-3 focus:outline-none focus:border-admin-gold transition-colors text-sm font-mono"
                    placeholder="table_name"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-admin-gold text-admin-bg py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all"
                >
                  Create Table
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Table Modal */}
      <AnimatePresence>
        {isManageTableModalOpen && selectedTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111] border border-admin-gold/20 w-full max-w-2xl p-8 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-admin-display text-admin-gold font-bold tracking-wider">Manage Schema</h3>
                  <p className="text-xs text-admin-ivory/40 mt-1 font-mono">{selectedTable.schema}.{selectedTable.name}</p>
                </div>
                <button onClick={() => setIsManageTableModalOpen(false)} className="text-admin-ivory/40 hover:text-admin-ivory">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar mb-8">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-admin-gold/20 text-[10px] uppercase tracking-widest text-admin-ivory/40">
                      <th className="pb-3 font-bold">Column Name</th>
                      <th className="pb-3 font-bold">Type</th>
                      <th className="pb-3 font-bold">Nullable</th>
                      <th className="pb-3 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {selectedTable.columns?.map(col => (
                      <tr key={col.name} className="hover:bg-white/5 transition-colors group">
                        <td className="py-3 font-mono text-xs">{col.name}</td>
                        <td className="py-3 text-[10px] text-admin-gold/60 uppercase">{col.type}</td>
                        <td className="py-3 text-xs text-admin-ivory/40">{col.is_nullable ? 'YES' : 'NO'}</td>
                        <td className="py-3 text-right">
                           <button 
                             onClick={() => handleDeleteColumn(col.name)}
                             disabled={col.name === 'id'}
                             className="p-1 px-2 text-red-400 hover:bg-red-400/20 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                             title={col.name === 'id' ? "Primary key cannot be deleted" : "Delete Column"}
                            >
                             <Trash2 size={12} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <form onSubmit={handleAddColumn} className="bg-black/30 p-4 border border-admin-gold/10 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-admin-ivory/60 mb-2">New Column Name</label>
                  <input
                    type="text"
                    required
                    pattern="^[a-zA-Z_][a-zA-Z0-9_]*$"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    className="w-full bg-black/40 border border-admin-gold/20 text-admin-ivory px-3 py-2 focus:outline-none focus:border-admin-gold transition-colors text-xs font-mono"
                    placeholder="my_column"
                  />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-admin-ivory/60 mb-2">Type</label>
                  <select
                    value={newColumnType}
                    onChange={(e) => setNewColumnType(e.target.value)}
                    className="w-full bg-[#111] border border-admin-gold/20 text-admin-ivory px-3 py-2 text-xs focus:outline-none focus:border-admin-gold"
                  >
                    <option value="TEXT">TEXT</option>
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="INTEGER">INTEGER</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="TIMESTAMP WITH TIME ZONE">TIMESTAMP</option>
                    <option value="JSONB">JSONB</option>
                  </select>
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-admin-gold/20 text-admin-gold border border-admin-gold/50 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-admin-gold hover:text-admin-bg transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDatabase;
