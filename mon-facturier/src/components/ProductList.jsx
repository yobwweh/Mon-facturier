import React, { useState } from 'react';
import { Package, Trash2, Search, Plus, ArrowLeft } from 'lucide-react';
import { storage } from '../services/storage'; // Import du service

export default function ProductList({ products, setProducts, setView, formatMoney }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [newProduct, setNewProduct] = useState({ description: '', price: '' });
    const [isAdding, setIsAdding] = useState(false);

    const handleAddProduct = async () => {
        if (!newProduct.description) return alert("La description est obligatoire");
        if (!newProduct.price) return alert("Le prix est obligatoire");

        const productToAdd = { 
            ...newProduct, 
            id: Date.now(),
            price: parseFloat(newProduct.price)
        };

        const updatedProducts = [...products, productToAdd];
        setProducts(updatedProducts);
        // Sauvegarde Sécurisée
        await storage.save('productDB', updatedProducts);
        
        setNewProduct({ description: '', price: '' });
        setIsAdding(false);
    };

    const handleDelete = async (id) => {
        if (confirm("Supprimer ce produit du catalogue ?")) {
            const updated = products.filter(p => p.id !== id);
            setProducts(updated);
            // Sauvegarde Sécurisée
            await storage.save('productDB', updated);
        }
    };

    const filteredProducts = products.filter(p => 
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full bg-gray-50 p-8 overflow-y-auto">
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Package className="w-8 h-8 text-blue-600" /> Catalogue Produits & Services
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
                            placeholder="Rechercher un article..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <button onClick={() => setIsAdding(!isAdding)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition">
                        <Plus className="w-5 h-5" /> Ajouter un article
                    </button>
                </div>

                {/* FORMULAIRE D'AJOUT RAPIDE */}
                {isAdding && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6 border-l-4 border-blue-500 animate-fadeIn">
                        <h3 className="font-bold text-lg mb-4">Nouvelle référence</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description / Nom</label>
                                <input type="text" placeholder="Ex: Installation Split 1.5 CV" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Prix Unitaire</label>
                                <input type="number" placeholder="0" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 border rounded outline-none focus:border-blue-500" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded font-bold text-sm">Annuler</button>
                            <button onClick={handleAddProduct} className="px-6 py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 text-sm">Enregistrer au catalogue</button>
                        </div>
                    </div>
                )}

                {/* LISTE DES PRODUITS */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 border-b w-2/3">Désignation</th>
                                <th className="p-4 border-b text-right">Prix Unitaire</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr><td colSpan="3" className="p-8 text-center text-gray-400">Aucun produit dans le catalogue.</td></tr>
                            ) : (
                                filteredProducts.map(product => (
                                    <tr key={product.id} className="border-b hover:bg-blue-50/50 transition">
                                        <td className="p-4">
                                            <div className="font-bold text-slate-800">{product.description}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono font-bold text-slate-700">
                                            {formatMoney(product.price)}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Supprimer">
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