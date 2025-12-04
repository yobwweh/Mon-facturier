import React, { useState, useEffect } from 'react';
import { Save, Upload, X, Settings, ArrowLeft } from 'lucide-react';
import { storage } from '../services/storage'; 

export default function SettingsView({ setView, showNotification, onProfileUpdate }) {
    // Note : On garde 'zip' dans l'état pour ne pas casser la structure existante, 
    // mais on ne l'affiche plus dans le formulaire.
    const [profile, setProfile] = useState({
        name: '', legalForm: '', capital: '', 
        address: '', city: '', zip: '', 
        email: '', phone: '', 
        ncc: '', rccm: '', 
        bankName: '', iban: '',
        logo: null
    });

    useEffect(() => {
        const load = async () => {
            const saved = await storage.get('companyProfile');
            if (saved) setProfile(saved);
        };
        load();
    }, []);

    const handleSave = async () => {
        await storage.save('companyProfile', profile);
        
        if (onProfileUpdate) {
            onProfileUpdate(profile);
        }

        if (showNotification) {
            showNotification("Profil entreprise mis à jour et appliqué !");
        } else {
            alert("Profil mis à jour !");
        }
    };

    const handleLogo = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProfile(p => ({ ...p, logo: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="h-full bg-gray-50 p-8 overflow-y-auto font-sans text-gray-800">
            <div className="max-w-4xl mx-auto pb-20">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Settings className="w-8 h-8 text-blue-600" /> Paramètres de l'entreprise
                    </h2>
                    <button onClick={() => setView('editor')} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold text-sm transition">
                        <ArrowLeft className="w-4 h-4" /> Retourner à l'éditeur
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center sticky top-0 z-10">
                        <div>
                            <h3 className="font-bold text-gray-700">Informations Générales</h3>
                            <p className="text-xs text-gray-400">Ces informations apparaîtront sur tous vos nouveaux documents.</p>
                        </div>
                        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition shadow-sm">
                            <Save className="w-4 h-4" /> Enregistrer & Appliquer
                        </button>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* COLONNE GAUCHE : LOGO & IDENTITÉ */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Logo par défaut</label>
                                <div className="relative w-40 h-40 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center overflow-hidden group hover:border-blue-400 transition-colors">
                                    {profile.logo ? (
                                        <>
                                            <img src={profile.logo} className="w-full h-full object-contain" alt="Logo" />
                                            <button onClick={() => setProfile(p => ({...p, logo: null}))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-8 h-8" />
                                            </button>
                                        </>
                                    ) : ( 
                                        <div className="text-center p-4">
                                            <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <span className="text-xs text-gray-400">PNG ou JPG</span>
                                            <input type="file" accept="image/*" onChange={handleLogo} className="absolute inset-0 opacity-0 cursor-pointer" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* IDENTITÉ ENTREPRISE */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Raison Sociale</label>
                                <input type="text" value={profile.name} onChange={(e) => setProfile(p => ({...p, name: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="Votre entreprise" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Forme</label>
                                    <input type="text" value={profile.legalForm} onChange={(e) => setProfile(p => ({...p, legalForm: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="SARL, EIRL..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Capital</label>
                                    <input type="text" value={profile.capital} onChange={(e) => setProfile(p => ({...p, capital: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="1 000 000" />
                                </div>
                            </div>
                        </div>

                        {/* COLONNE DROITE : COORDONNÉES & FISCAL */}
                        <div className="space-y-6">
                            {/* ADRESSE (MODIFIÉ : Suppression du Code Postal) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Localisation</label>
                                <input type="text" value={profile.address} onChange={(e) => setProfile(p => ({...p, address: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition mb-2" placeholder="Adresse (Rue, Avenue, Lot, Îlot...)" />
                                {/* Le champ Ville prend maintenant toute la largeur */}
                                <input type="text" value={profile.city} onChange={(e) => setProfile(p => ({...p, city: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="Ville / Commune / BP" />
                            </div>

                            {/* CONTACT */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Téléphone</label>
                                    <input type="text" value={profile.phone} onChange={(e) => setProfile(p => ({...p, phone: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="+225 07..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Email</label>
                                    <input type="email" value={profile.email} onChange={(e) => setProfile(p => ({...p, email: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="contact@..." />
                                </div>
                            </div>

                            {/* FISCAL (DGI) */}
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <h4 className="text-xs font-bold text-orange-700 uppercase mb-3">Fiscalité (DGI)</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">NCC</label>
                                        <input type="text" value={profile.ncc} onChange={(e) => setProfile(p => ({...p, ncc: e.target.value}))} className="w-full px-4 py-2 border border-orange-300 rounded-lg text-sm focus:border-blue-500 outline-none transition bg-white" placeholder="1234567 A" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 uppercase mb-2">RCCM</label>
                                        <input type="text" value={profile.rccm} onChange={(e) => setProfile(p => ({...p, rccm: e.target.value}))} className="w-full px-4 py-2 border border-orange-300 rounded-lg text-sm focus:border-blue-500 outline-none transition bg-white" placeholder="CI-ABJ-2024-..." />
                                    </div>
                                </div>
                            </div>

                            {/* COORDONNÉES BANCAIRES */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase mb-3">Coordonnées Bancaires</h4>
                                <div className="space-y-2">
                                    <input type="text" value={profile.bankName} onChange={(e) => setProfile(p => ({...p, bankName: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="Nom de la banque" />
                                    <input type="text" value={profile.iban} onChange={(e) => setProfile(p => ({...p, iban: e.target.value}))} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:border-blue-500 outline-none transition" placeholder="IBAN (optionnel)" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}