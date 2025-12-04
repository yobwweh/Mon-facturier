import React, { useState } from 'react';
import { Users, Trash2, Search, Plus, Mail, MapPin, Building, ArrowLeft } from 'lucide-react';
import { storage } from '../services/storage'; // Import du service

export default function ClientList({ clients, setClients, setView }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [newClient, setNewClient] = useState({ name: '', ncc: '', email: '', phone: '', address: '', city: '' });
    const [isAdding, setIsAdding] = useState(false);

    const handleAddClient = async () => {
        if (!newClient.name) return alert("Le nom est obligatoire");
        const clientToAdd = { ...newClient, id: Date.now() };
        const updatedClients = [...clients, clientToAdd];
        
        setClients(updatedClients);
        // Sauvegarde Sécurisée
        await storage.save('clientDB', updatedClients);
        
        setNewClient({ name: '', ncc: '', email: '', phone: '', address: '', city: '' });
        setIsAdding(false);
    };

    const handleDelete = async (id) => {
        if (confirm("Supprimer ce client ?")) {
            const updated = clients.filter(c => c.id !== id);
            setClients(updated);
            // Sauvegarde Sécurisée
            await storage.save('clientDB', updated);
        }
    };

    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-full bg-gray-50 p-8 overflow-y-auto">
            <div className="max-w-5xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-8 h-8 text-blue-600" /> Mes Clients
                    </h2>
                    <button onClick={() => setView('editor')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm transition">
                        <ArrowLeft className="w-4 h-4" /> Retourner à l'éditeur
                    </button>
                </div>

                {/* BARRE DE RECHERCHE ET AJOUT */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un client..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" /> Nouveau Client
                    </button>
                </div>

                {/* FORMULAIRE D'AJOUT RAPIDE */}
                {isAdding && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500 animate-fadeIn">
                        <h3 className="font-bold text-lg mb-4">Ajouter un nouveau client</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <input type="text" placeholder="Nom / Raison Sociale *" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className="p-2 border rounded" />
                            <input type="text" placeholder="NCC (Optionnel)" value={newClient.ncc} onChange={e => setNewClient({...newClient, ncc: e.target.value})} className="p-2 border rounded" />
                            <input type="text" placeholder="Email" value={newClient.email} onChange={e => setNewClient({...newClient, email: e.target.value})} className="p-2 border rounded" />
                            <input type="text" placeholder="Téléphone" value={newClient.phone} onChange={e => setNewClient({...newClient, phone: e.target.value})} className="p-2 border rounded" />
                            <input type="text" placeholder="Adresse" value={newClient.address} onChange={e => setNewClient({...newClient, address: e.target.value})} className="p-2 border rounded" />
                            <input type="text" placeholder="Ville" value={newClient.city} onChange={e => setNewClient({...newClient, city: e.target.value})} className="p-2 border rounded" />
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded">Annuler</button>
                            <button onClick={handleAddClient} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700">Enregistrer</button>
                        </div>
                    </div>
                )}

                {/* LISTE DES CLIENTS */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 border-b">Client</th>
                                <th className="p-4 border-b">Contact</th>
                                <th className="p-4 border-b">Adresse</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.length === 0 ? (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Aucun client trouvé.</td></tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr key={client.id} className="border-b hover:bg-blue-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{client.name}</div>
                                            {client.ncc && <div className="text-xs text-blue-600 bg-blue-100 inline-block px-1 rounded mt-1">NCC: {client.ncc}</div>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {client.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {client.email}</div>}
                                            {client.phone && <div className="flex items-center gap-1 mt-1"><Building className="w-3 h-3" /> {client.phone}</div>}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {client.city && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {client.city}</div>}
                                            <div className="text-xs text-gray-400">{client.address}</div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleDelete(client.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}