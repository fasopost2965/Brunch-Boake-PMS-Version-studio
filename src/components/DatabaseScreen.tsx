import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, Copy } from 'lucide-react';

interface DatabaseScreenProps {
  triggerToast: (msg: string) => void;
}

export const DatabaseScreen: React.FC<DatabaseScreenProps> = ({ triggerToast }) => {
  const [copiedQuery, setCopiedQuery] = useState(false);

  const getMySQLDDL = () => {
    return `-- =========================================================================
-- SCRIPTS DDL DE MIGRATION VERS MYSQL - BRUNCH BOUAKÉ PMS
-- Généré le 11 Juillet 2026 à l'usage de fasopost24@gmail.com
-- =========================================================================

CREATE DATABASE IF NOT EXISTS brunch_bouake_pms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE brunch_bouake_pms;

-- 1. Table des Chambres (Rooms)
CREATE TABLE IF NOT EXISTS rooms (
    id VARCHAR(10) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    status ENUM('Libre', 'Occupé', 'Sale', 'Maintenance') DEFAULT 'Libre',
    price DECIMAL(12, 2) NOT NULL,
    capacity INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Table des Clients (Guests)
CREATE TABLE IF NOT EXISTS guests (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(30),
    status ENUM('Régulier', 'VIP', 'Corporate', 'Nouveau') DEFAULT 'Nouveau',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Table des Réservations (Reservations)
CREATE TABLE IF NOT EXISTS reservations (
    id VARCHAR(20) PRIMARY KEY,
    guest_name VARCHAR(100) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    total_bill DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0.00,
    status ENUM('Confirmé', 'En Cours', 'Terminé') DEFAULT 'Confirmé',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_number) REFERENCES rooms(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

-- 4. Table des Commandes de Brunch / Restauration (Brunch Orders)
CREATE TABLE IF NOT EXISTS brunch_orders (
    id VARCHAR(20) PRIMARY KEY,
    room_number VARCHAR(10),
    items TEXT NOT NULL, -- Liste ou format JSON
    total_amount DECIMAL(12, 2) NOT NULL,
    is_charged_to_room BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. Table des Tickets de Maintenance
CREATE TABLE IF NOT EXISTS maintenance_tickets (
    id VARCHAR(20) PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL,
    issue TEXT NOT NULL,
    priority ENUM('Basse', 'Moyenne', 'Haute') DEFAULT 'Moyenne',
    status ENUM('Reçu', 'En Cours', 'Résolu') DEFAULT 'Reçu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_number) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Table de Suivi Financier (Payments Ledger)
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(20) PRIMARY KEY,
    reservation_id VARCHAR(20) NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50) NOT NULL,
    reference VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getMySQLDDL());
    setCopiedQuery(true);
    triggerToast('Script MySQL DDL copié dans votre presse-papiers !');
    setTimeout(() => setCopiedQuery(false), 3000);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="database_screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Base de Données Relationnelle & MySQL</h2>
          <p className="text-xs text-[#797067]">Visualisation de l'architecture relationnelle et outils de déploiement en production.</p>
        </div>
        
        <button
          onClick={copyToClipboard}
          className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all self-start cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          {copiedQuery ? 'Script copié !' : 'Copier le script SQL (DDL)'}
        </button>
      </div>

      {/* FAQ ROW */}
      <div className="bg-[#f3f4f6] border border-[#e3e0dd] p-6 rounded-xl flex flex-col gap-4 text-xs">
        <div className="flex gap-2.5 items-center">
          <ShieldCheck className="w-6 h-6 text-[#fe6e00]" />
          <h3 className="font-bold text-[#423d38] text-sm">Foire Aux Questions : Passage à MySQL</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed mt-1">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#e3e0dd] flex flex-col gap-2">
            <span className="font-bold text-[#423d38] text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#fe6e00] shrink-0" />
              Est-ce que je peux passer à MySQL après la fin du développement ?
            </span>
            <p className="text-[#797067]">
              <strong>Oui ! Absolument.</strong> L'ensemble des structures de données de ce PMS (Chambres, Réservations, Commandes, Maintenance) a été conceptualisé dès le départ selon des principes relationnels SQL rigoureux. Toutes les relations de clés étrangères (Room ID, Guest Email) sont formellement documentées.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-[#e3e0dd] flex flex-col gap-2">
            <span className="font-bold text-[#423d38] text-xs flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#fe6e00] shrink-0" />
              Comment se passera la migration technique ?
            </span>
            <p className="text-[#797067]">
              Durant la phase de maquettage rapide sur l'éditeur d'AI Studio, nous utilisons la réactivité de <strong>localStorage</strong> pour vous assurer une prévisualisation instantanée et fluide (zéro délai de chargement ou redémarrage de serveur). En production, vous n'aurez qu'à configurer un ORM (comme Prisma ou Drizzle) raccordé à votre serveur MySQL pour remplacer les hooks réactifs par des requêtes de base de données standard.
            </p>
          </div>
        </div>
      </div>

      {/* ER PREVIEWS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Conceptual Diagram */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-[#423d38] text-sm">Schéma Conceptuel de Données (SCD)</h3>
          
          <div className="flex flex-col gap-3 font-semibold">
            {/* Entity Rooms */}
            <div className="bg-[#fef9c2]/40 p-3 rounded-lg border border-[#e3e0dd]">
              <span className="font-black text-[#423d38] block">🔑 TABLE: rooms</span>
              <div className="text-[10px] text-[#797067] font-mono mt-1 space-y-0.5">
                <div>id : VARCHAR(10) (PK)</div>
                <div>type : VARCHAR(50)</div>
                <div>status : ENUM('Libre', 'Occupé', ...)</div>
                <div>price : DECIMAL(12, 2)</div>
                <div>capacity : INT</div>
              </div>
            </div>

            <div className="flex justify-center text-[#e3e0dd]">⬇️ Clé étrangère (room_number)</div>

            {/* Entity Guests */}
            <div className="bg-[#fe6e00]/5 p-3 rounded-lg border border-[#fe6e00]/20">
              <span className="font-black text-[#fe6e00] block">🔑 TABLE: guests</span>
              <div className="text-[10px] text-[#797067] font-mono mt-1 space-y-0.5">
                <div>id : VARCHAR(20) (PK)</div>
                <div>name : VARCHAR(100)</div>
                <div>email : VARCHAR(150) (UNIQUE)</div>
                <div>phone : VARCHAR(30)</div>
                <div>status : ENUM</div>
                <div>notes : TEXT</div>
              </div>
            </div>

            <div className="flex justify-center text-[#e3e0dd]">⬇️ Clé étrangère</div>

            {/* Entity Reservations */}
            <div className="bg-[#f3f4f6] p-3 rounded-lg border border-[#e3e0dd]">
              <span className="font-black text-[#423d38] block">🔑 TABLE: reservations</span>
              <div className="text-[10px] text-[#797067] font-mono mt-1 space-y-0.5">
                <div>id : VARCHAR(20) (PK)</div>
                <div>guest_name : VARCHAR(100)</div>
                <div>guest_email : VARCHAR(150) (FK ➔ guests.email)</div>
                <div>room_number : VARCHAR(10) (FK ➔ rooms.id)</div>
                <div>check_in : DATE</div>
                <div>check_out : DATE</div>
                <div>total_bill : DECIMAL</div>
                <div>paid_amount : DECIMAL</div>
                <div>status : ENUM</div>
              </div>
            </div>
          </div>
        </div>

        {/* Script Viewer */}
        <div className="lg:col-span-2 bg-[#1e1e1e] p-5 rounded-xl shadow-sm border border-[#e3e0dd]/20 flex flex-col gap-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#e3e0dd] font-bold font-mono">mysql-ddl-bouake-pms.sql</span>
            <button
              onClick={copyToClipboard}
              className="text-[#797067] hover:text-[#e3e0dd] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedQuery ? 'Copié !' : 'Copier'}
            </button>
          </div>

          <div className="bg-[#121212] p-4 rounded-lg overflow-x-auto border border-[#1e1e1e] h-96">
            <pre className="text-[11px] text-[#c7c1b9] font-mono whitespace-pre leading-relaxed">
              {getMySQLDDL()}
            </pre>
          </div>
        </div>
      </div>

      {/* REST API SIMULATION LAYER DOCUMENTATION */}
      <div className="bg-[#fef9c2]/20 border border-[#fef3c7] p-6 rounded-xl flex flex-col gap-4 text-xs">
        <div className="flex gap-2.5 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#fe6e00] animate-pulse"></div>
          <h3 className="font-bold text-[#423d38] text-sm uppercase tracking-wider">Service de Simulation d'API REST (src/api/index.ts)</h3>
        </div>

        <p className="text-[#797067] leading-relaxed">
          Pour préparer la transition vers une architecture de production et simplifier l'intégration d'un serveur d'API réel, nous avons mis en place un <strong>SDK de simulation REST</strong> dans le dossier <code>src/api</code>. Ce SDK encapsule toutes les opérations de lecture et écriture dans le <code>localStorage</code>, tout en renvoyant des objets <code>Promise</code> asynchrones. 
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-white p-4 rounded-lg shadow-2xs border border-[#e3e0dd] flex flex-col gap-2">
            <span className="font-bold text-[#423d38]">📡 Architecture Prête</span>
            <p className="text-gray-500 leading-normal text-[11px]">
              Toutes les requêtes retournent des promesses avec une latence simulée de 120ms. Les composants hôteliers n'ont qu'à appeler <code>await api.reservations.getAll()</code> sans se soucier du support de stockage sous-jacent.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-2xs border border-[#e3e0dd] flex flex-col gap-2">
            <span className="font-bold text-[#423d38]">📝 Logs Console en Temps Réel</span>
            <p className="text-gray-500 leading-normal text-[11px]">
              Ouvrez les outils de développement (F12) pour observer la trace des appels d'API : chaque action déclenche des logs détaillés comme <code>[REST API] GET /api/rooms - Status 200 (OK)</code>.
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-2xs border border-[#e3e0dd] flex flex-col gap-2">
            <span className="font-bold text-[#423d38]">🔄 Substitution Simple</span>
            <p className="text-gray-500 leading-normal text-[11px]">
              Une fois votre base de données MySQL configurée en production, remplacez simplement les fonctions du fichier <code>src/api/index.ts</code> par de vrais appels <code>fetch()</code> ou <code>axios</code> vers vos routes Node.js.
            </p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-4 rounded-lg border border-gray-800 text-gray-300 font-mono text-[11px] leading-relaxed mt-2 overflow-x-auto">
          <span className="text-[#fe6e00] font-bold block mb-1">// Exemple d'appel pour enregistrer une réservation</span>
          <span className="text-gray-400">
            import &#123; api &#125; from '../api';<br />
            <br />
            <span className="text-emerald-400">async</span> function validerArrivee(reservationId) &#123;<br />
            &nbsp;&nbsp;<span className="text-blue-400">try</span> &#123;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gray-500">// Simule un appel PUT /api/reservations/:id</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;const res = <span className="text-emerald-400">await</span> api.reservations.update(reservationId, &#123; status: 'En Cours' &#125;);<br />
            &nbsp;&nbsp;&nbsp;&nbsp;console.log("Réservation mise à jour :", res);<br />
            &nbsp;&nbsp;&#125; <span className="text-blue-400">catch</span> (err) &#123;<br />
            &nbsp;&nbsp;&nbsp;&nbsp;console.error("Erreur de communication API :", err);<br />
            &nbsp;&nbsp;&#125;<br />
            &#125;
          </span>
        </div>
      </div>
    </div>
  );
};
