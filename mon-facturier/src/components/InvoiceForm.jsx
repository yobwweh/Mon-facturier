// src/components/InvoiceForm.jsx
import React from 'react';
import { FileText, RefreshCw, Upload, X, Building2, User, Calculator, Plus, Trash2, ToggleRight, ToggleLeft, CreditCard, CheckSquare, Square, Smartphone, QrCode, Coins } from 'lucide-react';

// AJOUT DE 'products' DANS LES PROPS ICI vvv
export default function InvoiceForm({ invoice, setInvoice, handleTypeChange, refreshNumber, handleLogoUpload, handleQrCodeUpload, clients = [], products = [] }) {
  
  const updateSender = (field, value) => setInvoice(p => ({...p, sender: {...p.sender, [field]: value}}));
  const updateRecipient = (field, value) => setInvoice(p => ({...p, recipient: {...p.recipient, [field]: value}}));

  // --- GESTION INTELLIGENTE DES ARTICLES ---
  const handleItemChange = (id, field, value) => {
    setInvoice(prev => {
        const newItems = prev.items.map(item => {
            if (item.id !== id) return item;

            // Mise à jour de base
            let updatedItem = { ...item, [field]: value };

            // SI ON MODIFIE LA DESCRIPTION : On cherche si le produit existe en base
            if (field === 'description') {
                const foundProduct = products.find(p => p.description.toLowerCase() === value.toLowerCase());
                // Si trouvé, on met à jour le prix automatiquement
                if (foundProduct) {
                    updatedItem.price = foundProduct.price;
                }
            }
            
            return updatedItem;
        });
        return { ...prev, items: newItems };
    });
  };
  // -----------------------------------------

  const handleSelectClient = (e) => {
      const clientId = parseInt(e.target.value);
      if(!clientId) return;
      const client = clients.find(c => c.id === clientId);
      if(client) {
          setInvoice(p => ({
              ...p,
              recipient: {
                  ...p.recipient,
                  name: client.name,
                  ncc: client.ncc || '',
                  address: client.address || '',
                  city: client.city || '',
                  email: client.email || '',
                  phone: client.phone || ''
              }
          }));
      }
  };

  return (
    <div className="no-print w-full lg:w-5/12 h-full overflow-y-auto bg-slate-50 border-r border-gray-200 z-10 pb-20 custom-scrollbar">
      <div className="p-6 space-y-6">
        
        {/* TYPE DOCUMENT */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4" /> Type</h3>
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                {['FACTURE', 'DEVIS', 'RECU'].map(type => (
                  <button key={type} onClick={() => handleTypeChange(type)} className={`text-[10px] font-bold px-3 py-1.5 rounded-md transition-all ${invoice.type === type ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{type}</button>
                ))}
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
                 <label className="text-xs font-bold text-gray-500 mb-1 block">Numéro</label>
                <div className="relative">
                    <input type="text" value={invoice.number} onChange={(e) => setInvoice({...invoice, number: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm font-mono focus:ring-2 focus:ring-blue-200 outline-none pr-8" placeholder="Calcul automatique..." />
                    <button onClick={refreshNumber} className="absolute right-2 top-2 text-gray-400 hover:text-blue-600" title="Générer le numéro suivant"><RefreshCw className="w-4 h-4" /></button>
                </div>
             </div>
             <div><label className="text-xs font-bold text-gray-500 mb-1 block">Date</label><input type="date" value={invoice.date} onChange={(e) => setInvoice({...invoice, date: e.target.value})} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-200 outline-none" /></div>
           </div>
        </div>

        {/* VENDEUR */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Building2 className="w-4 h-4" /> Vendeur</h3>
            <div className="mb-4 flex items-center gap-4">
              <div className="relative w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
                {invoice.sender.logo ? (<><img src={invoice.sender.logo} alt="Logo" className="w-full h-full object-contain" /><button onClick={() => setInvoice(p => ({...p, sender: {...p.sender, logo: null}}))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button></>) : ( <Upload className="w-6 h-6 text-gray-300" /> )}
                {!invoice.sender.logo && <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Cliquez pour ajouter un logo" />}
              </div>
              <div className="flex-1"><p className="text-xs font-bold text-gray-600">Votre Logo</p><p className="text-[10px] text-gray-400">Format conseillé : PNG ou JPG carré.</p></div>
            </div>
            <div className="mb-3"><label className="text-[10px] text-gray-400 uppercase font-bold">Raison Sociale</label><input type="text" value={invoice.sender.name} onChange={(e) => updateSender('name', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded font-bold focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Votre Entreprise" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
               <div><label className="text-[10px] text-gray-400 uppercase font-bold">Forme</label><input type="text" value={invoice.sender.legalForm} onChange={(e) => updateSender('legalForm', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none" placeholder="SARL" /></div>
               <div><label className="text-[10px] text-gray-400 uppercase font-bold">Capital</label><input type="text" value={invoice.sender.capital} onChange={(e) => updateSender('capital', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none" placeholder="1 000 000" /></div>
            </div>
            <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-3"><p className="text-[10px] text-blue-600 font-bold uppercase mb-2">Fiscalité (DGI)</p><div className="grid grid-cols-2 gap-3"><div><label className="text-[10px] text-gray-500 font-bold">NCC</label><input type="text" value={invoice.sender.ncc} onChange={(e) => updateSender('ncc', e.target.value)} className="w-full p-1.5 text-sm border border-blue-200 rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none" /></div><div><label className="text-[10px] text-gray-500 font-bold">RCCM</label><input type="text" value={invoice.sender.rccm} onChange={(e) => updateSender('rccm', e.target.value)} className="w-full p-1.5 text-sm border border-blue-200 rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none" /></div></div></div>
            <input type="text" placeholder="Adresse complète" value={invoice.sender.address} onChange={(e) => updateSender('address', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded mb-2" />
            <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Téléphone" value={invoice.sender.phone} onChange={(e) => updateSender('phone', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded" /><input type="text" placeholder="Email" value={invoice.sender.email} onChange={(e) => updateSender('email', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded" /></div>
        </div>

        {/* CLIENT */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Client</h3>
            {clients.length > 0 && (
                <div className="mb-4 p-2 bg-blue-50 rounded border border-blue-100">
                     <label className="text-[10px] text-blue-600 font-bold uppercase mb-1 block">Sélection rapide</label>
                     <select onChange={handleSelectClient} className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none cursor-pointer">
                         <option value="">-- Choisir un client enregistré --</option>
                         {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                     </select>
                </div>
            )}
            <div className="mb-3"><label className="text-[10px] text-gray-400 uppercase font-bold">Nom / Raison Sociale</label><input type="text" value={invoice.recipient.name} onChange={(e) => updateRecipient('name', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded font-bold focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Nom du client" /></div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                 <div><label className="text-[10px] text-gray-400 uppercase font-bold">Téléphone</label><input type="text" placeholder="07 07 07 07 07" value={invoice.recipient.phone || ''} onChange={(e) => updateRecipient('phone', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none" /></div>
                 <div><label className="text-[10px] text-gray-400 uppercase font-bold">Email</label><input type="text" placeholder="client@email.com" value={invoice.recipient.email || ''} onChange={(e) => updateRecipient('email', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none" /></div>
            </div>
            {invoice.type !== 'RECU' && <div className="mb-3"><label className="text-[10px] text-gray-400 uppercase font-bold">NCC Client (Si assujetti)</label><input type="text" value={invoice.recipient.ncc} onChange={(e) => updateRecipient('ncc', e.target.value)} className="w-full p-2 text-sm border border-gray-300 bg-gray-50 rounded focus:ring-2 focus:ring-blue-200 outline-none" /></div>}
            <div className="grid grid-cols-2 gap-3"><input type="text" placeholder="Ville" value={invoice.recipient.city} onChange={(e) => updateRecipient('city', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded" /><input type="text" placeholder="Adresse" value={invoice.recipient.address} onChange={(e) => updateRecipient('address', e.target.value)} className="w-full p-2 text-sm border border-gray-300 rounded" /></div>
        </div>

        {/* ARTICLES (MODIFIÉ POUR AUTO-COMPLETE) */}
        {invoice.type !== 'RECU' && (
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2"><Calculator className="w-4 h-4" /> Articles</h3>
                <button onClick={() => setInvoice(p => ({...p, items: [...p.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]}))} className="flex items-center gap-1 text-[10px] font-bold bg-slate-800 text-white px-3 py-1.5 rounded-full hover:bg-black transition"><Plus className="w-3 h-3" /> AJOUTER</button>
              </div>

              {/* DATALIST CACHÉE QUI CONTIENT LES PRODUITS */}
              <datalist id="products-list">
                  {products.map(p => (
                      <option key={p.id} value={p.description}>{formatMoneyForOption(p.price)}</option>
                  ))}
              </datalist>

              <div className="space-y-3">
                {invoice.items.map((item) => (
                  <div key={item.id} className="flex gap-2 items-start bg-slate-50 p-2 rounded border border-gray-200 group hover:border-blue-300 transition-colors">
                    <div className="flex-grow grid gap-2">
                      {/* INPUT DESCRIPTION AVEC LISTE */}
                      <input 
                        type="text" 
                        list="products-list"
                        value={item.description} 
                        onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} 
                        className="w-full p-1.5 text-sm bg-white border border-gray-200 rounded font-medium focus:border-blue-400 outline-none" 
                        placeholder="Description article (tapez pour suggérer)" 
                        autoComplete="off"
                      />
                      <div className="flex gap-2">
                        <div className="w-20">
                            <input 
                                type="number" 
                                value={item.quantity} 
                                onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value))} 
                                className="w-full p-1.5 text-sm bg-white border border-gray-200 rounded text-center focus:border-blue-400 outline-none" 
                                placeholder="Qté" 
                            />
                        </div>
                        <div className="flex-1">
                            <input 
                                type="number" 
                                value={item.price} 
                                onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value))} 
                                className="w-full p-1.5 text-sm bg-white border border-gray-200 rounded text-right focus:border-blue-400 outline-none" 
                                placeholder="Prix" 
                            />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setInvoice(p => ({...p, items: p.items.filter(i => i.id !== item.id)}))} className="text-gray-300 hover:text-red-500 p-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setInvoice({...invoice, hasTax: !invoice.hasTax})}>
                      {invoice.hasTax ? <ToggleRight className="w-6 h-6 text-blue-600" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}<span className="text-xs font-bold text-gray-600">Appliquer TVA</span>
                  </div>
                  {invoice.hasTax && <div className="flex items-center gap-1 animate-fadeIn"><input type="number" value={invoice.taxRate} onChange={(e) => setInvoice({...invoice, taxRate: parseFloat(e.target.value)})} className="w-16 p-1 border rounded text-right font-bold text-sm" /><span className="text-sm text-gray-500">%</span></div>}
              </div>
            </div>
        )}

         {/* PAIEMENT & DETAILS */}
         <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-10">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Infos Paiement</h3>
            
            <div className="mb-4 bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Statut du document</span>
                <button onClick={() => setInvoice(p => ({...p, status: p.status === 'PAID' ? 'PENDING' : 'PAID'}))} className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                    {invoice.status === 'PAID' ? <CheckSquare className="w-3 h-3" /> : <Square className="w-3 h-3" />}
                    {invoice.status === 'PAID' ? 'PAYÉ' : 'EN ATTENTE'}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                    <label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Mode Règlement</label>
                    <select value={invoice.paymentMethod} onChange={(e) => setInvoice({...invoice, paymentMethod: e.target.value})} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none cursor-pointer"><option value="Virement">Virement Bancaire</option><option value="Chèque">Chèque</option><option value="Espèces">Espèces</option><option value="Mobile Money">Mobile Money</option></select>
                </div>
                {invoice.type !== 'RECU' && <div><label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Échéance</label><input type="date" value={invoice.dueDate} onChange={(e) => setInvoice({...invoice, dueDate: e.target.value})} className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-200 outline-none" /></div>}
            </div>
            
            {invoice.type !== 'RECU' && (
                <div className="mb-4 pt-2 border-t border-gray-100 animate-fadeIn">
                    <label className="text-[10px] text-green-600 uppercase font-bold mb-1 flex items-center gap-2">
                        <Coins className="w-3 h-3" /> Acompte / Avance reçue
                    </label>
                    <div className="relative">
                        <input type="number" placeholder="0" value={invoice.advance || ''} onChange={(e) => setInvoice({...invoice, advance: parseFloat(e.target.value) || 0})} className="w-full p-2 text-sm border border-green-200 bg-green-50/30 rounded font-bold text-green-800 focus:ring-2 focus:ring-green-200 outline-none" />
                        <span className="absolute right-3 top-2 text-xs font-bold text-green-600">FCFA</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1 italic">Indiquez ici le montant si le client a déjà payé une partie.</p>
                </div>
            )}

            {invoice.paymentMethod === 'Mobile Money' && (
                <div className="animate-fadeIn mb-3">
                    <label className="text-[10px] text-blue-600 uppercase font-bold mb-1 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Numéros de dépôt</label>
                    <input type="text" placeholder="Ex: Orange: 07.. / Wave: 05.." value={invoice.mobileMoneyInfo} onChange={(e) => setInvoice({...invoice, mobileMoneyInfo: e.target.value})} className="w-full p-2 text-sm border border-blue-300 bg-blue-50/50 rounded focus:ring-2 focus:ring-blue-200 outline-none" />
                </div>
            )}
            
            {invoice.type === 'RECU' && (
                <div className="mb-3 animate-fadeIn bg-blue-50 p-3 rounded border border-blue-200 space-y-4">
                    <div className="border border-blue-200 bg-white p-3 rounded text-center">
                        <label className="text-[10px] text-blue-800 font-bold uppercase mb-2 flex items-center justify-center gap-1"><QrCode className="w-3 h-3" /> Insérer QR Code</label>
                        <div className="relative w-24 h-24 mx-auto bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors group">
                            {invoice.receiptQrCode ? (<><img src={invoice.receiptQrCode} alt="QR" className="w-full h-full object-contain" /><button onClick={() => setInvoice(p => ({...p, receiptQrCode: null}))} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button></>) : (<Upload className="w-6 h-6 text-gray-300" />)}
                            {!invoice.receiptQrCode && <input type="file" accept="image/*" onChange={handleQrCodeUpload} className="absolute inset-0 opacity-0 cursor-pointer" title="Cliquez pour ajouter un QR Code" />}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] text-blue-800 font-bold uppercase mb-2 border-b border-blue-200 pb-1">Détails du Paiement</h4>
                        <div className="mb-2"><label className="text-[10px] text-gray-500 font-bold block mb-1">* Référence du paiement</label><input type="text" placeholder="Ex: RECU-001 / Lot 45 / Client ABC..." value={invoice.receiptReference} onChange={(e) => setInvoice({...invoice, receiptReference: e.target.value})} className="w-full p-2 text-sm border border-blue-200 rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none"/></div>
                        <div className="mb-2"><label className="text-[10px] text-gray-500 font-bold block mb-1">* Motif du paiement</label><input type="text" placeholder="Ex: Avance sur travaux, Solde..." value={invoice.receiptReason} onChange={(e) => setInvoice({...invoice, receiptReason: e.target.value})} className="w-full p-2 text-sm border border-blue-200 rounded bg-white focus:ring-2 focus:ring-blue-200 outline-none"/></div>
                        <div><label className="text-[10px] text-gray-500 font-bold block mb-1">* Montant Payé</label><input type="text" placeholder="Ex: 500 000 FCFA" value={invoice.receiptAmount} onChange={(e) => setInvoice({...invoice, receiptAmount: e.target.value})} className="w-full p-2 text-sm border border-blue-200 rounded bg-white font-bold text-blue-800 focus:ring-2 focus:ring-blue-200 outline-none"/></div>
                    </div>
                </div>
            )}
            <div className="mt-3"><label className="text-[10px] text-gray-400 uppercase font-bold mb-1 block">Notes / Arrêté</label><textarea value={invoice.notes} onChange={(e) => setInvoice({...invoice, notes: e.target.value})} className="w-full p-2 text-sm border border-gray-300 rounded h-16 resize-none focus:ring-2 focus:ring-blue-200 outline-none" /></div>
         </div>
      </div>
    </div>
  );
}

// Petite fonction utilitaire pour l'affichage propre dans la liste
const formatMoneyForOption = (amount) => {
    return new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount).replace('XOF', 'FCFA');
};