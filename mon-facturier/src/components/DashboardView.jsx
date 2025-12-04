// src/components/DashboardView.jsx
import React from 'react';
import { User, FileText, CheckSquare, Square, Plus, Trash2, CreditCard, ArrowLeft, TrendingUp, AlertCircle, Wallet } from 'lucide-react';

export default function DashboardView({ savedDocuments = [], clients = [], formatMoney = (val) => val + ' FCFA', setView }) {
    
    // --- 1. PROTECTION INITIALE ---
    if (!savedDocuments || !Array.isArray(savedDocuments)) {
        return (
            <div className="p-10 text-center text-gray-500">
                <h2 className="text-xl font-bold mb-2">Chargement du tableau de bord...</h2>
                <p>Analyse des données en cours.</p>
            </div>
        );
    }

    // --- 2. FONCTIONS DE CALCUL SÉCURISÉES ---
    // Cette fonction unifie le calcul du montant total d'un document (TTC ou Montant Reçu)
    const getDocAmount = (doc) => {
        if (!doc) return 0;
        
        // Cas RECU
        if (doc.type === 'RECU') {
            return parseFloat(doc.receiptAmount) || 0;
        }

        // Cas FACTURE / DEVIS
        if (!doc.items || !Array.isArray(doc.items)) return 0;
        
        try {
            const subtotal = doc.items.reduce((acc, item) => {
                const qty = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.price) || 0;
                return acc + (qty * price);
            }, 0);
            
            const taxRate = parseFloat(doc.taxRate) || 0;
            return doc.hasTax ? subtotal * (1 + taxRate / 100) : subtotal;
        } catch (e) { 
            console.error("Erreur calcul doc:", doc.id, e);
            return 0; 
        }
    };

    // --- 3. CALCUL DES KPI (INDICATEURS CLÉS) ---
    const validDocs = savedDocuments.filter(d => d && typeof d === 'object');

    // A. TRESORERIE RÉELLE (CASH ENCAISSÉ)
    // = Total des REÇUS + Total des FACTURES PAYÉES + Acomptes sur FACTURES EN ATTENTE
    const totalCash = validDocs.reduce((acc, doc) => {
        let cashInDoc = 0;
        
        if (doc.type === 'RECU') {
            cashInDoc = parseFloat(doc.receiptAmount) || 0;
        } else if (doc.type === 'FACTURE') {
            if (doc.status === 'PAID') {
                cashInDoc = getDocAmount(doc);
            } else {
                // Si pas payé, on compte au moins l'acompte perçu
                cashInDoc = parseFloat(doc.advance) || 0;
            }
        }
        return acc + cashInDoc;
    }, 0);

    // B. RESTE À RECOUVRER (CRÉANCES)
    // = Total des FACTURES EN ATTENTE - Acomptes déjà versés
    const totalPending = validDocs
        .filter(d => d.type === 'FACTURE' && d.status === 'PENDING')
        .reduce((acc, doc) => {
            const totalTTC = getDocAmount(doc);
            const alreadyPaid = parseFloat(doc.advance) || 0;
            const reste = Math.max(0, totalTTC - alreadyPaid);
            return acc + reste;
        }, 0);

    // C. CHIFFRE D'AFFAIRES (VOLUME FACTURÉ)
    // = Somme totale de toutes les FACTURES émises (payées ou non)
    const totalRevenue = validDocs
        .filter(d => d.type === 'FACTURE')
        .reduce((acc, d) => acc + getDocAmount(d), 0);

    // --- 4. ACTIVITÉ RÉCENTE ---
    const recentDocs = [...validDocs].reverse().slice(0, 5);

    return (
        <div className="h-full bg-gray-100 p-8 overflow-y-auto font-sans custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* EN-TÊTE */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-8 h-8 text-blue-600" /> Tableau de Bord
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Vue d'ensemble • {validDocs.length} document(s) enregistré(s)
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setView('editor')} 
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
                        >
                            <ArrowLeft className="w-4 h-4" /> Retour éditeur
                        </button>
                        <button 
                            onClick={() => setView('editor')} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition"
                        >
                            Nouveau <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* CASH (TRESORERIE) */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border-b-4 border-green-500">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trésorerie Réelle</p>
                            <div className="p-2 bg-green-50 rounded text-green-600"><Wallet className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-800">{formatMoney(totalCash)}</h3>
                        <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Encaissé (Cash + Banque)
                        </p>
                    </div>

                    {/* IMPAYÉS (CREANCES) */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border-b-4 border-orange-500">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reste à percevoir</p>
                            <div className="p-2 bg-orange-50 rounded text-orange-500"><AlertCircle className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-800">{formatMoney(totalPending)}</h3>
                        <p className="text-[10px] text-orange-500 font-bold mt-1">En attente de règlement</p>
                    </div>

                    {/* CA (VOLUME) */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border-b-4 border-blue-500">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Chiffre d'Affaires</p>
                            <div className="p-2 bg-blue-50 rounded text-blue-500"><CreditCard className="w-5 h-5" /></div>
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-800">{formatMoney(totalRevenue)}</h3>
                        <p className="text-[10px] text-blue-500 font-bold mt-1">Total facturé (Émis)</p>
                    </div>
                </div>

                {/* LISTES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* ACTIVITÉ RÉCENTE */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h4 className="font-bold text-gray-700 text-xs uppercase flex items-center gap-2">
                                Activité Récente
                            </h4>
                            <button onClick={() => setView('history')} className="text-xs text-blue-600 font-bold hover:underline">Voir tout l'historique</button>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {recentDocs.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">Aucun document récent.</div>
                            ) : (
                                recentDocs.map((doc, idx) => {
                                    const clientName = doc.recipient?.name || 'Client Inconnu';
                                    const dateStr = doc.date ? new Date(doc.date).toLocaleDateString() : '-';
                                    
                                    // Calcul sécurisé pour l'affichage
                                    const docTotal = getDocAmount(doc);
                                    let amountDisplay = formatMoney(docTotal);
                                    if (doc.type === 'RECU') amountDisplay = "+" + amountDisplay;

                                    const isPaid = doc.status === 'PAID' || doc.type === 'RECU';
                                    const isRecu = doc.type === 'RECU';
                                    const isDevis = doc.type === 'DEVIS';
                                    
                                    // Détection d'acompte sur facture non payée
                                    const hasAdvance = !isRecu && !isDevis && doc.status === 'PENDING' && (parseFloat(doc.advance) > 0);

                                    return (
                                        <div key={doc.docId || idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-[10px] text-white ${isRecu ? 'bg-green-500' : (isDevis ? 'bg-gray-400' : 'bg-blue-600')}`}>
                                                    {isRecu ? 'RC' : (isDevis ? 'DV' : 'FA')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-800">{clientName}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-gray-500">N° {doc.number}</span>
                                                        <span className="text-[10px] text-gray-400">• {dateStr}</span>
                                                        {hasAdvance && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 rounded font-bold">Avance reçue</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-mono font-bold text-slate-700">{amountDisplay}</p>
                                                <div className={`text-[9px] font-bold inline-flex items-center gap-1 ${isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                                                    {isPaid ? <CheckSquare className="w-3 h-3"/> : <Square className="w-3 h-3"/>}
                                                    {isPaid ? 'PAYÉ' : 'EN ATTENTE'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* LISTE CLIENTS RAPIDE */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-700 text-xs uppercase flex items-center gap-2">
                                <User className="w-4 h-4" /> Clients
                            </h4>
                            <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full">{clients.length}</span>
                        </div>
                        <div className="space-y-3">
                            {clients.slice(0, 5).map((client, idx) => (
                                <div key={client.id || idx} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded hover:bg-blue-50 transition-colors">
                                    <span className="text-gray-700 font-bold truncate w-2/3" title={client.name}>{client.name}</span>
                                    {client.phone && <span className="text-xs text-gray-400">{client.phone}</span>}
                                </div>
                            ))}
                            {clients.length === 0 && <p className="text-xs text-gray-400 italic">Aucun client enregistré.</p>}
                        </div>
                        <button onClick={() => setView('clients')} className="mt-6 w-full py-2 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-bold transition">
                            Gérer la liste clients
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}