import React from 'react';
import { Building2, Smartphone } from 'lucide-react';

export default function InvoicePreview({ invoice, formatMoney, subtotal, taxAmount, total }) {
  // Style pour forcer l'impression exacte des couleurs (Chrome/Edge)
  const forcePrintStyle = { printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' };

  // --- CALCULS ---
  const advance = invoice.advance || 0; 
  const balanceDue = total - advance;   

  return (
    <div className="w-full lg:w-7/12 h-full bg-slate-700/90 overflow-y-auto p-4 md:p-8 flex justify-center items-start shadow-inner print-reset-wrapper">
      
      {/* WRAPPER DU ZOOM (ÉCRAN) */}
      <div className="scale-[0.8] lg:scale-95 origin-top transition-transform print:scale-100 print:shadow-none print:m-0 print:w-full">
        
        {/* CONTENU PDF (ID invoice-content) */}
        <div id="invoice-content" className="bg-white shadow-2xl w-[21cm] min-h-[29.7cm] relative flex flex-col p-12 text-sm text-gray-800 font-serif leading-relaxed">
            
            {/* ================= EN-TÊTE ================= */}
            <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8 gap-6">
                <div className="flex-1">
                    {invoice.sender.logo ? 
                        (<div className="w-32 h-20 mb-4 flex items-center justify-start overflow-hidden"><img src={invoice.sender.logo} alt="Logo" className="max-w-full max-h-full object-contain" /></div>) : 
                        (<div className="w-16 h-16 bg-blue-600 flex items-center justify-center text-white mb-4 shadow-sm rounded-sm" style={forcePrintStyle}><Building2 className="w-8 h-8" /></div>)
                    }
                    <h2 className="text-xl font-bold uppercase text-gray-900 leading-tight">{invoice.sender.name || "VOTRE ENTREPRISE"}</h2>
                    <p className="font-semibold text-gray-500 text-[11px] mb-2">{invoice.sender.legalForm}</p>
                    <div className="text-[11px] text-gray-600 space-y-0.5 font-sans">
                        <p>{invoice.sender.address}</p>
                        <p>{invoice.sender.zip} {invoice.sender.city}</p>
                        <p>Tél: {invoice.sender.phone}</p>
                        <p>Email: {invoice.sender.email}</p>
                    </div>
                </div>

                {/* QR CODE (REÇU UNIQUEMENT) */}
                {invoice.type === 'RECU' && invoice.receiptQrCode && (
                    <div className="flex flex-col items-center justify-center pt-2 px-2">
                        <div className="bg-white p-1 border border-gray-200 shadow-sm rounded-sm">
                            <img src={invoice.receiptQrCode} alt="QR" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                        </div>
                    </div>
                )}

                {/* INFO DOCUMENT (Droite) */}
                <div className="flex-1 text-right flex flex-col items-end">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">{invoice.type}</h1>
                    <p className="text-lg text-gray-600 font-sans">N° {invoice.number}</p>
                    <p className="text-sm text-gray-500 mt-1 font-sans">Date: {new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
                    
                    {/* Correction Header (Alignement NCC/RCCM Grid) */}
                    <div className="mt-6 w-full flex justify-end">
                        <div className="bg-gray-50 border-r-4 border-blue-500 pr-4 py-2 text-xs min-w-[160px]" style={forcePrintStyle}>
                            <div className="grid grid-cols-[auto_auto] justify-end gap-x-3 gap-y-1 text-right items-center">
                                <span className="font-bold text-gray-700 uppercase">NCC :</span>
                                <span className="font-mono font-bold text-gray-900">{invoice.sender.ncc || '-'}</span>

                                <span className="font-bold text-gray-700 uppercase">RCCM :</span>
                                <span className="font-mono font-bold text-gray-900">{invoice.sender.rccm || '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= CORPS DU DOCUMENT ================= */}
            
            {/* CAS 1 : REÇU (Mise en page CÔTE À CÔTE) */}
            {invoice.type === 'RECU' ? (
                <div className="mb-8 flex flex-row justify-between items-stretch gap-6">
                    
                    {/* BLOC CLIENT (Gauche - 60%) */}
                    <div className="flex-1 border border-gray-200 shadow-sm p-5 rounded-md bg-white flex flex-col justify-center">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Reçu de</p>
                        <h3 className="text-lg font-bold uppercase text-gray-800 leading-tight mb-2">{invoice.recipient.name || "NOM DU CLIENT"}</h3>
                        <div className="text-sm text-gray-600 font-sans">
                            {invoice.recipient.phone && <div className="font-bold text-gray-800 mb-1">Tél: {invoice.recipient.phone}</div>}
                            <div>{invoice.recipient.city} {invoice.recipient.address}</div>
                        </div>
                    </div>

                    {/* BLOC MONTANT (Droite - 40%) */}
                    <div className="w-5/12 flex flex-col">
                         <div className="bg-blue-600 text-white p-5 rounded-md shadow-md flex flex-col items-center justify-center text-center h-full" style={forcePrintStyle}>
                             <span className="font-bold text-xs uppercase opacity-80 mb-2">Montant Perçu</span>
                             <span className="font-mono font-bold text-2xl whitespace-nowrap">
                                {invoice.receiptAmount || '0 FCFA'}
                             </span>
                         </div>
                    </div>
                </div>
            ) : (
                /* CAS 2 : FACTURE / DEVIS (Mise en page STANDARD EMPILÉE) */
                <div className="mb-10 flex justify-end">
                    <div className="w-3/5 border border-gray-200 shadow-sm p-5 rounded-md bg-white">
                        <p className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">Facturé à</p>
                        <h3 className="text-lg font-bold uppercase text-gray-800 leading-tight">{invoice.recipient.name || "NOM DU CLIENT"}</h3>
                        <div className="text-sm text-gray-600 mt-1 font-sans space-y-0.5">
                            <p>{invoice.recipient.address} {invoice.recipient.city}</p>
                            {invoice.recipient.phone && <p className="font-bold text-gray-800">Tél: {invoice.recipient.phone}</p>}
                        </div>
                        {invoice.recipient.ncc && <div className="mt-3 pt-2 border-t border-gray-100"><span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded" style={forcePrintStyle}>NCC: {invoice.recipient.ncc}</span></div>}
                    </div>
                </div>
            )}

            {/* TABLEAU DES ARTICLES (Pour Facture/Devis seulement) */}
            {invoice.type !== 'RECU' && (
                <div className="mb-8">
                    <table className="w-full border-collapse font-sans">
                        <thead>
                            <tr className="bg-gray-800 text-white text-xs uppercase tracking-wider" style={forcePrintStyle}>
                                <th className="py-3 px-3 text-left w-1/2 rounded-tl-sm">Désignation</th>
                                <th className="py-3 px-3 text-center">Qté</th>
                                <th className="py-3 px-3 text-right">P.U.</th>
                                <th className="py-3 px-3 text-right rounded-tr-sm">Total {invoice.hasTax ? 'HT' : ''}</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {invoice.items.map((item, index) => (
                            <tr key={item.id} className={index % 2 === 0 ? "border-b border-gray-100" : "border-b border-gray-100 bg-gray-50"} style={index % 2 !== 0 ? forcePrintStyle : {}}>
                                <td className="py-3 px-3 text-gray-700">{item.description}</td>
                                <td className="py-3 px-3 text-center text-gray-600">{item.quantity}</td>
                                <td className="py-3 px-3 text-right font-mono text-gray-600">{formatMoney(item.price).replace('FCFA', '')}</td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-gray-800">{formatMoney(item.quantity * item.price).replace('FCFA', '')}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TOTAUX (Pour Facture/Devis seulement) */}
            {invoice.type !== 'RECU' && (
                <div className="flex justify-end mb-8 font-sans break-inside-avoid">
                    <div className="w-5/12 space-y-2">
                        {invoice.hasTax && (
                            <>
                                <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1 px-1">
                                    <span className="text-xs uppercase">Total HT</span>
                                    <span className="font-mono font-medium">{formatMoney(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-1 px-1">
                                    <span className="text-xs uppercase">TVA ({invoice.taxRate}%)</span>
                                    <span className="font-mono font-medium">{formatMoney(taxAmount)}</span>
                                </div>
                            </>
                        )}
                        {advance > 0 && (
                            <>
                                <div className="flex justify-between text-gray-800 font-bold border-t border-gray-200 pt-2 px-1">
                                    <span className="text-xs uppercase">Total Général</span>
                                    <span className="font-mono">{formatMoney(total)}</span>
                                </div>
                                <div className="flex justify-between text-green-600 px-1 bg-green-50/50 rounded" style={forcePrintStyle}>
                                    <span className="text-xs uppercase font-bold flex items-center gap-1">Avance Reçue</span>
                                    <span className="font-mono font-bold">- {formatMoney(advance)}</span>
                                </div>
                            </>
                        )}
                        <div className={`flex justify-between items-center text-white p-3 rounded shadow-md mt-2 ${advance > 0 && balanceDue <= 0 ? 'bg-green-600' : 'bg-blue-600'}`} style={forcePrintStyle}>
                            <span className="font-bold text-sm uppercase">{advance > 0 ? (balanceDue <= 0 ? "Soldé" : "Reste à Payer") : "Net à Payer"}</span>
                            <span className="font-mono font-bold text-lg">{formatMoney(balanceDue > 0 ? balanceDue : 0)}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= PIED DE PAGE ================= */}
            <div className="mt-auto">
                
                {/* DÉTAILS TRANSACTION (Pour Reçu) */}
                {invoice.type === 'RECU' && (
                    <div className="mb-8 bg-blue-50/50 p-4 rounded border border-blue-100 border-l-4 border-l-blue-400 break-inside-avoid" style={forcePrintStyle}>
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 border-b border-blue-200 pb-2">Détails de la transaction</p>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-gray-600 min-w-[80px]">Référence :</span> 
                                <span className="text-gray-800 font-mono break-all">{invoice.receiptReference || '-'}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-gray-600 min-w-[80px]">Motif :</span> 
                                <span className="text-gray-800">{invoice.receiptReason || '-'}</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* SIGNATURES (Pour Reçu) */}
                {invoice.type === 'RECU' && (
                    <div className="mb-8 pt-6 border-t border-gray-200 break-inside-avoid">
                        <div className="flex justify-between gap-8 h-32">
                                <div className="w-1/2 border-2 border-gray-300 rounded-sm p-3 flex flex-col justify-between relative">
                                    <p className="text-xs font-bold text-gray-500 uppercase z-10">Signature Client</p>
                                </div>
                                <div className="w-1/2 border-2 border-gray-300 rounded-sm p-3 flex flex-col justify-between">
                                    <div><p className="text-xs font-bold text-gray-500 uppercase">Pour {invoice.sender.name || "L'ENTREPRISE"}</p><p className="text-[9px] italic text-gray-400 mt-1">"Montant perçu et validé"</p></div>
                                </div>
                        </div>
                    </div>
                )}

                {/* NOTES (Arrêté de compte pour facture) */}
                {invoice.type !== 'RECU' && <div className="mb-6 break-inside-avoid"><p className="text-xs font-bold text-gray-400 uppercase mb-1">Arrêté de compte</p><p className="text-sm italic text-gray-600 border-l-2 border-gray-300 pl-3">"{invoice.notes}"</p></div>}
                
                {/* INFO RÈGLEMENT */}
                <div className="bg-gray-50 p-3 rounded border border-gray-200 w-full text-xs font-sans break-inside-avoid" style={forcePrintStyle}>
                    <h4 className="font-bold uppercase text-gray-700 mb-2 border-b border-gray-200 pb-1">Règlement</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <p className="text-gray-500">Mode: <span className="font-bold text-gray-800">{invoice.paymentMethod}</span></p>
                        {invoice.type !== 'RECU' && <p className="text-gray-500">Échéance: <span className="font-bold text-gray-800">{new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</span></p>}
                        <p className="text-gray-500">Statut: <span className={`font-bold ${invoice.status === 'PAID' ? 'text-green-600' : 'text-red-500'}`}>{invoice.status === 'PAID' ? 'PAYÉ' : 'EN ATTENTE'}</span></p>
                    </div>
                    {invoice.paymentMethod === 'Mobile Money' && <div className="mt-2 bg-blue-50 p-2 rounded border border-blue-100 flex items-center gap-2 text-blue-800" style={forcePrintStyle}><Smartphone className="w-4 h-4" /><span className="font-bold">{invoice.mobileMoneyInfo}</span></div>}
                </div>
                
                {/* BANQUE */}
                {(invoice.sender.bankName || invoice.sender.iban) && (
                    <div className="mt-4 mb-6 text-xs bg-gray-50 border border-gray-200 p-2 rounded text-center break-inside-avoid" style={forcePrintStyle}>
                        <span className="font-bold text-gray-600">INFOS BANCAIRES :</span> 
                        {invoice.sender.bankName && <span className="mx-2">{invoice.sender.bankName}</span>}
                        {invoice.sender.iban && <span className="font-mono font-bold text-gray-800">{invoice.sender.iban}</span>}
                    </div>
                )}

                {/* FOOTER LÉGAL - CORRECTION: SUPPRESSION DE "BP" */}
                <div className="mt-12 pt-4 border-t border-gray-300 text-center text-[9px] text-gray-400 font-sans leading-tight pb-2">
                    <p className="font-bold text-gray-600">{invoice.sender.name} - {invoice.sender.legalForm} au capital de {invoice.sender.capital} FCFA</p>
                    {/* Ligne corrigée : Suppression de "BP {zip}" */}
                    <p>Siège Social: {invoice.sender.address} - {invoice.sender.city}</p>
                    <p>RCCM: {invoice.sender.rccm} - NCC: {invoice.sender.ncc}</p>
                    <p className="mt-2 italic">En cas de litige, seul le tribunal de commerce d'Abidjan est compétent.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}