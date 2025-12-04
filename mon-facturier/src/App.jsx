import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, FolderOpen, FileEdit, Users, LayoutDashboard, Settings, Package, FileDown } from 'lucide-react';
import html2pdf from 'html2pdf.js'; // Import nécessaire pour le PDF navigateur

import HistoryView from './components/HistoryView';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import ClientList from './components/ClientList';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import ProductList from './components/ProductList';
import { storage } from './services/storage';

export default function App() {
  // --- NAVIGATION & DONNÉES GLOBALES ---
  const [view, setView] = useState('editor'); 
  const [savedDocuments, setSavedDocuments] = useState([]); 
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]); 
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [appReady, setAppReady] = useState(false);

  // --- UTILITAIRE DATE LOCALE (Corrige le bug de décalage horaire) ---
  const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  // --- ÉTAT DU DOCUMENT EN COURS ---
  const [invoice, setInvoice] = useState({
    docId: null, type: 'FACTURE', number: '', status: 'PENDING', 
    date: getLocalDate(), 
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    hasTax: true, taxRate: 18, 
    sender: { name: '', legalForm: '', capital: '', address: '', zip: '', city: '', email: '', phone: '', ncc: '', rccm: '', logo: null },
    recipient: { name: '', ncc: '', address: '', city: '', email: '', phone: '' },
    items: [ { id: 1, description: '', quantity: 1, price: 0 } ],
    paymentMethod: 'Virement', mobileMoneyInfo: '',
    receiptReference: '', receiptReason: '', receiptAmount: '', receiptQrCode: null,
    notes: ''
  });

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const initData = async () => {
        try {
            const docs = await storage.get('invoiceDB') || [];
            setSavedDocuments(docs);
            const cli = await storage.get('clientDB') || [];
            setClients(cli);
            const prod = await storage.get('productDB') || [];
            setProducts(prod);

            // Charger le brouillon précédent s'il existe
            const draft = await storage.get('currentDraft');
            if (draft) {
                setInvoice(draft);
            } else {
                // Sinon, initialiser un nouveau document
                const profile = await storage.get('companyProfile');
                const defaultSender = profile || invoice.sender;
                const initialType = 'FACTURE';
                const nextNum = generateNextNumber(initialType, docs);
                setInvoice(prev => ({
                    ...prev, docId: Date.now(), type: initialType, number: nextNum, status: 'PENDING', sender: defaultSender
                }));
            }
        } catch (e) {
            console.error("Erreur chargement données:", e);
        }
        setAppReady(true);
    };
    initData();
  }, []);

  // --- AUTO-SAVE (Sauvegarde automatique du brouillon) ---
  useEffect(() => {
    if (!appReady) return;
    const autoSaveTimer = setTimeout(() => {
        storage.save('currentDraft', invoice);
    }, 800); // Sauvegarde 0.8s après la dernière modification
    return () => clearTimeout(autoSaveTimer);
  }, [invoice, appReady]);

  // --- LOGIQUE MÉTIER ---
  const generateNextNumber = (type, docsList = savedDocuments) => {
      const prefixMap = { 'FACTURE': 'FAC', 'DEVIS': 'DEV', 'RECU': 'REC' };
      const prefix = prefixMap[type] || 'DOC';
      const year = new Date().getFullYear();
      const pattern = `${prefix}-${year}-`;
      const relevantDocs = docsList.filter(d => d.type === type && d.number && d.number.startsWith(pattern));

      if (relevantDocs.length === 0) return `${pattern}001`;
      const existingNumbers = relevantDocs.map(d => {
          const parts = d.number.split('-'); 
          return parseInt(parts[parts.length - 1]); 
      }).filter(n => !isNaN(n));
      const maxNum = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0;
      return `${pattern}${(maxNum + 1).toString().padStart(3, '0')}`;
  };

  const formatMoney = (amount) => new Intl.NumberFormat('fr-CI', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(amount).replace('XOF', 'FCFA');

  // --- SAUVEGARDE DANS L'HISTORIQUE ---
  const handleSave = async () => {
    let newDocId = invoice.docId;
    if (!newDocId) { newDocId = Date.now(); }

    const docToSave = { ...invoice, docId: newDocId, lastModified: new Date().toISOString() };
    setInvoice(docToSave);

    const updatedDocs = [...savedDocuments];
    const existingIndex = updatedDocs.findIndex(d => d.docId === newDocId);
    
    if (existingIndex >= 0) { 
        updatedDocs[existingIndex] = docToSave; 
    } else { 
        updatedDocs.push(docToSave); 
    }

    setSavedDocuments(updatedDocs);
    await storage.save('invoiceDB', updatedDocs);
    
    setShowSavedMessage(true);
    setTimeout(() => setShowSavedMessage(false), 3000);
  };

  // --- TÉLÉCHARGEMENT PDF (Compatible Web & Electron) ---
  const handleDownload = async () => {
      await handleSave(); // On assure la sauvegarde avant
      
      const fileName = `${invoice.type}_${invoice.number}.pdf`;
      
      // CAS ELECTRON
      if (window.electronAPI) {
          const result = await window.electronAPI.exportToPDF(fileName);
          if (result.success) {
              alert(`✅ Document téléchargé !\n\n${result.path}`);
          } else if (result.reason !== 'canceled') {
              alert("❌ Erreur technique lors du téléchargement.");
          }
      } 
      // CAS NAVIGATEUR (WEB)
      else {
          const element = document.getElementById('invoice-content');
          if (!element) return alert("Erreur : Impossible de trouver le document à imprimer.");

          const opt = {
            margin:       0,
            filename:     fileName,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, letterRendering: true }, 
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
          };

          html2pdf().set(opt).from(element).save();
      }
  };

  // --- GESTION DES DOCUMENTS ---
  const handleNew = async () => {
    if (confirm("Créer un nouveau document vierge ? (Le document actuel est sauvegardé)")) {
        const savedProfile = await storage.get('companyProfile');
        const defaultSender = savedProfile || { name: '', legalForm: '', capital: '', address: '', zip: '', city: '', email: '', phone: '', ncc: '', rccm: '', logo: null };
        const nextNum = generateNextNumber('FACTURE');
        
        const newDoc = {
            docId: Date.now(), 
            type: 'FACTURE', 
            number: nextNum, 
            status: 'PENDING',
            date: getLocalDate(),
            dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            hasTax: true, 
            taxRate: 18, 
            sender: defaultSender, 
            recipient: { name: '', ncc: '', address: '', city: '', email: '', phone: '' },
            items: [{ id: 1, description: '', quantity: 1, price: 0 }],
            paymentMethod: 'Virement', mobileMoneyInfo: '',
            receiptReference: '', receiptReason: '', receiptAmount: '', receiptQrCode: null,
            notes: 'Arrêté la présente facture à la somme indiquée ci-dessous.'
        };
        setInvoice(newDoc);
        setView('editor');
    }
  };

  const loadDocument = async (doc) => {
      setInvoice(doc);
      setView('editor');
  };

  const deleteDocument = async (id, e) => {
      e.stopPropagation();
      if (confirm("Supprimer ce document de l'historique ?")) {
          const updatedDocs = savedDocuments.filter(d => d.docId !== id);
          setSavedDocuments(updatedDocs);
          await storage.save('invoiceDB', updatedDocs);
          
          // Si on supprime le doc en cours, on réinitialise
          if (invoice.docId === id) {
             const nextNum = generateNextNumber('FACTURE', updatedDocs);
             setInvoice(prev => ({...prev, docId: Date.now(), number: nextNum, status: 'PENDING'}));
          }
      }
  };

  const toggleDocStatus = async (id, e) => {
      e.stopPropagation();
      const updatedDocs = savedDocuments.map(doc => {
          if (doc.docId === id) { return { ...doc, status: doc.status === 'PAID' ? 'PENDING' : 'PAID' }; }
          return doc;
      });
      setSavedDocuments(updatedDocs);
      await storage.save('invoiceDB', updatedDocs);
      
      if (invoice.docId === id) { 
          setInvoice(prev => ({ ...prev, status: prev.status === 'PAID' ? 'PENDING' : 'PAID' })); 
      }
  };

  const convertToInvoice = async (doc, e) => {
    e.stopPropagation();
    if(confirm(`Convertir le Devis N° ${doc.number} en Facture ?`)) {
        const savedProfile = await storage.get('companyProfile');
        const defaultSender = savedProfile || doc.sender;
        const nextNum = generateNextNumber('FACTURE');
        
        const newDoc = {
            ...doc, 
            docId: Date.now(), 
            type: 'FACTURE', 
            number: nextNum,
            sender: defaultSender, 
            date: getLocalDate(),
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'PENDING',
            notes: 'Arrêté la présente facture à la somme indiquée ci-dessous.'
        };
        
        setInvoice(newDoc);
        
        // Marquer l'ancien devis comme traité/payé
        const updatedDocs = savedDocuments.map(d => d.docId === doc.docId ? {...d, status: 'PAID'} : d);
        setSavedDocuments(updatedDocs);
        await storage.save('invoiceDB', updatedDocs);
        
        alert(`Devis converti ! Nouvelle Facture N° ${nextNum} créée.`);
        setView('editor');
    }
  };

  const handleProfileUpdate = async (newProfile) => {
      setInvoice(prev => ({ ...prev, sender: newProfile }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInvoice(prev => ({ ...prev, sender: { ...prev.sender, logo: reader.result } }));
      reader.readAsDataURL(file);
    }
  };

  const handleQrCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setInvoice(prev => ({ ...prev, receiptQrCode: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleTypeChange = (newType) => {
    const nextNum = generateNextNumber(newType);
    let updates = { type: newType, number: nextNum };
    
    if (newType === 'RECU') {
      updates.hasTax = false; updates.status = 'PAID'; updates.notes = ''; 
      updates.receiptReference = ''; updates.receiptReason = ''; updates.receiptAmount = '';
    } else if (newType === 'DEVIS') {
      updates.hasTax = true; updates.status = 'PENDING'; updates.notes = 'Validité de l\'offre : 30 jours.';
    } else {
      updates.hasTax = true; updates.status = 'PENDING'; updates.notes = 'Arrêté la présente facture à la somme indiquée ci-dessous.';
    }
    setInvoice({ ...invoice, ...updates });
  };

  const refreshNumber = () => setInvoice({...invoice, number: generateNextNumber(invoice.type)});

  const subtotal = invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const taxAmount = invoice.hasTax ? (subtotal * invoice.taxRate) / 100 : 0;
  const total = subtotal + taxAmount; 

  const handleExportBackup = () => {
      const backupData = { invoices: savedDocuments, clients: clients, products: products };
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facturier_backup_${getLocalDate()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleImportBackup = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const data = JSON.parse(event.target.result);
              const importedDocs = Array.isArray(data) ? data : (data.invoices || []);
              const importedClients = data.clients || [];
              const importedProducts = data.products || [];

              if (confirm(`Importer ${importedDocs.length} documents, ${importedClients.length} clients et ${importedProducts.length} produits ?`)) {
                  const docMap = new Map(savedDocuments.map(d => [d.docId, d]));
                  importedDocs.forEach(d => docMap.set(d.docId, d));
                  const newDocs = Array.from(docMap.values());
                  
                  setSavedDocuments(newDocs);
                  await storage.save('invoiceDB', newDocs);
                  
                  if(importedClients.length > 0) {
                      setClients(importedClients);
                      await storage.save('clientDB', importedClients);
                  }
                  if(importedProducts.length > 0) {
                      setProducts(importedProducts);
                      await storage.save('productDB', importedProducts);
                  }
                  alert("Importation réussie !");
              }
          } catch (err) { alert("Erreur de lecture."); }
      };
      reader.readAsText(file);
      e.target.value = ''; 
  };

  // --- RENDU UI ---
  if (!appReady) return <div className="h-screen flex items-center justify-center text-blue-600 font-bold animate-pulse">Chargement...</div>;

  if (view === 'settings') {
    return <SettingsView setView={setView} onProfileUpdate={handleProfileUpdate} showNotification={(msg) => { setShowSavedMessage(true); setTimeout(() => setShowSavedMessage(false), 3000); alert(msg); }} />;
  }
  if (view === 'clients') return <ClientList clients={clients} setClients={setClients} setView={setView} />;
  if (view === 'products') return <ProductList products={products} setProducts={setProducts} setView={setView} formatMoney={formatMoney} />;
  if (view === 'dashboard') {
    return <DashboardView savedDocuments={savedDocuments} clients={clients} formatMoney={formatMoney} setView={setView} />;
  }
  if (view === 'history') {
      return <HistoryView savedDocuments={savedDocuments} setView={setView} handleExportBackup={handleExportBackup} handleImportBackup={handleImportBackup} loadDocument={loadDocument} deleteDocument={deleteDocument} toggleDocStatus={toggleDocStatus} formatMoney={formatMoney} convertToInvoice={convertToInvoice} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 font-sans text-gray-800 overflow-hidden">
      {/* =================================================================================
         FIX CSS POUR IMPRESSION ELECTRON (CORRIGÉ) 
         Ce bloc style réinitialise totalement la page pour l'export PDF
         =================================================================================
      */}
      <style>{`
        @media print {
          /* 1. Cacher l'interface inutile */
          .no-print, nav, .form-section { display: none !important; }
          
          /* 2. Réinitialiser la page globale */
          html, body, #root { 
            background: white !important; 
            margin: 0 !important; 
            padding: 0 !important; 
            height: 100% !important; 
            overflow: hidden !important; 
          }

          /* 3. CIBLAGE PRÉCIS DU CONTENEUR DE L'APERÇU */
          /* On écrase les styles "flex", "padding" et "bg-slate-700" de l'app */
          .print-reset-wrapper {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            display: block !important; /* Désactive le Flexbox qui centre le document */
            z-index: 9999 !important;
          }

          /* 4. Réinitialiser le zoom de l'aperçu */
          .print-reset-wrapper > div {
            transform: none !important; /* Enlève le scale-95 */
            margin: 0 !important;
            width: 100% !important;
          }

          /* 5. S'assurer que le contenu facture colle aux bords */
          #invoice-content {
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
          }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="no-print bg-blue-600 text-white p-3 shadow-lg z-50 flex-shrink-0">
        <div className="flex items-center justify-between w-full px-4 gap-4 overflow-x-auto">
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white p-1.5 rounded-lg shadow-md flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div className="shrink-0"><h1 className="text-lg font-bold tracking-tight">Facturier CI</h1><span className="text-xs text-blue-100 font-light flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Sécurisé</span></div>
          </div>
          
          <div className="h-8 w-px bg-blue-500/50 mx-2 shrink-0"></div>
          
          <div className="flex gap-2 shrink-0">
            <button onClick={() => setView('dashboard')} className="flex items-center gap-2 bg-blue-800 text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-blue-900 transition whitespace-nowrap border border-blue-500/30"><LayoutDashboard className="w-4 h-4" /> Tableau</button>
            <button onClick={() => setView('clients')} className="flex items-center gap-2 bg-blue-800/50 text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-blue-800 transition whitespace-nowrap border border-blue-500/30"><Users className="w-4 h-4" /> Clients</button>
            <button onClick={() => setView('products')} className="flex items-center gap-2 bg-blue-800/50 text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-blue-800 transition whitespace-nowrap border border-blue-500/30"><Package className="w-4 h-4" /> Produits</button>
            <button onClick={() => setView('history')} className="flex items-center gap-2 bg-blue-800 text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-blue-900 transition whitespace-nowrap"><FolderOpen className="w-4 h-4" /> Docs</button>
          </div>
          
          <div className="flex gap-2 items-center shrink-0 ml-auto">
             {showSavedMessage && <span className="flex items-center gap-1 text-xs font-bold text-green-300 animate-pulse mr-2 whitespace-nowrap"><CheckCircle className="w-4 h-4" /> Sauvé</span>}
            <button onClick={handleNew} className="flex items-center gap-2 bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-blue-800 transition whitespace-nowrap"><FileEdit className="w-4 h-4" /> Nouveau</button>
            <button onClick={handleSave} className="flex items-center gap-2 bg-white text-blue-700 px-3 py-1.5 rounded-md font-bold text-sm hover:bg-blue-50 transition shadow-sm whitespace-nowrap" title="Sauvegarder"><Save className="w-4 h-4" /> Sauver</button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md font-bold text-sm hover:bg-red-700 transition shadow-sm whitespace-nowrap"><FileDown className="w-4 h-4" /> TÉLÉCHARGER</button>
            <button onClick={() => setView('settings')} className="flex items-center gap-2 bg-blue-900 text-white px-3 py-1.5 rounded-md font-medium text-sm hover:bg-black transition border border-blue-500/30 ml-2 whitespace-nowrap" title="Paramètres"><Settings className="w-4 h-4" /> Config</button>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <InvoiceForm 
            invoice={invoice} 
            setInvoice={setInvoice} 
            handleTypeChange={handleTypeChange}
            refreshNumber={refreshNumber}
            handleLogoUpload={handleLogoUpload}
            handleQrCodeUpload={handleQrCodeUpload}
            clients={clients}
            products={products} // Passage des produits au formulaire
        />
        <InvoicePreview 
            invoice={invoice}
            formatMoney={formatMoney}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
        />
      </div>
    </div>
  );
}