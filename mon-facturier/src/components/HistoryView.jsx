// src/components/HistoryView.jsx
import React from 'react';
import { FolderOpen, Download, FileUp, ArrowLeft, Trash2, CheckSquare, Square, RefreshCcw, Lock } from 'lucide-react';

export default function HistoryView({ savedDocuments, setView, handleExportBackup, handleImportBackup, loadDocument, deleteDocument, toggleDocStatus, formatMoney, convertToInvoice }) {
  
  // Fonction de calcul sécurisée (identique au Dashboard pour la cohérence)
  const getDocAmount = (doc) => {
      if (doc.type === 'RECU') {
          return parseFloat(doc.receiptAmount) || 0;
      }
      // Calcul Facture/Devis
      const subtotal = doc.items.reduce((acc, item) => {
          return acc + (parseFloat(item.quantity || 0) * parseFloat(item.price || 0));
      }, 0);
      
      const taxRate = parseFloat(doc.taxRate || 0);
      return doc.hasTax ? subtotal * (1 + taxRate/100) : subtotal;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans text-gray-800">
        <nav className="bg-slate-800 text-white p-4 shadow-lg flex justify-between items-center no-print">
            <div className="flex items-center gap-3">
                <FolderOpen className="w-6 h-6 text-orange-500" />
                <h1 className="text-xl font-bold">Mes Documents</h1>
                <span className="bg-slate-700 px-2 py-0.5 rounded-full text-xs text-gray-300">{savedDocuments.length} fichiers</span>
            </div>
            
            <div className="flex items-center gap-3">
                <button onClick={handleExportBackup} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition border border-slate-600" title="Télécharger une copie de sauvegarde">
                    <Download className="w-4 h-4" /> Sauvegarder
                </button>
                <label className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-md text-xs font-bold transition cursor-pointer border border-slate-600">
                    <FileUp className="w-4 h-4" /> Importer
                    <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
                </label>
                <div className="h-6 w-px bg-slate-600 mx-2"></div>
                <button onClick={() => setView('editor')} className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-bold transition">
                    <ArrowLeft className="w-4 h-4" /> Retour Éditeur
                </button>
            </div>
        </nav>

        <div className="p-8 max-w-6xl mx-auto w-full overflow-y-auto">
            {savedDocuments.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm border border-gray-200">
                    <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-600">Votre dossier est vide</h3>
                    <p className="text-gray-400 mb-6">Aucun document n'a encore été sauvegardé.</p>
                    <button onClick={() => setView('editor')} className="bg-slate-800 text-white px-6 py-2 rounded-full font-bold hover:bg-slate-900 transition">Créer un document</button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                            <tr>
                                <th className="p-4 border-b">Statut</th>
                                <th className="p-4 border-b">Date</th>
                                <th className="p-4 border-b">Type</th>
                                <th className="p-4 border-b">Numéro</th>
                                <th className="p-4 border-b">Client</th>
                                <th className="p-4 border-b text-right">Montant Total</th>
                                <th className="p-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {savedDocuments.slice().reverse().map((doc) => {
                                const amount = getDocAmount(doc);
                                const isRecu = doc.type === 'RECU';
                                const hasAdvance = !isRecu && parseFloat(doc.advance) > 0;

                                return (
                                    <tr key={doc.docId} onClick={() => loadDocument(doc)} className="border-b hover:bg-orange-50 cursor-pointer transition group">
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            {/* LOGIQUE CORRIGÉE : Si c'est un RECU, on affiche un cadenas et on empêche le clic */}
                                            {isRecu ? (
                                                <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed opacity-80">
                                                    <Lock className="w-3 h-3" /> PAYÉ (Reçu)
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={(e) => toggleDocStatus(doc.docId, e)} 
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${doc.status === 'PAID' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                                                >
                                                    {doc.status === 'PAID' ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                                                    {doc.status === 'PAID' ? 'PAYÉ' : 'EN ATTENTE'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(doc.date).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${doc.type === 'FACTURE' ? 'bg-blue-100 text-blue-700' : doc.type === 'RECU' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                {doc.type}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-sm font-bold text-slate-700">
                                            {doc.number || '-'}
                                        </td>
                                        <td className="p-4 font-bold text-gray-800">
                                            {doc.recipient.name || 'Sans nom'}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="font-mono font-bold text-slate-700">{formatMoney(amount)}</div>
                                            {/* Affichage discret de l'acompte si présent */}
                                            {hasAdvance && doc.status !== 'PAID' && (
                                                <div className="text-[10px] text-green-600 font-bold">
                                                    dont avance: {formatMoney(parseFloat(doc.advance))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-2">
                                                {/* BOUTON CONVERTIR DEVIS -> FACTURE */}
                                                {doc.type === 'DEVIS' && (
                                                    <button 
                                                        onClick={(e) => convertToInvoice(doc, e)} 
                                                        className="p-2 text-blue-500 hover:text-white hover:bg-blue-600 rounded-full transition" 
                                                        title="Convertir ce devis en Facture"
                                                    >
                                                        <RefreshCcw className="w-4 h-4" />
                                                    </button>
                                                )}
                                                
                                                <button onClick={(e) => deleteDocument(doc.docId, e)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition" title="Supprimer">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
}