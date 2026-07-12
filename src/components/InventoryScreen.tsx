import React, { useState, useEffect } from 'react';
import { 
  InventoryArticle, 
  InventoryEmplacement, 
  InventorySupplier, 
  InventoryMovement 
} from '../types';
import { 
  Package, 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  Layers, 
  FileText, 
  Warehouse, 
  Truck, 
  History, 
  BarChart3, 
  Search, 
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { BrunchLogo } from './BrunchLogo';

// DEFAULT STATIC DATA FOR INITIALIZATION
const DEFAULT_EMPLACEMENTS: InventoryEmplacement[] = [
  { id: 'EMP-001', name: 'Stock Central - Réception', description: 'Stock principal près de l\'accueil pour consommables immédiats.' },
  { id: 'EMP-002', name: 'Réserve Cuisine / Minibar', description: 'Espace sécurisé à température contrôlée pour boissons et ingrédients.' },
  { id: 'EMP-003', name: 'Dépôt Housekeeping & Linge', description: 'Grande armoire de stockage pour draps, serviettes, et savons.' },
  { id: 'EMP-004', name: 'Atelier Maintenance', description: 'Dépôt des outils, ampoules, peinture et pièces de rechange.' }
];

const DEFAULT_SUPPLIERS: InventorySupplier[] = [
  { id: 'SP-001', name: 'SODEFOR & Alimentation Bouaké', contactName: 'M. Touré K.', phone: '+225 07 11 22 33 44', email: 'toure@alimentation-bke.ci' },
  { id: 'SP-002', name: 'Blanchisserie Pro du Centre', contactName: 'Mme Konan Marie', phone: '+225 01 02 03 04 05', email: 'contact@blanchisserie-centre.ci' },
  { id: 'SP-003', name: 'Quincaillerie Kénédou', contactName: 'Jean-Marc B.', phone: '+225 05 55 66 77 88', email: 'jmb@kenedou.ci' }
];

const DEFAULT_ARTICLES: InventoryArticle[] = [
  // housekeeping
  { id: 'ART-001', name: 'Savonnette d\'accueil 15g', sku: 'HK-SAV-01', category: 'housekeeping', emplacementId: 'EMP-003', minStock: 100, priceUnit: 150, supplierId: 'SP-001', isActive: true, unit: 'Unité', description: 'Petite savonnette individuelle parfumée.' },
  { id: 'ART-002', name: 'Shampoing d\'accueil 30ml', sku: 'HK-SHA-01', category: 'housekeeping', emplacementId: 'EMP-003', minStock: 100, priceUnit: 200, supplierId: 'SP-001', isActive: true, unit: 'Unité', description: 'Flacon individuel de shampoing.' },
  // cuisine
  { id: 'ART-003', name: 'Café Arabica grains 1kg', sku: 'CU-CAF-01', category: 'cuisine', emplacementId: 'EMP-002', minStock: 5, priceUnit: 6500, supplierId: 'SP-001', isActive: true, unit: 'Kg', description: 'Café de Côte d\'Ivoire torréfié de qualité supérieure.' },
  { id: 'ART-004', name: 'Jus d\'Ananas local 1L', sku: 'CU-JUS-01', category: 'cuisine', emplacementId: 'EMP-002', minStock: 15, priceUnit: 1200, supplierId: 'SP-001', isActive: true, unit: 'Bouteille', description: 'Jus pur d\'ananas de pays pressé.' },
  // minibar
  { id: 'ART-005', name: 'Bière Bock nationale 33cl', sku: 'MB-BIE-01', category: 'minibar', emplacementId: 'EMP-002', minStock: 24, priceUnit: 800, supplierId: 'SP-001', isActive: true, unit: 'Bouteille', description: 'Boisson rafraîchissante pour réapprovisionnement minibar.' },
  { id: 'ART-006', name: 'Eau minérale AWA 1.5L', sku: 'MB-EAU-01', category: 'minibar', emplacementId: 'EMP-002', minStock: 30, priceUnit: 400, supplierId: 'SP-001', isActive: true, unit: 'Bouteille', description: 'Eau de table plate.' },
  // maintenance
  { id: 'ART-007', name: 'Ampoule LED E27 9W', sku: 'MA-AMP-01', category: 'maintenance', emplacementId: 'EMP-004', minStock: 10, priceUnit: 1500, supplierId: 'SP-003', isActive: true, unit: 'Unité', description: 'Ampoule à économie d\'énergie.' },
  // linge
  { id: 'ART-008', name: 'Drap double coton blanc', sku: 'LI-DRA-01', category: 'linge', emplacementId: 'EMP-003', minStock: 15, priceUnit: 9500, supplierId: 'SP-002', isActive: true, unit: 'Unité', description: 'Drap hôtelier haut de gamme à forte résistance.' },
  { id: 'ART-009', name: 'Taie d\'oreiller blanche', sku: 'LI-TAI-01', category: 'linge', emplacementId: 'EMP-003', minStock: 20, priceUnit: 2500, supplierId: 'SP-002', isActive: true, unit: 'Unité', description: 'Taie assortie aux draps de chambre.' },
  // réception
  { id: 'ART-010', name: 'Papier thermique caisse 80mm', sku: 'RE-PAP-01', category: 'réception', emplacementId: 'EMP-001', minStock: 12, priceUnit: 850, supplierId: 'SP-003', isActive: true, unit: 'Rouleau', description: 'Papier pour imprimantes de facture rapide.' }
];

const DEFAULT_MOVEMENTS: InventoryMovement[] = [
  { id: 'MOV-001', articleId: 'ART-001', type: 'Entrée', quantity: 350, toEmplacementId: 'EMP-003', reason: 'Commande initiale fournisseur', operator: 'F. Touré (Directeur)', timestamp: '2026-07-01 09:15' },
  { id: 'MOV-002', articleId: 'ART-002', type: 'Entrée', quantity: 200, toEmplacementId: 'EMP-003', reason: 'Commande initiale fournisseur', operator: 'F. Touré (Directeur)', timestamp: '2026-07-01 09:20' },
  { id: 'MOV-003', articleId: 'ART-003', type: 'Entrée', quantity: 15, toEmplacementId: 'EMP-002', reason: 'Approvisionnement cuisine', operator: 'M. Koffi (Chef)', timestamp: '2026-07-02 10:00' },
  { id: 'MOV-004', articleId: 'ART-005', type: 'Entrée', quantity: 48, toEmplacementId: 'EMP-002', reason: 'Achat de pack de bières', operator: 'M. Koffi (Chef)', timestamp: '2026-07-03 14:30' },
  { id: 'MOV-005', articleId: 'ART-008', type: 'Entrée', quantity: 20, toEmplacementId: 'EMP-003', reason: 'Nouveau linge réceptionné', operator: 'A. Diallo (Gouvernante)', timestamp: '2026-07-04 11:15' },
  { id: 'MOV-006', articleId: 'ART-001', type: 'Sortie', quantity: 120, fromEmplacementId: 'EMP-003', reason: 'Consommation hebdomadaire chambres', operator: 'A. Diallo (Gouvernante)', timestamp: '2026-07-08 17:00' },
  { id: 'MOV-007', articleId: 'ART-002', type: 'Sortie', quantity: 110, fromEmplacementId: 'EMP-003', reason: 'Consommation hebdomadaire chambres', operator: 'A. Diallo (Gouvernante)', timestamp: '2026-07-08 17:02' },
  { id: 'MOV-008', articleId: 'ART-007', type: 'Entrée', quantity: 12, toEmplacementId: 'EMP-004', reason: 'Stock ampoules acheté', operator: 'S. Diabaté (Technicien)', timestamp: '2026-07-09 08:30' },
  { id: 'MOV-009', articleId: 'ART-007', type: 'Sortie', quantity: 3, fromEmplacementId: 'EMP-004', reason: 'Remplacement ampoules grillées CH 101, 102', operator: 'S. Diabaté (Technicien)', timestamp: '2026-07-10 11:20' },
  { id: 'MOV-010', articleId: 'ART-003', type: 'Sortie', quantity: 4, fromEmplacementId: 'EMP-002', reason: 'Préparation café petits déjeuners', operator: 'M. Koffi (Chef)', timestamp: '2026-07-11 11:50' },
  { id: 'MOV-011', articleId: 'ART-004', type: 'Ajustement', quantity: 10, toEmplacementId: 'EMP-002', reason: 'Inventaire physique et correction', operator: 'F. Touré (Directeur)', timestamp: '2026-07-11 15:00' }
];

interface InventoryScreenProps {
  triggerToast?: (msg: string) => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ triggerToast: propTriggerToast }) => {
  // PERSISTENCE VIA LOCALSTORAGE
  const [articles, setArticles] = useState<InventoryArticle[]>(() => {
    const saved = localStorage.getItem('pms_inventory_articles');
    return saved ? JSON.parse(saved) : DEFAULT_ARTICLES;
  });

  const [emplacements, setEmplacements] = useState<InventoryEmplacement[]>(() => {
    const saved = localStorage.getItem('pms_inventory_emplacements');
    return saved ? JSON.parse(saved) : DEFAULT_EMPLACEMENTS;
  });

  const [suppliers, setSuppliers] = useState<InventorySupplier[]>(() => {
    const saved = localStorage.getItem('pms_inventory_suppliers');
    return saved ? JSON.parse(saved) : DEFAULT_SUPPLIERS;
  });

  const [movements, setMovements] = useState<InventoryMovement[]>(() => {
    const saved = localStorage.getItem('pms_inventory_movements');
    return saved ? JSON.parse(saved) : DEFAULT_MOVEMENTS;
  });

  // SAVE TO LOCALSTORAGE ON CHANGE
  useEffect(() => {
    localStorage.setItem('pms_inventory_articles', JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem('pms_inventory_emplacements', JSON.stringify(emplacements));
  }, [emplacements]);

  useEffect(() => {
    localStorage.setItem('pms_inventory_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('pms_inventory_movements', JSON.stringify(movements));
  }, [movements]);

  // SCREEN NAVIGATION
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'articles' | 'movements' | 'emplacements' | 'suppliers' | 'reports'>('dashboard');

  // ALERTS & TOAST
  const [toast, setToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToast(msg);
    if (propTriggerToast) {
      propTriggerToast(msg);
    }
    setTimeout(() => setToast(null), 3000);
  };

  // CATEGORY NAMES TRANSLATION
  const categoriesMap: Record<string, string> = {
    housekeeping: 'Ménage & Housekeeping',
    cuisine: 'Cuisine / Restauration',
    minibar: 'Minibar Chambres',
    maintenance: 'Maintenance & Technique',
    réception: 'Fournitures Réception',
    linge: 'Gestion du Linge'
  };

  const categoriesBadgeColors: Record<string, string> = {
    housekeeping: 'bg-emerald-100 text-emerald-800',
    cuisine: 'bg-amber-100 text-amber-800',
    minibar: 'bg-purple-100 text-purple-800',
    maintenance: 'bg-blue-100 text-blue-800',
    réception: 'bg-teal-100 text-teal-800',
    linge: 'bg-pink-100 text-pink-800'
  };

  // DYNAMIC STOCK CALCULATION ENGINE
  // Real-time stock for an article = Sum of Entries - Sum of Exits +/- Adjustments + Sum of Transfer Inputs - Sum of Transfer Outputs
  const getArticleStock = (articleId: string) => {
    let stock = 0;
    const articleMovs = movements.filter(m => m.articleId === articleId);
    
    articleMovs.forEach(mov => {
      if (mov.type === 'Entrée') {
        stock += mov.quantity;
      } else if (mov.type === 'Sortie') {
        stock -= mov.quantity;
      } else if (mov.type === 'Ajustement') {
        // For adjustments, let's treat quantity as the direct new corrected stock, OR delta.
        // To be safe and intuitive, our adjustment adds or subtracts directly from current cumulative.
        // Let's assume an adjustment simply adds a relative delta to the stock.
        stock += mov.quantity; 
      } else if (mov.type === 'Transfert') {
        // If coming out of an emplacement, it decreases, if entering, it increases.
        // For simplicity, let's look at the movement parameters.
        // We will define transfers as exiting a "from" and entering a "to".
        // When checking stock globally, transfer delta is 0, but by emplacement it matters.
        // Let's assume global transfer doesn't change global stock.
      }
    });
    return stock < 0 ? 0 : stock;
  };

  // GET STOCK PER EMPLACEMENT
  const getArticleStockInEmplacement = (articleId: string, emplacementId: string) => {
    let stock = 0;
    const articleMovs = movements.filter(m => m.articleId === articleId);

    articleMovs.forEach(mov => {
      if (mov.type === 'Entrée' && mov.toEmplacementId === emplacementId) {
        stock += mov.quantity;
      } else if (mov.type === 'Sortie' && mov.fromEmplacementId === emplacementId) {
        stock -= mov.quantity;
      } else if (mov.type === 'Ajustement' && mov.toEmplacementId === emplacementId) {
        stock += mov.quantity;
      } else if (mov.type === 'Transfert') {
        if (mov.fromEmplacementId === emplacementId) {
          stock -= mov.quantity;
        }
        if (mov.toEmplacementId === emplacementId) {
          stock += mov.quantity;
        }
      }
    });
    return stock < 0 ? 0 : stock;
  };

  // CHECK IF ARTICLE HAS EVER BEEN USED IN ANY MOVEMENT
  const isArticleUsed = (articleId: string) => {
    return movements.some(m => m.articleId === articleId);
  };

  // FORM STATES
  // 1. Article Form
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<InventoryArticle | null>(null);
  const [articleName, setArticleName] = useState('');
  const [articleSku, setArticleSku] = useState('');
  const [articleCategory, setArticleCategory] = useState<InventoryArticle['category']>('housekeeping');
  const [articleEmplacement, setArticleEmplacement] = useState('');
  const [articleMinStock, setArticleMinStock] = useState('20');
  const [articlePrice, setArticlePrice] = useState('1000');
  const [articleSupplier, setArticleSupplier] = useState('');
  const [articleUnit, setArticleUnit] = useState('Unité');
  const [articleDesc, setArticleDesc] = useState('');

  // 2. Movement Form
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [movArticleId, setMovArticleId] = useState('');
  const [movType, setMovType] = useState<'Entrée' | 'Sortie' | 'Ajustement' | 'Transfert'>('Entrée');
  const [movQuantity, setMovQuantity] = useState('50');
  const [movFromEmp, setMovFromEmp] = useState('');
  const [movToEmp, setMovToEmp] = useState('');
  const [movReason, setMovReason] = useState('');
  const [movOperator, setMovOperator] = useState('Opérateur local');

  // 3. Emplacement Form
  const [showEmpModal, setShowEmpModal] = useState(false);
  const [empName, setEmpName] = useState('');
  const [empDesc, setEmpDesc] = useState('');

  // 4. Supplier Form
  const [showSupModal, setShowSupModal] = useState(false);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');

  // FILTER STATES (For list tables)
  const [filterCategory, setFilterCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterEmplacement, setFilterEmplacement] = useState<string>('Tous');

  // OPEN ARTICLE MODAL FOR CREATE
  const handleOpenCreateArticle = () => {
    setEditingArticle(null);
    setArticleName('');
    setArticleSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
    setArticleCategory('housekeeping');
    setArticleEmplacement(emplacements[0]?.id || '');
    setArticleMinStock('20');
    setArticlePrice('1000');
    setArticleSupplier(suppliers[0]?.id || '');
    setArticleUnit('Unité');
    setArticleDesc('');
    setShowArticleModal(true);
  };

  // OPEN ARTICLE MODAL FOR EDIT
  const handleOpenEditArticle = (art: InventoryArticle) => {
    setEditingArticle(art);
    setArticleName(art.name);
    setArticleSku(art.sku);
    setArticleCategory(art.category);
    setArticleEmplacement(art.emplacementId);
    setArticleMinStock(art.minStock.toString());
    setArticlePrice(art.priceUnit.toString());
    setArticleSupplier(art.supplierId);
    setArticleUnit(art.unit);
    setArticleDesc(art.description || '');
    setShowArticleModal(true);
  };

  // SAVE OR UPDATE ARTICLE
  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleName.trim()) {
      triggerToast('Erreur: Le nom de l\'article est obligatoire.');
      return;
    }

    if (editingArticle) {
      // Edit
      setArticles(prev => prev.map(a => a.id === editingArticle.id ? {
        ...a,
        name: articleName,
        sku: articleSku,
        category: articleCategory,
        emplacementId: articleEmplacement,
        minStock: Number(articleMinStock) || 0,
        priceUnit: Number(articlePrice) || 0,
        supplierId: articleSupplier,
        unit: articleUnit,
        description: articleDesc
      } : a));
      triggerToast(`Article mis à jour: ${articleName}`);
    } else {
      // Create new
      const newArtId = `ART-${Math.floor(100 + Math.random() * 900)}`;
      const newArt: InventoryArticle = {
        id: newArtId,
        name: articleName,
        sku: articleSku,
        category: articleCategory,
        emplacementId: articleEmplacement,
        minStock: Number(articleMinStock) || 0,
        priceUnit: Number(articlePrice) || 0,
        supplierId: articleSupplier,
        isActive: true,
        unit: articleUnit,
        description: articleDesc
      };
      setArticles(prev => [...prev, newArt]);

      // Add initial stock movement if quantity > 0
      const initialQty = Number(articleMinStock) || 0;
      if (initialQty > 0) {
        const initialMov: InventoryMovement = {
          id: `MOV-${Date.now()}`,
          articleId: newArtId,
          type: 'Entrée',
          quantity: initialQty,
          toEmplacementId: articleEmplacement,
          reason: 'Initialisation du stock de départ',
          operator: movOperator,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        setMovements(prev => [initialMov, ...prev]);
      }
      triggerToast(`Nouvel article créé: ${articleName}`);
    }
    setShowArticleModal(false);
  };

  // SOFT DELETION OR DEACTIVATION OF ARTICLE
  const handleDeleteArticle = (id: string) => {
    const art = articles.find(a => a.id === id);
    if (!art) return;

    if (isArticleUsed(id)) {
      // Cannot delete physically as it is referenced in movements. Soft delete/deactivate.
      setArticles(prev => prev.map(a => a.id === id ? { ...a, isActive: false } : a));
      triggerToast(`L'article ${art.name} a été archivé car il possède des mouvements de stock associés.`);
    } else {
      // Physical delete
      setArticles(prev => prev.filter(a => a.id !== id));
      triggerToast(`L'article ${art.name} a été supprimé physiquement du système.`);
    }
  };

  // REACTIVATE SOFT-DELETED ARTICLE
  const handleReactivateArticle = (id: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, isActive: true } : a));
    triggerToast(`L'article a été réactivé avec succès.`);
  };

  // SAVE MOVEMENT
  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movArticleId) {
      triggerToast('Erreur: Veuillez sélectionner un article.');
      return;
    }

    const qty = Number(movQuantity) || 0;
    if (qty <= 0) {
      triggerToast('Erreur: La quantité doit être supérieure à 0.');
      return;
    }

    const targetArticle = articles.find(a => a.id === movArticleId);
    if (!targetArticle) return;

    // Check stock availability if it's an exit or transfer
    if (movType === 'Sortie' || movType === 'Transfert') {
      const currentLocStock = getArticleStockInEmplacement(movArticleId, movFromEmp);
      if (currentLocStock < qty) {
        triggerToast(`Erreur: Stock insuffisant dans l'emplacement sélectionné. Disponible: ${currentLocStock} ${targetArticle.unit}(s)`);
        return;
      }
    }

    const newMov: InventoryMovement = {
      id: `MOV-${Date.now()}`,
      articleId: movArticleId,
      type: movType,
      quantity: qty,
      fromEmplacementId: (movType === 'Sortie' || movType === 'Transfert') ? movFromEmp : undefined,
      toEmplacementId: (movType === 'Entrée' || movType === 'Transfert' || movType === 'Ajustement') ? movToEmp : undefined,
      reason: movReason.trim() || `${movType} de matériel d'inventaire`,
      operator: movOperator,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setMovements(prev => [newMov, ...prev]);
    triggerToast(`Mouvement enregistré avec succès: ${movType} de ${qty} ${targetArticle.unit}(s)`);
    setShowMovementModal(false);
  };

  // SAVE EMPLACEMENT
  const handleSaveEmplacement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName.trim()) return;

    const newEmp: InventoryEmplacement = {
      id: `EMP-00${emplacements.length + 1}`,
      name: empName,
      description: empDesc
    };

    setEmplacements(prev => [...prev, newEmp]);
    triggerToast(`Nouvel emplacement créé: ${empName}`);
    setShowEmpModal(false);
    setEmpName('');
    setEmpDesc('');
  };

  // SAVE SUPPLIER
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    const newSup: InventorySupplier = {
      id: `SP-${Math.floor(100 + Math.random() * 900)}`,
      name: supName,
      contactName: supContact,
      phone: supPhone,
      email: supEmail
    };

    setSuppliers(prev => [...prev, newSup]);
    triggerToast(`Nouveau fournisseur enregistré: ${supName}`);
    setShowSupModal(false);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
  };

  // FILTERED ARTICLES LIST
  const filteredArticles = articles.filter(art => {
    const matchesCategory = filterCategory === 'Tous' || art.category === filterCategory;
    const matchesEmplacement = filterEmplacement === 'Tous' || art.emplacementId === filterEmplacement;
    const matchesSearch = art.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          art.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (art.description && art.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesEmplacement && matchesSearch;
  });

  // COUNT LOW STOCK ARTICLES
  const alertArticles = articles.filter(art => art.isActive && getArticleStock(art.id) <= art.minStock);

  // TOTAL INVENTORY VALUE
  const totalValuation = articles
    .filter(art => art.isActive)
    .reduce((sum, art) => sum + (getArticleStock(art.id) * art.priceUnit), 0);

  // GET VALUATION PER CATEGORY
  const getCategoryValuation = (cat: string) => {
    return articles
      .filter(art => art.isActive && art.category === cat)
      .reduce((sum, art) => sum + (getArticleStock(art.id) * art.priceUnit), 0);
  };

  // GET TOTAL QUANTITY BY CATEGORY
  const getCategoryQty = (cat: string) => {
    return articles
      .filter(art => art.isActive && art.category === cat)
      .reduce((sum, art) => sum + getArticleStock(art.id), 0);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="inventory_screen">
      
      {/* TOAST ALERT */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#fe6e00] text-white font-bold py-3 px-6 rounded-lg shadow-xl border border-white/10 animate-bounce flex items-center gap-2">
          <Package className="w-5 h-5 animate-spin" />
          <span>{toast}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e3e0dd] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
            <BrunchLogo size={55} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Gestion des Stocks & Logistique</h2>
            <p className="text-xs text-[#797067]">
              Inventaire matériel hôtelier en temps réel : gouvernance, cuisine, minibar, maintenance et linge de maison.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={handleOpenCreateArticle}
            className="bg-[#fe6e00] hover:bg-[#e06100] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Créer un Article
          </button>
          <button 
            onClick={() => {
              setMovType('Entrée');
              setMovArticleId(articles[0]?.id || '');
              setMovQuantity('10');
              setMovReason('');
              setMovFromEmp('');
              setMovToEmp(emplacements[0]?.id || '');
              setShowMovementModal(true);
            }}
            className="bg-[#016630] hover:bg-[#025227] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
            Nouveau Mouvement
          </button>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex flex-wrap border-b border-[#e3e0dd] gap-1 pb-1">
        <button
          onClick={() => setActiveSubTab('dashboard')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 ${
            activeSubTab === 'dashboard' 
              ? 'bg-white text-[#fe6e00] border-[#fe6e00] font-black shadow-sm' 
              : 'bg-transparent text-[#797067] border-transparent hover:bg-white/40'
          }`}
        >
          <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4" /> Tableau de bord & Alertes</span>
        </button>
        <button
          onClick={() => setActiveSubTab('articles')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 ${
            activeSubTab === 'articles' 
              ? 'bg-white text-[#fe6e00] border-[#fe6e00] font-black shadow-sm' 
              : 'bg-transparent text-[#797067] border-transparent hover:bg-white/40'
          }`}
        >
          <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> Base des Articles ({articles.filter(a => a.isActive).length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('movements')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 ${
            activeSubTab === 'movements' 
              ? 'bg-white text-[#fe6e00] border-[#fe6e00] font-black shadow-sm' 
              : 'bg-transparent text-[#797067] border-transparent hover:bg-white/40'
          }`}
        >
          <span className="flex items-center gap-1.5"><History className="w-4 h-4" /> Registre de Mouvements ({movements.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('emplacements')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 ${
            activeSubTab === 'emplacements' 
              ? 'bg-white text-[#fe6e00] border-[#fe6e00] font-black shadow-sm' 
              : 'bg-transparent text-[#797067] border-transparent hover:bg-white/40'
          }`}
        >
          <span className="flex items-center gap-1.5"><Warehouse className="w-4 h-4" /> Dépôts & Emplacements ({emplacements.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('suppliers')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 ${
            activeSubTab === 'suppliers' 
              ? 'bg-white text-[#fe6e00] border-[#fe6e00] font-black shadow-sm' 
              : 'bg-transparent text-[#797067] border-transparent hover:bg-white/40'
          }`}
        >
          <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Fournisseurs ({suppliers.length})</span>
        </button>
        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-t-2 ${
            activeSubTab === 'reports' 
              ? 'bg-white text-[#fe6e00] border-[#fe6e00] font-black shadow-sm' 
              : 'bg-transparent text-[#797067] border-transparent hover:bg-white/40'
          }`}
        >
          <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> Rapports de Consommation</span>
        </button>
      </div>

      {/* SUB-TABS RENDERINGS */}
      
      {/* 1. TABLEAU DE BORD SUB-TAB */}
      {activeSubTab === 'dashboard' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* STATS HIGHLIGHTS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Valeur Totale du Stock</span>
                <span className="text-xl font-extrabold text-[#423d38] font-mono">{totalValuation.toLocaleString()} FCFA</span>
              </div>
              <div className="w-10 h-10 bg-[#fe6e00]/10 text-[#fe6e00] rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Articles Référencés</span>
                <span className="text-xl font-extrabold text-[#423d38] font-mono">{articles.filter(a => a.isActive).length} articles</span>
              </div>
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Alertes Rupture / Bas</span>
                <span className={`text-xl font-extrabold font-mono ${alertArticles.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {alertArticles.length} alertes
                </span>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${alertArticles.length > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Mouvements (Trace)</span>
                <span className="text-xl font-extrabold text-[#423d38] font-mono">{movements.length} logs</span>
              </div>
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* WARNING ALERT FOR LOW STOCKS */}
          {alertArticles.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-red-800 font-bold text-xs">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>ALERTES DE STOCKS FAIBLES : Les articles suivants ont atteint ou dépassé leur seuil critique</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {alertArticles.map(art => {
                  const curr = getArticleStock(art.id);
                  return (
                    <div key={art.id} className="bg-white p-3 rounded-lg border border-red-100 flex justify-between items-center shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-gray-800">{art.name}</span>
                        <span className="text-[9px] text-gray-400 font-mono">SKU: {art.sku} • {categoriesMap[art.category]}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-red-600 block">{curr} {art.unit}(s)</span>
                        <span className="text-[9px] text-gray-400">Min requis: {art.minStock}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BENTO GRID DISTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* VALUATION PER CATEGORY */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm lg:col-span-2 flex flex-col gap-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#fe6e00]" />
                  Valorisation Financière du Stock par Catégorie
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Valeur globale cumulée (Stock actuel × Prix unitaire HT).</p>
              </div>

              <div className="flex flex-col gap-3.5 mt-2">
                {Object.keys(categoriesMap).map(catKey => {
                  const val = getCategoryValuation(catKey);
                  const qty = getCategoryQty(catKey);
                  const pct = totalValuation > 0 ? (val / totalValuation) * 100 : 0;
                  return (
                    <div key={catKey} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-700">{categoriesMap[catKey]}</span>
                        <div className="font-mono text-right flex gap-3">
                          <span className="text-gray-400 text-[10px]">{qty} unités</span>
                          <span className="font-bold text-gray-900">{val.toLocaleString()} FCFA</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          style={{ width: `${pct}%` }} 
                          className={`h-full transition-all duration-500 ${
                            catKey === 'housekeeping' ? 'bg-emerald-500' :
                            catKey === 'cuisine' ? 'bg-amber-500' :
                            catKey === 'minibar' ? 'bg-purple-500' :
                            catKey === 'maintenance' ? 'bg-blue-500' :
                            catKey === 'linge' ? 'bg-pink-500' : 'bg-teal-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs text-gray-500 font-semibold bg-gray-50 p-3 rounded-lg">
                <span>Total Matériel Sécurisé Brunch :</span>
                <span className="font-bold text-base text-[#fe6e00] font-mono">{totalValuation.toLocaleString()} FCFA</span>
              </div>
            </div>

            {/* SECTIONS QUICK LINKS & INFORMATION */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Warehouse className="w-4 h-4 text-emerald-600" />
                  Règles Métier & Traçabilité
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5 font-sans leading-relaxed">
                  L'ensemble des stocks de l'hôtel Brunch Bouaké obéit à des normes d'audit strictes.
                </p>
              </div>

              <div className="flex flex-col gap-3.5 my-2 text-xs">
                <div className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/50">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-900 block">Temps Réel Absolu</strong>
                    <span className="text-gray-500 text-[10px]">Chaque mouvement recalcule immédiatement les fiches de valorisation.</span>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/50">
                  <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 block">Zéro Suppression Physique</strong>
                    <span className="text-gray-500 text-[10px]">Un article ayant servi dans l'historique ne peut être supprimé. Il sera désactivé/archivé.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/50">
                  <ArrowLeftRight className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-blue-900 block">Ajustement Obligatoire</strong>
                    <span className="text-gray-500 text-[10px]">Les écarts d'inventaire doivent passer par des mouvements d'ajustement documentés.</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => setActiveSubTab('movements')}
                  className="text-xs text-[#fe6e00] hover:underline font-bold inline-flex items-center gap-1"
                >
                  Consulter les registres d'audit <History className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* DÉPÔTS LOCAUX DISTRIBUTION */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-[#fe6e00]" />
                État des stocks par Emplacement & Dépôt
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Disponibilité immédiate par magasin physique de l'hôtel.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {emplacements.map(emp => {
                // Count articles stationed here or has stock here
                const artInEmp = articles.filter(a => a.isActive && (a.emplacementId === emp.id || getArticleStockInEmplacement(a.id, emp.id) > 0));
                const totalItems = artInEmp.reduce((sum, a) => sum + getArticleStockInEmplacement(a.id, emp.id), 0);
                return (
                  <div key={emp.id} className="bg-gray-50 border rounded-lg p-3.5 flex flex-col justify-between">
                    <div>
                      <span className="font-bold text-gray-800 text-xs block truncate">{emp.name}</span>
                      <span className="text-[9px] text-gray-400 mt-1 block h-8 overflow-hidden leading-normal">{emp.description}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2.5 mt-2 flex justify-between items-center text-xs">
                      <span className="text-[10px] text-gray-500">{artInEmp.length} références</span>
                      <span className="font-mono font-black text-[#fe6e00]">{totalItems} unités</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. GESTION DES ARTICLES SUB-TAB */}
      {activeSubTab === 'articles' && (
        <div className="flex flex-col gap-4 animate-scale-up">
          
          {/* SEARCH AND FILTERS */}
          <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-gray-50 border rounded-lg px-3 py-2 w-full sm:max-w-xs">
              <Search className="w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Rechercher nom, SKU, desc..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none text-xs w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Catégorie:</span>
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-gray-50 border rounded-lg p-1.5 font-semibold text-xs"
                >
                  <option value="Tous">Toutes les catégories</option>
                  {Object.keys(categoriesMap).map(key => (
                    <option key={key} value={key}>{categoriesMap[key]}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Dépôt:</span>
                <select 
                  value={filterEmplacement}
                  onChange={(e) => setFilterEmplacement(e.target.value)}
                  className="bg-gray-50 border rounded-lg p-1.5 font-semibold text-xs"
                >
                  <option value="Tous">Tous les dépôts</option>
                  {emplacements.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ARTICLES TABLE */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b text-[9px] tracking-wider">
                <tr>
                  <th className="p-3">Référence / SKU</th>
                  <th className="p-3">Désignation de l'Article</th>
                  <th className="p-3">Catégorie Hôtelière</th>
                  <th className="p-3">Dépôt Principal</th>
                  <th className="p-3 text-right">Seuil Alerte</th>
                  <th className="p-3 text-right">Prix Achat Unit.</th>
                  <th className="p-3 text-right">Stock Actuel</th>
                  <th className="p-3 text-right">Valeur Estimée</th>
                  <th className="p-3 text-center">Statut</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-gray-400">
                      Aucun article ne correspond à votre recherche ou filtre.
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map(art => {
                    const currentStock = getArticleStock(art.id);
                    const isLow = currentStock <= art.minStock;
                    const val = currentStock * art.priceUnit;
                    const sup = suppliers.find(s => s.id === art.supplierId)?.name || 'Inconnu';
                    return (
                      <tr key={art.id} className={`hover:bg-gray-50 transition-colors ${!art.isActive ? 'bg-gray-50/50 text-gray-400' : ''}`}>
                        <td className="p-3 font-mono font-bold text-[#fe6e00]">
                          <div className="flex flex-col">
                            <span>{art.sku}</span>
                            <span className="text-[8px] text-gray-400 font-normal">ID: {art.id}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-gray-800">{art.name}</span>
                            <span className="text-[9px] text-gray-400">{art.description || 'Aucune description rédigée'}</span>
                            <span className="text-[8px] italic text-[#fe6e00] mt-0.5">Fournisseur : {sup}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${categoriesBadgeColors[art.category]}`}>
                            {categoriesMap[art.category] || art.category}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-gray-600">
                          {emplacements.find(e => e.id === art.emplacementId)?.name || 'Dépôt inconnu'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-gray-500">
                          {art.minStock} {art.unit}(s)
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-gray-700">
                          {art.priceUnit.toLocaleString()} F
                        </td>
                        <td className="p-3 text-right">
                          <span className={`font-mono font-black text-xs px-2 py-1 rounded ${
                            isLow && art.isActive ? 'bg-red-50 text-red-600 border border-red-200 font-bold' : 'text-gray-900'
                          }`}>
                            {currentStock} {art.unit}(s)
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-gray-800">
                          {val.toLocaleString()} F
                        </td>
                        <td className="p-3 text-center">
                          {art.isActive ? (
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[9px]">Actif</span>
                          ) : (
                            <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-bold text-[9px]">Archivé</span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1.5">
                            {art.isActive ? (
                              <>
                                <button 
                                  onClick={() => handleOpenEditArticle(art)}
                                  className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"
                                  title="Modifier les caractéristiques"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"
                                  title="Archiver / Supprimer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleReactivateArticle(art.id)}
                                className="text-emerald-600 hover:text-emerald-800 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded"
                              >
                                Réactiver
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. REGISTRE DE MOUVEMENTS SUB-TAB */}
      {activeSubTab === 'movements' && (
        <div className="flex flex-col gap-4 animate-scale-up">
          
          <div className="flex justify-between items-center bg-white p-4 border rounded-xl shadow-sm">
            <div>
              <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                Journal Général d'Audit de Mouvement
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Registre complet et inaltérable retraçant les flux de stocks.</p>
            </div>

            <button 
              onClick={() => {
                setMovType('Entrée');
                setMovArticleId(articles[0]?.id || '');
                setMovQuantity('10');
                setMovReason('');
                setMovFromEmp('');
                setMovToEmp(emplacements[0]?.id || '');
                setShowMovementModal(true);
              }}
              className="bg-[#016630] hover:bg-[#025227] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Enregistrer un Flux
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b text-[9px] tracking-wider">
                <tr>
                  <th className="p-3">Réf Mvt</th>
                  <th className="p-3">Horodatage</th>
                  <th className="p-3">Article Concerné</th>
                  <th className="p-3 text-center">Type Flux</th>
                  <th className="p-3 text-right">Quantité</th>
                  <th className="p-3">Provenance (From)</th>
                  <th className="p-3">Destination (To)</th>
                  <th className="p-3">Motif du Mouvement / Justificatif</th>
                  <th className="p-3">Opérateur Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {movements.map(mov => {
                  const art = articles.find(a => a.id === mov.articleId);
                  const fromLoc = emplacements.find(e => e.id === mov.fromEmplacementId)?.name || '—';
                  const toLoc = emplacements.find(e => e.id === mov.toEmplacementId)?.name || '—';
                  return (
                    <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-400 text-[10px]">{mov.id}</td>
                      <td className="p-3 font-mono text-gray-500 text-[10px]">{mov.timestamp}</td>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-gray-800">{art?.name || 'Article désactivé'}</span>
                          <span className="text-[9px] font-mono text-gray-400">SKU: {art?.sku} • {art ? categoriesMap[art.category] : 'Inconnu'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded font-black text-[9px] ${
                          mov.type === 'Entrée' ? 'bg-emerald-100 text-emerald-800' :
                          mov.type === 'Sortie' ? 'bg-red-100 text-red-800' :
                          mov.type === 'Ajustement' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {mov.type}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-gray-900">
                        {mov.type === 'Sortie' ? '-' : '+'}{mov.quantity} {art?.unit || 'Unité'}(s)
                      </td>
                      <td className="p-3 font-semibold text-gray-600 text-[11px]">{fromLoc}</td>
                      <td className="p-3 font-semibold text-gray-600 text-[11px]">{toLoc}</td>
                      <td className="p-3">
                        <span className="text-gray-700 italic font-medium">{mov.reason}</span>
                      </td>
                      <td className="p-3 font-bold text-[#423d38]">{mov.operator}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. EMPLACEMENTS SUB-TAB */}
      {activeSubTab === 'emplacements' && (
        <div className="flex flex-col gap-4 animate-scale-up">
          <div className="flex justify-between items-center bg-white p-4 border rounded-xl shadow-sm">
            <div>
              <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Warehouse className="w-4 h-4 text-emerald-600" />
                Dépôts et Magasins de Stockage
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Configuration des pièces d'inventaire physique de l'hôtel.</p>
            </div>

            <button 
              onClick={() => {
                setEmpName('');
                setEmpDesc('');
                setShowEmpModal(true);
              }}
              className="bg-[#fe6e00] hover:bg-[#e06100] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter un Dépôt
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emplacements.map(emp => {
              const artInEmp = articles.filter(a => a.isActive && (a.emplacementId === emp.id || getArticleStockInEmplacement(a.id, emp.id) > 0));
              const totalVal = artInEmp.reduce((sum, a) => sum + (getArticleStockInEmplacement(a.id, emp.id) * a.priceUnit), 0);
              const totalItems = artInEmp.reduce((sum, a) => sum + getArticleStockInEmplacement(a.id, emp.id), 0);
              
              return (
                <div key={emp.id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="border-b pb-2 flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-[#423d38] text-sm flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-[#fe6e00]" />
                        {emp.name}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">{emp.description}</p>
                    </div>
                    <span className="text-[9px] font-mono text-gray-400 font-bold bg-gray-100 px-2 py-0.5 rounded">{emp.id}</span>
                  </div>

                  <div className="flex flex-col gap-2 text-xs">
                    <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">État actuel du magasin :</span>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Références stockées :</span>
                      <span className="font-bold text-gray-800">{artInEmp.length} articles</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span className="text-gray-500">Quantité globale cumulée :</span>
                      <span className="font-mono font-black text-[#fe6e00]">{totalItems} unités</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valeur totale stockée :</span>
                      <span className="font-mono font-black text-emerald-700">{totalVal.toLocaleString()} FCFA</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. FOURNISSEURS SUB-TAB */}
      {activeSubTab === 'suppliers' && (
        <div className="flex flex-col gap-4 animate-scale-up">
          <div className="flex justify-between items-center bg-white p-4 border rounded-xl shadow-sm">
            <div>
              <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wide flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#fe6e00]" />
                Fiches et Répertoire Fournisseurs
              </h3>
              <p className="text-[11px] text-[#797067] mt-0.5">Carnet de contacts pour les réapprovisionnements de matériel.</p>
            </div>

            <button 
              onClick={() => {
                setSupName('');
                setSupContact('');
                setSupPhone('');
                setSupEmail('');
                setShowSupModal(true);
              }}
              className="bg-[#016630] hover:bg-[#025227] text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all text-xs cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Enregistrer Fournisseur
            </button>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase border-b text-[9px] tracking-wider">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Nom de l'Entreprise / Entité</th>
                  <th className="p-3">Contact Référent</th>
                  <th className="p-3">Numéro de Téléphone</th>
                  <th className="p-3">Adresse E-mail</th>
                  <th className="p-3 text-center">Nombre d'Articles Livrés</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {suppliers.map(sup => {
                  const artCount = articles.filter(a => a.isActive && a.supplierId === sup.id).length;
                  return (
                    <tr key={sup.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-400 text-[10px]">{sup.id}</td>
                      <td className="p-3 font-extrabold text-gray-800">{sup.name}</td>
                      <td className="p-3 font-semibold text-gray-700">{sup.contactName}</td>
                      <td className="p-3 font-mono text-gray-600 font-semibold">{sup.phone}</td>
                      <td className="p-3 font-mono text-[#fe6e00]">{sup.email}</td>
                      <td className="p-3 text-center">
                        <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {artCount} articles
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RAPPORTS DE CONSOMMATION SUB-TAB */}
      {activeSubTab === 'reports' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          
          {/* STATS SUMMARY CARD */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-extrabold text-gray-800 text-sm uppercase tracking-wide flex items-center gap-1.5 mb-3">
              <FileText className="w-4.5 h-4.5 text-[#fe6e00]" />
              Analyse des Sorties et Consommation d'Inventaire
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg border text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block text-[8px]">Consommation Totale (Sorties)</span>
                <span className="text-xl font-mono font-black text-red-600">
                  {movements.filter(m => m.type === 'Sortie').reduce((sum, m) => sum + m.quantity, 0)} unités
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block text-[8px]">Valorisation Financière Cumulée Sorties</span>
                <span className="text-xl font-mono font-black text-gray-900">
                  {movements.filter(m => m.type === 'Sortie').reduce((sum, m) => {
                    const art = articles.find(a => a.id === m.articleId);
                    return sum + (m.quantity * (art?.priceUnit || 0));
                  }, 0).toLocaleString()} FCFA
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border text-xs">
                <span className="text-gray-400 font-bold uppercase tracking-wider block text-[8px]">Valeur Stock Résiduel Actuel</span>
                <span className="text-xl font-mono font-black text-[#fe6e00]">
                  {totalValuation.toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>

          {/* TABLE OF CONSUMPTION BY CATEGORY */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h4 className="font-bold text-[#423d38] text-xs uppercase tracking-wider mb-3">Récapitulatif de Sortie par Article :</h4>
            <div className="overflow-hidden border rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 font-bold border-b text-[9px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Article</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3 text-right">Quantité Total Sortie</th>
                    <th className="p-3 text-right">Coût unitaire d'achat</th>
                    <th className="p-3 text-right">Coût Global de Consommation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.filter(a => a.isActive).map(art => {
                    const totalQtyExit = movements
                      .filter(m => m.articleId === art.id && m.type === 'Sortie')
                      .reduce((sum, m) => sum + m.quantity, 0);
                    const totalCost = totalQtyExit * art.priceUnit;

                    if (totalQtyExit === 0) return null;

                    return (
                      <tr key={art.id} className="hover:bg-gray-50">
                        <td className="p-3 font-extrabold text-gray-800">{art.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${categoriesBadgeColors[art.category]}`}>
                            {categoriesMap[art.category]}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-600">
                          {totalQtyExit} {art.unit}(s)
                        </td>
                        <td className="p-3 text-right font-mono font-semibold text-gray-500">
                          {art.priceUnit.toLocaleString()} F
                        </td>
                        <td className="p-3 text-right font-mono font-black text-gray-900">
                          {totalCost.toLocaleString()} FCFA
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODALS DE FORMULAIRES
      ========================================== */}
      
      {/* 1. MODAL ARTICLE (CREATE OR EDIT) */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-xs uppercase tracking-widest text-[#fe6e00]">
                {editingArticle ? 'Modifier l\'Article' : 'Ajouter un Article d\'Inventaire'}
              </span>
              <button onClick={() => setShowArticleModal(false)} className="text-white hover:text-[#fe6e00] font-bold text-base cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSaveArticle} className="p-5 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Désignation / Nom de l'Article :</label>
                  <input 
                    type="text" required placeholder="Ex: Café Arabica grains 1kg"
                    value={articleName} onChange={(e) => setArticleName(e.target.value)}
                    className="border rounded p-2 focus:outline-none focus:border-[#fe6e00]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Code SKU (Automatique) :</label>
                  <input 
                    type="text" required placeholder="Ex: HK-SAV-01"
                    value={articleSku} onChange={(e) => setArticleSku(e.target.value)}
                    className="border rounded p-2 font-mono font-bold bg-gray-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Catégorie Hôtelière :</label>
                  <select 
                    value={articleCategory} onChange={(e) => setArticleCategory(e.target.value as any)}
                    className="border rounded p-2 focus:outline-none"
                  >
                    {Object.keys(categoriesMap).map(key => (
                      <option key={key} value={key}>{categoriesMap[key]}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Unité de Comptage :</label>
                  <input 
                    type="text" required placeholder="Ex: Bouteille, Unité, Litre, Rouleau"
                    value={articleUnit} onChange={(e) => setArticleUnit(e.target.value)}
                    className="border rounded p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Seuil d'Alerte :</label>
                  <input 
                    type="number" required placeholder="Ex: 20"
                    value={articleMinStock} onChange={(e) => setArticleMinStock(e.target.value)}
                    className="border rounded p-2 font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Prix Achat (FCFA) :</label>
                  <input 
                    type="number" required placeholder="Ex: 150"
                    value={articlePrice} onChange={(e) => setArticlePrice(e.target.value)}
                    className="border rounded p-2 font-mono font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Emplacement dépôt :</label>
                  <select 
                    value={articleEmplacement} onChange={(e) => setArticleEmplacement(e.target.value)}
                    className="border rounded p-2"
                  >
                    {emplacements.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Fournisseur Attitré :</label>
                <select 
                  value={articleSupplier} onChange={(e) => setArticleSupplier(e.target.value)}
                  className="border rounded p-2"
                >
                  {suppliers.map(sup => (
                    <option key={sup.id} value={sup.id}>{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Description libre :</label>
                <textarea 
                  rows={2} placeholder="Précisez la marque, taille ou caractéristiques..."
                  value={articleDesc} onChange={(e) => setArticleDesc(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-4 mt-2">
                <button 
                  type="button" onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#fe6e00] hover:bg-[#e06100] text-white rounded font-bold"
                >
                  Sauvegarder l'Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL MOUVEMENT DE STOCK */}
      {showMovementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden animate-scale-up">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-xs uppercase tracking-widest text-[#fe6e00]">
                Enregistrer un Mouvement de Stock
              </span>
              <button onClick={() => setShowMovementModal(false)} className="text-white hover:text-[#fe6e00] font-bold text-base cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSaveMovement} className="p-5 flex flex-col gap-4 text-xs">
              
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Sélectionner l'Article d'Inventaire :</label>
                <select 
                  value={movArticleId} onChange={(e) => setMovArticleId(e.target.value)}
                  className="border rounded p-2 focus:outline-none font-bold text-gray-800"
                >
                  <option value="" disabled>-- Choisir un article --</option>
                  {articles.filter(a => a.isActive).map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.sku} • {categoriesMap[a.category]})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Type de Flux de Stock :</label>
                  <select 
                    value={movType} onChange={(e) => setMovType(e.target.value as any)}
                    className="border rounded p-2 focus:outline-none font-bold text-[#fe6e00]"
                  >
                    <option value="Entrée">Entrée (Achat, Réception, Don)</option>
                    <option value="Sortie">Sortie (Consommation, Casse, Vol)</option>
                    <option value="Transfert">Transfert Inter-dépôts</option>
                    <option value="Ajustement">Ajustement d'Inventaire (Correction)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Quantité Concernée :</label>
                  <input 
                    type="number" required placeholder="Ex: 50"
                    value={movQuantity} onChange={(e) => setMovQuantity(e.target.value)}
                    className="border rounded p-2 font-mono font-black text-sm"
                  />
                </div>
              </div>

              {/* DYNAMIC FORM RENDERING BASED ON FLUX TYPE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border">
                {(movType === 'Sortie' || movType === 'Transfert') && (
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-red-700 uppercase text-[9px]">Depuis quel Dépôt (Provenance) :</label>
                    <select 
                      value={movFromEmp} onChange={(e) => setMovFromEmp(e.target.value)}
                      className="border bg-white rounded p-1.5 focus:outline-none text-xs"
                      required
                    >
                      <option value="" disabled>-- Choisir dépôt provenance --</option>
                      {emplacements.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(movType === 'Entrée' || movType === 'Transfert' || movType === 'Ajustement') && (
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-emerald-700 uppercase text-[9px]">Vers quel Dépôt (Destination) :</label>
                    <select 
                      value={movToEmp} onChange={(e) => setMovToEmp(e.target.value)}
                      className="border bg-white rounded p-1.5 focus:outline-none text-xs"
                      required
                    >
                      <option value="" disabled>-- Choisir dépôt destination --</option>
                      {emplacements.map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Motif du Mouvement / Commentaire obligatoire :</label>
                <input 
                  type="text" required placeholder="Ex: Consommation housekeeping étages, Achat facture #78, Casse accidentelle"
                  value={movReason} onChange={(e) => setMovReason(e.target.value)}
                  className="border rounded p-2 text-xs"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Opérateur Responsable :</label>
                <input 
                  type="text" required
                  value={movOperator} onChange={(e) => setMovOperator(e.target.value)}
                  className="border rounded p-2 text-xs font-semibold bg-gray-50"
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-4 mt-2">
                <button 
                  type="button" onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-50 font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#016630] hover:bg-[#025227] text-white rounded font-bold"
                >
                  Enregistrer le Flux
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL EMPLACEMENT */}
      {showEmpModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-sm w-full overflow-hidden animate-scale-up">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-xs uppercase tracking-widest text-[#fe6e00]">
                Créer un Nouvel Emplacement
              </span>
              <button onClick={() => setShowEmpModal(false)} className="text-white hover:text-[#fe6e00] font-bold text-base cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSaveEmplacement} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Nom du Dépôt / Magasin :</label>
                <input 
                  type="text" required placeholder="Ex: Office Étage 2"
                  value={empName} onChange={(e) => setEmpName(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Description :</label>
                <textarea 
                  rows={3} required placeholder="Précisez la localisation ou l'usage..."
                  value={empDesc} onChange={(e) => setEmpDesc(e.target.value)}
                  className="border rounded p-2"
                />
              </div>

              <div className="flex gap-2 justify-end border-t pt-4 mt-2">
                <button 
                  type="button" onClick={() => setShowEmpModal(false)}
                  className="px-4 py-2 border rounded font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#fe6e00] text-white rounded font-bold"
                >
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. MODAL SUPPLIER */}
      {showSupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden animate-scale-up">
            <div className="bg-black text-white p-4 flex justify-between items-center">
              <span className="font-extrabold text-xs uppercase tracking-widest text-[#fe6e00]">
                Enregistrer un Nouveau Fournisseur
              </span>
              <button onClick={() => setShowSupModal(false)} className="text-white hover:text-[#fe6e00] font-bold text-base cursor-pointer">×</button>
            </div>

            <form onSubmit={handleSaveSupplier} className="p-5 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Nom de l'Entreprise :</label>
                <input 
                  type="text" required placeholder="Ex: ETS Koffi et Fils Bouaké"
                  value={supName} onChange={(e) => setSupName(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-bold text-gray-500 uppercase text-[9px]">Nom du Contact Référent :</label>
                <input 
                  type="text" required placeholder="Ex: M. Koffi Sylvestre"
                  value={supContact} onChange={(e) => setSupContact(e.target.value)}
                  className="border rounded p-2"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Numéro de Téléphone :</label>
                  <input 
                    type="text" required placeholder="Ex: +225 07..."
                    value={supPhone} onChange={(e) => setSupPhone(e.target.value)}
                    className="border rounded p-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-gray-500 uppercase text-[9px]">Adresse E-mail :</label>
                  <input 
                    type="email" required placeholder="Ex: commercial@ets-koffi.ci"
                    value={supEmail} onChange={(e) => setSupEmail(e.target.value)}
                    className="border rounded p-2"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end border-t pt-4 mt-2">
                <button 
                  type="button" onClick={() => setShowSupModal(false)}
                  className="px-4 py-2 border rounded font-bold"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#016630] text-white rounded font-bold"
                >
                  Sauvegarder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
