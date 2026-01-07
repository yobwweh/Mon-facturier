Mon Facturier CI
Mon Facturier CI est une application Desktop moderne et performante conçue pour simplifier la gestion de la facturation pour les petites et moyennes entreprises en Côte d'Ivoire. Elle permet de créer, gérer et exporter des factures, devis et reçus avec une interface utilisateur fluide et intuitive.

Bâtie avec Electron et React, l'application fonctionne entièrement hors-ligne grâce à une base de données locale, garantissant la sécurité et la disponibilité de vos données à tout moment.

(N'oublie pas d'ajouter une vraie capture d'écran dans ton repo et de changer ce lien !)

 Fonctionnalités Clés
 Gestion complète des documents : Créez des Factures, Devis et Reçus professionnels en quelques clics.
 Gestion Clients : Enregistrez, modifiez et retrouvez facilement vos clients.
Catalogue Produits & Services : Gérez une base de données de vos articles pour une saisie rapide.
Export PDF Instantané : Génération de documents PDF propres et conformes, prêts à être imprimés ou partagés.
Tableau de Bord : Vue d'ensemble de votre activité avec des indicateurs clairs.
Mode Hors-ligne : Toutes les données sont stockées localement (SQLite), aucune connexion internet requise.
Personnalisation :
Profil de l'entreprise complet (Logo, NCC, RCCM, Coordonnées).
Mode Sombre / Mode Clair (Thèmes Winter et Night).
Sauvegarde Automatique : Ne perdez jamais votre travail en cours grâce à l'auto-save des brouillons.    
Technologies Utilisées
Ce projet repose sur une stack technique moderne et robuste :

Frontend : React + Vite
Wrapper Desktop : Electron
UI/UX : Tailwind CSS + DaisyUI
Icônes : Lucide React
Base de Données : Better SQLite3 pour le stockage local performant.
Génération PDF : @react-pdf/renderer
  Installation et Démarrage
Pour lancer le projet localement sur votre machine :

Cloner le dépôt
bash
git clone https://github.com/yobwweh/mon-facturier-ci.git
cd mon-facturier-ci
Installer les dépendances
bash
npm install
(Note : Assurez-vous d'avoir les outils de compilation natifs installés pour better-sqlite3 si nécessaire).
Mode Développement (Web uniquement) Pour travailler sur l'interface (la base de données locale sera simulée ou non disponible) :
bash
npm run dev
Lancer l'application Desktop Pour lancer la version Electron complète :
bash
npm run start
Compiler pour la production Pour créer l'exécutable (Windows/Mac/Linux) :
bash
npm run dist
👤 Auteur
Yoboué N'Guessan Armel Constant

Développé avec ❤️ pour les entrepreneurs de Côte d'Ivoire
