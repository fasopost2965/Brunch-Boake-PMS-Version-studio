import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  Globe, 
  Percent, 
  Sliders, 
  ShieldAlert, 
  Receipt, 
  Layout, 
  FileBarChart, 
  Mail, 
  Shield, 
  Layers, 
  Printer, 
  Database,
  Plus, 
  Trash2,
  FileCheck,
  Calculator,
  Info,
  Clock,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

import { Reservation, Room } from '../types';
import { BrunchLogo } from './BrunchLogo';

interface SettingsScreenProps {
  hotelConfig: {
    name: string;
    address: string;
    email: string;
    currency: string;
    prices: {
      [key: string]: number;
    };
    legal?: any;
    fiscal?: any;
    billing?: any;
    templates?: any;
    policies?: any;
    reports?: any;
    notifications?: any;
    security?: any;
    customFields?: any;
    printing?: any;
    backups?: any;
    formats?: any;
    otaSandbox?: any;
  };
  setHotelConfig: React.Dispatch<React.SetStateAction<any>>;
  triggerToast: (msg: string) => void;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  hotelConfig,
  setHotelConfig,
  triggerToast,
  reservations,
  setReservations,
  rooms,
  setRooms
}) => {
  // Navigation State - exactly the 14 sections requested
  const [activeTab, setActiveTab] = useState<string>('identite');

  // -------------------------------------------------------------
  // INITIALIZE EXTENDED STATES FROM HOTELCONFIG OR HARDCODED DEFAULTS
  // -------------------------------------------------------------
  
  // 1. Identité de l'établissement
  const [name, setName] = useState(hotelConfig.name || 'Brunch Bouaké');
  const [slogan, setSlogan] = useState(hotelConfig.legal?.slogan || 'L\'excellence hôtelière au cœur de Bouaké');
  const [description, setDescription] = useState(hotelConfig.legal?.description || 'Hôtel boutique de charme & restaurant brunch de référence.');
  const [email, setEmail] = useState(hotelConfig.email || 'contact@brunch-bouake.ci');
  const [phone, setPhone] = useState(hotelConfig.legal?.phone || '+225 07 00 11 22 33');
  const [website, setWebsite] = useState(hotelConfig.legal?.website || 'www.brunch-bouake.ci');
  const [address, setAddress] = useState(hotelConfig.address || 'Quartier Kennedy, Bouaké, Côte d\'Ivoire');

  // 2. Informations légales
  const [raisonSociale, setRaisonSociale] = useState(hotelConfig.legal?.raisonSociale || 'SARL BRUNCH BOUAKÉ HÔTELLERIE');
  const [rccm, setRccm] = useState(hotelConfig.legal?.rccm || 'CI-BKE-2026-B-129');
  const [nif, setNif] = useState(hotelConfig.legal?.nif || 'IFU-21004892Y');
  const [representative, setRepresentative] = useState(hotelConfig.legal?.representative || 'Jean-Marc Koffi');
  const [capitalSocial, setCapitalSocial] = useState(hotelConfig.legal?.capitalSocial || '10 000 000 F CFA');
  const [cancellationPolicy, setCancellationPolicy] = useState(hotelConfig.legal?.cancellationPolicy || 'Annulation gratuite jusqu\'à 24h avant l\'arrivée.');
  const [refundPolicy, setRefundPolicy] = useState(hotelConfig.legal?.refundPolicy || 'Remboursements effectués sous 5 jours ouvrables.');

  // 3. Fuseau horaire et formats
  const [timezone, setTimezone] = useState(hotelConfig.formats?.timezone || 'Africa/Abidjan (GMT)');
  const [dateFormat, setDateFormat] = useState(hotelConfig.formats?.dateFormat || 'DD/MM/YYYY');
  const [currency, setCurrency] = useState(hotelConfig.currency || 'FCFA');
  const [numberFormat, setNumberFormat] = useState(hotelConfig.formats?.numberFormat || 'space');

  // 4. Taxes et TVA
  const [taxes, setTaxes] = useState<any[]>(hotelConfig.fiscal?.taxes || [
    { id: 'tax-1', name: 'TVA Réglementaire', type: 'percentage', value: 18, category: 'Tous', active: true },
    { id: 'tax-2', name: 'Taxe de Séjour Bouaké', type: 'fixed', value: 1000, category: 'Hébergement', active: true },
    { id: 'tax-3', name: 'Taxe Touristique Locale', type: 'percentage', value: 2, category: 'Hébergement', active: true }
  ]);
  const [newTaxName, setNewTaxName] = useState('');
  const [newTaxType, setNewTaxType] = useState<'percentage' | 'fixed'>('percentage');
  const [newTaxValue, setNewTaxValue] = useState('');
  const [newTaxCategory] = useState('Tous');
  const [simBasePrice, setSimBasePrice] = useState('35000');
  const [simNights, setSimNights] = useState('3');
  const [simResults, setSimResults] = useState<any | null>(null);

  // 5. Politiques de prix
  const [standardPrice, setStandardPrice] = useState(String(hotelConfig.prices?.['Standard'] || 35000));
  const [deluxePrice, setDeluxePrice] = useState(String(hotelConfig.prices?.['Deluxe'] || 55000));
  const [suitePrice, setSuitePrice] = useState(String(hotelConfig.prices?.['Suite Royale'] || 95000));
  const [pavillonPrice, setPavillonPrice] = useState(String(hotelConfig.prices?.['Pavillon Brunch'] || 120000));
  const [weekendMultiplier, setWeekendMultiplier] = useState(hotelConfig.policies?.weekendMultiplier || '10');
  const [highSeasonMultiplier, setHighSeasonMultiplier] = useState(hotelConfig.policies?.highSeasonMultiplier || '20');
  const [lowSeasonMultiplier, setLowSeasonMultiplier] = useState(hotelConfig.policies?.lowSeasonMultiplier || '-10');

  // 6. Politiques de remise
  const [receptionistCap, setReceptionistCap] = useState(hotelConfig.policies?.receptionistCap || '5');
  const [managerCap, setManagerCap] = useState(hotelConfig.policies?.managerCap || '20');
  const [corporateDiscount, setCorporateDiscount] = useState(hotelConfig.policies?.corporateDiscount || '15');
  const [discountReasons, setDiscountReasons] = useState<string[]>(hotelConfig.policies?.discountReasons || ['Client VIP', 'Fidélité', 'Négociation commerciale', 'Erreur Service']);
  const [newReason, setNewReason] = useState('');

  // 7. Templates facture
  const [invoicePrefix, setInvoicePrefix] = useState(hotelConfig.billing?.invoicePrefix || 'FACT-');
  const [invoiceSequence, setInvoiceSequence] = useState(hotelConfig.billing?.invoiceSequence || '1048');
  const [folioPrefix, setFolioPrefix] = useState(hotelConfig.billing?.folioPrefix || 'FOL-');
  const [folioSequence, setFolioSequence] = useState(hotelConfig.billing?.folioSequence || '5024');
  const [roundingRule] = useState(hotelConfig.billing?.roundingRule || 'Standard');
  const [paperSize, setPaperSize] = useState(hotelConfig.billing?.paperSize || 'A4');
  const [headerStyle, setHeaderStyle] = useState(hotelConfig.templates?.headerStyle || 'side');
  const [showLogo, setShowLogo] = useState(hotelConfig.templates?.showLogo !== false);
  const [showTaxTable, setShowTaxTable] = useState(hotelConfig.templates?.showTaxTable !== false);
  const [showLegalNo, setShowLegalNo] = useState(hotelConfig.templates?.showLegalNo !== false);
  const [thankYouMessage, setThankYouMessage] = useState(hotelConfig.templates?.thankYouMessage || 'Merci infiniment pour votre confiance hôtelière !');

  // 8. Templates proforma / reçu
  const [proformaTitle, setProformaTitle] = useState(hotelConfig.templates?.proformaTitle || 'PRE-FACTURE ESTIMATIVE PROFORMA');
  const [proformaValidity, setProformaValidity] = useState(hotelConfig.templates?.proformaValidity || '15');
  const [showQRCode, setShowQRCode] = useState(hotelConfig.templates?.showQRCode !== false);
  const [receiptHeader, setReceiptHeader] = useState(hotelConfig.templates?.receiptHeader || 'REÇU DE SÉJOUR & SERVICES ACQUITTÉ');

  // 9. Paramètres de rapports - Expanded 6 Screens State
  const [reportPeriod, setReportPeriod] = useState(hotelConfig.reports?.period || 'Month');
  const [includeTaxesInStats, setIncludeTaxesInStats] = useState(hotelConfig.reports?.includeTaxes !== false);
  const [autoReportEmail] = useState(hotelConfig.reports?.autoReportEmail || 'compta@brunch-bouake.ci');
  
  const [reportsSubTab, setReportsSubTab] = useState<'generaux' | 'kpis' | 'filtres' | 'segments' | 'export' | 'schedules'>('generaux');
  
  // 9.1 Paramètres généraux
  const [reportNameDefault, setReportNameDefault] = useState(hotelConfig.reports?.reportNameDefault || 'Rapport de Synthèse Brunch Bouaké');
  const [reportCurrency, setReportCurrency] = useState(hotelConfig.reports?.currency || 'FCFA');
  const [reportTimezone, setReportTimezone] = useState(hotelConfig.reports?.timezone || 'GMT (Europe/London - Bouaké Local Time)');
  const [reportLanguage, setReportLanguage] = useState(hotelConfig.reports?.language || 'Français');
  const [reportDateFormat, setReportDateFormat] = useState(hotelConfig.reports?.dateFormat || 'DD/MM/YYYY');
  const [reportStartOfDay, setReportStartOfDay] = useState(hotelConfig.reports?.startOfDay || '07:00');
  const [reportAccountingClose, setReportAccountingClose] = useState(hotelConfig.reports?.accountingClose || '23:00');

  // 9.2 KPI et indicateurs
  const [activeKPIs, setActiveKPIs] = useState<Record<string, boolean>>(hotelConfig.reports?.activeKPIs || {
    occupation: true, adr: true, revpar: true, totalRev: true, roomRev: true, 
    extrasRev: true, fbRev: true, cancellationRate: true, pickup: true, 
    noshow: true, avgStay: true, paidAmount: true, openBalance: true
  });
  const [kpiOrder] = useState<string[]>(hotelConfig.reports?.kpiOrder || [
    'occupation', 'adr', 'revpar', 'totalRev', 'roomRev', 'extrasRev', 
    'fbRev', 'cancellationRate', 'pickup', 'noshow', 'avgStay', 'paidAmount', 'openBalance'
  ]);
  const [dashboardKPIs, setDashboardKPIs] = useState<Record<string, boolean>>(hotelConfig.reports?.dashboardKPIs || {
    occupation: true, adr: true, revpar: true, totalRev: true
  });
  const [defaultComparativeKPI, setDefaultComparativeKPI] = useState<string>(hotelConfig.reports?.defaultComparativeKPI || 'occupation');

  // 9.3 Filtres et périodes
  const [defaultFilters, setDefaultFilters] = useState<any>(hotelConfig.reports?.defaultFilters || {
    roomType: 'Tous', status: 'Tous', source: 'Tous', channel: 'Tous', client: 'Tous', department: 'Tous'
  });

  // 9.4 Segmentation
  const [segments, setSegments] = useState<any[]>(hotelConfig.reports?.segments || [
    { id: 'SEG-01', name: 'Segment Direct', rule: 'Source de réservation = Direct', isActive: true },
    { id: 'SEG-02', name: 'Segment Booking.com / OTA', rule: 'Canal = Booking.com', isActive: true },
    { id: 'SEG-03', name: 'Segment Corporate', rule: 'Type Client = Corporate', isActive: true },
    { id: 'SEG-04', name: 'Segment Local Bouaké', rule: 'Pays d\'origine = Côte d\'Ivoire', isActive: true }
  ]);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [newSegmentRule, setNewSegmentRule] = useState('Source de réservation = Direct');

  // 9.5 Export et impression
  const [exportHeaderTemplate, setExportHeaderTemplate] = useState(hotelConfig.reports?.exportHeaderTemplate || 'Standard d\'Établissement');
  const [exportShowLogo, setExportShowLogo] = useState(hotelConfig.reports?.exportShowLogo !== false);
  const [exportShowSignatures, setExportShowSignatures] = useState(hotelConfig.reports?.exportShowSignatures !== false);
  const [exportMentionLegale, setExportMentionLegale] = useState(hotelConfig.reports?.exportMentionLegale || 'Rapport comptable officiel Brunch Bouaké. Soumis aux règles fiscales.');
  const [exportFooterText, setExportFooterText] = useState(hotelConfig.reports?.exportFooterText || 'Page {page} de {total}');
  const [exportShowCover, setExportShowCover] = useState(hotelConfig.reports?.exportShowCover || false);
  const [exportPageNumbering, setExportPageNumbering] = useState(hotelConfig.reports?.exportPageNumbering !== false);

  // 9.6 Rapports automatiques
  const [schedules, setSchedules] = useState<any[]>(hotelConfig.reports?.schedules || [
    { id: 'SCH-01', type: 'daily', time: '08:00', recipients: 'direction@brunch-bouake.ci, compta@brunch-bouake.ci', format: 'PDF', enabled: true },
    { id: 'SCH-02', type: 'weekly', time: '23:30', recipients: 'gestion@brunch-bouake.ci', format: 'Excel', enabled: true }
  ]);
  const [newScheduleType, setNewScheduleType] = useState('daily');
  const [newScheduleTime, setNewScheduleTime] = useState('08:00');
  const [newScheduleRecipients, setNewScheduleRecipients] = useState('');
  const [newScheduleFormat, setNewScheduleFormat] = useState('PDF');


  // 10. Notifications
  const [sendOnBooking, setSendOnBooking] = useState(hotelConfig.notifications?.sendOnBooking !== false);
  const [sendOnCheckout, setSendOnCheckout] = useState(hotelConfig.notifications?.sendOnCheckout !== false);
  const [emailSignature, setEmailSignature] = useState(hotelConfig.notifications?.emailSignature || 'Chaleureusement,\nL\'équipe de Réception - Brunch Bouaké\ncontact@brunch-bouake.ci');
  const [selectedNotificationId, setSelectedNotificationId] = useState('booking_confirm');
  const [notificationTemplates, setNotificationTemplates] = useState<any[]>(hotelConfig.notifications?.templates || [
    {
      id: 'booking_confirm',
      title: 'Confirmation de Réservation',
      subject: 'Confirmation de séjour - {hotel_name}',
      body: 'Bonjour {guest_name},\n\nNous sommes heureux de confirmer votre séjour pour la chambre {room_number} du {check_in} au {check_out}.\nLe montant estimé s\'élève à {total_amount} FCFA.\n\nNous nous tenons à votre disposition pour toute navette depuis l\'aéroport ou demande de brunch.'
    },
    {
      id: 'checkout_thanks',
      title: 'Remerciement fin de séjour',
      subject: 'Merci pour votre séjour - {hotel_name}',
      body: 'Bonjour {guest_name},\n\nNous espérons que votre séjour s\'est bien déroulé.\nVous trouverez ci-joint la facture définitive acquittée.\n\nAu plaisir de vous recevoir à nouveau à Bouaké.'
    }
  ]);

  // 11. Sécurité et accès (includes role password & channel sandbox connector)
  const [managerPassword, setManagerPassword] = useState(hotelConfig.security?.managerPassword || 'BOUAKE2026');
  const [operatorRole] = useState(hotelConfig.security?.operatorRole || 'Super Administrateur');
  const [ipRestriction, setIpRestriction] = useState(hotelConfig.security?.ipRestriction || false);
  const [simProvider, setSimProvider] = useState<string>(hotelConfig.otaSandbox?.provider || 'Channex');
  const [simApiKey, setSimApiKey] = useState<string>(hotelConfig.otaSandbox?.apiKey || 'cx_sandbox_sk_8f7b2e10a99c4d2891f7a01c8b7473');
  const [simChannel] = useState<string>('Booking.com');
  const [simRoomType, setSimRoomType] = useState<string>('Standard');
  const [simGuestName, setSimGuestName] = useState<string>('Marie-Dominique Kalou');
  const [simGuestEmail] = useState<string>('m.kalou@yahoo.fr');
  const [simOriginCountry] = useState<string>("Côte d'Ivoire");
  const [simNightsCount] = useState<string>('3');
  const [simulating, setSimulating] = useState<boolean>(false);
  const [simConsoleLogs, setSimConsoleLogs] = useState<string[]>([
    '-- CONSOLE DÉVELOPPEUR SANDBOX PRÊTE --',
    '[INFO] Simulateur de remontée OTA initialisé avec succès.',
    '[INFO] Prêt à émuler les webhooks de Channex et Zodomus.'
  ]);

  // 12. Champs personnalisés
  const [customFields, setCustomFields] = useState<any[]>(hotelConfig.customFields?.fields || [
    { id: 'cf-1', target: 'Réservation', name: 'Numéro de plaque d\'immatriculation', type: 'text', required: false },
    { id: 'cf-2', target: 'Client', name: 'Allergies ou Régime Spécial', type: 'text', required: false }
  ]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldTarget, setNewFieldTarget] = useState('Réservation');
  const [newFieldType, setNewFieldType] = useState('text');

  // 13. Documents et impression
  const [stampText, setStampText] = useState(hotelConfig.printing?.stampText || 'PAYÉ - BRUNCH BOUAKÉ');
  const [stampColor, setStampColor] = useState(hotelConfig.printing?.stampColor || '#016630');
  const [showSignature, setShowSignature] = useState(hotelConfig.printing?.showSignature !== false);
  const [signatureName, setSignatureName] = useState(hotelConfig.printing?.signatureName || 'La Direction - Brunch Bouaké');

  // 14. Sauvegarde et publication
  const [backups, setBackups] = useState<any[]>(hotelConfig.backups?.list || [
    { id: 'back-1', date: '2026-07-10 14:32', user: 'Admin Jean', desc: 'Sauvegarde d\'initialisation fiscale de Bouaké' },
    { id: 'back-2', date: '2026-07-11 11:20', user: 'Comptabilité', desc: 'Ajustement de la grille des tarifs haute saison' }
  ]);
  const [newBackupDesc, setNewBackupDesc] = useState('');

  // -------------------------------------------------------------
  // EVENT HANDLERS
  // -------------------------------------------------------------
  const handleSaveAllSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const updatedConfig = {
      name,
      address,
      email,
      currency,
      prices: {
        'Standard': Number(standardPrice) || 35000,
        'Deluxe': Number(deluxePrice) || 55000,
        'Suite Royale': Number(suitePrice) || 95000,
        'Pavillon Brunch': Number(pavillonPrice) || 120000
      },
      legal: {
        phone,
        website,
        slogan,
        description,
        raisonSociale,
        rccm,
        nif,
        representative,
        capitalSocial,
        cancellationPolicy,
        refundPolicy
      },
      formats: {
        timezone,
        dateFormat,
        numberFormat
      },
      fiscal: {
        taxes
      },
      billing: {
        invoicePrefix,
        invoiceSequence,
        folioPrefix,
        folioSequence,
        roundingRule,
        paperSize
      },
      templates: {
        headerStyle,
        showLogo,
        showTaxTable,
        showLegalNo,
        showQRCode,
        thankYouMessage,
        proformaTitle,
        proformaValidity,
        receiptHeader
      },
      policies: {
        weekendMultiplier,
        highSeasonMultiplier,
        lowSeasonMultiplier,
        corporateDiscount,
        receptionistCap,
        managerCap,
        discountReasons
      },
      notifications: {
        sendOnBooking,
        sendOnCheckout,
        emailSignature,
        templates: notificationTemplates
      },
      reports: {
        period: reportPeriod,
        includeTaxes: includeTaxesInStats,
        autoReportEmail,
        reportNameDefault,
        currency: reportCurrency,
        timezone: reportTimezone,
        language: reportLanguage,
        dateFormat: reportDateFormat,
        startOfDay: reportStartOfDay,
        accountingClose: reportAccountingClose,
        activeKPIs,
        kpiOrder,
        dashboardKPIs,
        defaultComparativeKPI,
        defaultFilters,
        segments,
        exportHeaderTemplate,
        exportShowLogo,
        exportShowSignatures,
        exportMentionLegale,
        exportFooterText,
        exportShowCover,
        exportPageNumbering,
        schedules
      },
      security: {
        managerPassword,
        operatorRole,
        ipRestriction
      },
      customFields: {
        fields: customFields
      },
      printing: {
        stampText,
        stampColor,
        showSignature,
        signatureName
      },
      backups: {
        list: backups
      },
      otaSandbox: {
        provider: simProvider,
        apiKey: simApiKey
      }
    };

    setHotelConfig(updatedConfig);
    triggerToast('Configuration globale du PMS mise à jour avec succès !');
  };

  // 14. Sauvegarde - manual backups
  const handleCreateBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBackupDesc) return;
    const newB = {
      id: `back-${Date.now()}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      user: 'Super Administrateur',
      desc: newBackupDesc
    };
    setBackups([newB, ...backups]);
    setNewBackupDesc('');
    triggerToast('Point de sauvegarde enregistré localement.');
  };

  const handleResetSystem = () => {
    if (confirm('Attention : cela supprimera tous les clients, réservations, paiements et configurations enregistrés pour rétablir les données de démonstration d’usine. Continuer ?')) {
      localStorage.clear();
      triggerToast('Toutes les données locales ont été vidées. Rechargement...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // 4. Taxes & TVA - active taxes logic
  const handleAddTax = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxName || !newTaxValue) return;
    const valueNum = Number(newTaxValue) || 0;
    const newTax = {
      id: `tax-${Date.now()}`,
      name: newTaxName,
      type: newTaxType,
      value: valueNum,
      category: newTaxCategory,
      active: true
    };
    setTaxes([...taxes, newTax]);
    setNewTaxName('');
    setNewTaxValue('');
    triggerToast(`Nouvelle taxe ajoutée : ${newTaxName}`);
  };

  const handleToggleTax = (id: string) => {
    setTaxes(taxes.map(t => t.id === id ? { ...t, active: !t.active } : t));
  };

  const handleDeleteTax = (id: string) => {
    setTaxes(taxes.filter(t => t.id !== id));
  };

  // 4. Taxes & TVA - simulator
  const handleRunSimulation = () => {
    const base = Number(simBasePrice) || 0;
    const nightsNum = Number(simNights) || 1;
    const lodgingTotal = base * nightsNum;
    
    let computedTaxes: any[] = [];
    let totalTaxAmount = 0;

    taxes.forEach(t => {
      if (!t.active) return;
      let calculatedValue = 0;
      if (t.type === 'percentage') {
        calculatedValue = Math.round(lodgingTotal * (t.value / 100));
      } else {
        calculatedValue = t.value * nightsNum;
      }
      totalTaxAmount += calculatedValue;
      computedTaxes.push({
        name: t.name,
        formula: t.type === 'percentage' ? `${t.value}% sur séjour` : `${t.value.toLocaleString()} FCFA / nuitée`,
        amount: calculatedValue
      });
    });

    setSimResults({
      base: lodgingTotal,
      taxes: computedTaxes,
      totalTaxes: totalTaxAmount,
      grandTotal: lodgingTotal + totalTaxAmount
    });
  };

  // 6. Remises - reasons logic
  const handleAddDiscountReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason) return;
    if (!discountReasons.includes(newReason)) {
      setDiscountReasons([...discountReasons, newReason]);
      setNewReason('');
      triggerToast(`Nouveau motif de remise ajouté : ${newReason}`);
    }
  };

  const handleDeleteReason = (reason: string) => {
    setDiscountReasons(discountReasons.filter(r => r !== reason));
  };

  // 12. Champs Personnalisés
  const handleAddCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName) return;
    const newCF = {
      id: `cf-${Date.now()}`,
      target: newFieldTarget,
      name: newFieldName,
      type: newFieldType,
      required: false
    };
    setCustomFields([...customFields, newCF]);
    setNewFieldName('');
    triggerToast(`Champ personnalisé ajouté pour : ${newFieldTarget}`);
  };

  const handleDeleteCustomField = (id: string) => {
    setCustomFields(customFields.filter(cf => cf.id !== id));
  };

  // 11. Sécurité et accès - webhook simulation
  const handleSimulateBooking = () => {
    setSimulating(true);
    const nights = Number(simNightsCount) || 1;
    
    const addLog = (msg: string) => {
      setSimConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    addLog(`Émulation d'appel API Webhook depuis ${simProvider} Sandbox...`);
    
    setTimeout(() => {
      const targetRooms = rooms.filter(r => r.type === simRoomType);
      if (targetRooms.length === 0) {
        addLog(`[ERREUR API] Mappage impossible : aucun type de chambre "${simRoomType}" configuré dans le PMS.`);
        setSimulating(false);
        return;
      }

      const assignedRoom = targetRooms.find(r => r.status === 'Libre') || targetRooms[0];
      const isForced = !targetRooms.some(r => r.status === 'Libre');

      if (isForced) {
        addLog(`[ALERTE] Aucune chambre libre de type "${simRoomType}". Attribution forcée à la CH ${assignedRoom.id}.`);
      } else {
        addLog(`[SUCCÈS MAPPAGE] Chambre libre identifiée : CH ${assignedRoom.id} (${simRoomType}).`);
      }

      const checkInStr = '2026-07-11';
      const checkoutDate = new Date(checkInStr);
      checkoutDate.setDate(checkoutDate.getDate() + nights);
      const checkOutStr = checkoutDate.toISOString().split('T')[0];
      const totalBill = assignedRoom.price * nights;
      const otaRef = `${simChannel.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newResId = `RES-${String(reservations.length + 1).padStart(3, '0')}`;

      const otaReservation: Reservation = {
        id: newResId,
        guestName: simGuestName,
        guestEmail: simGuestEmail,
        roomNumber: assignedRoom.id,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        totalBill: totalBill,
        paidAmount: 0,
        status: 'Confirmé',
        bookingSource: simChannel === 'Direct Website' ? 'Direct' : 'OTA',
        channelType: simChannel === 'Direct Website' ? 'Direct' : 'OTA',
        channelName: simChannel,
        otaReference: otaRef,
        originCountry: simOriginCountry,
        createdFrom: `${simProvider} Sandbox`
      };

      setReservations(prev => [otaReservation, ...prev]);
      setRooms(prev => prev.map(r => r.id === assignedRoom.id ? { ...r, status: 'Occupé' } : r));

      addLog(`[WEBHOOK HTTP POST] Réception sur l'URL d'écoute du PMS :/api/v1/channels/booking`);
      addLog(`[WEBHOOK HEADERS] Authorization: Bearer ${simApiKey.substring(0, 16)}...`);
      addLog(`[PMS INGEST] Injection réussie ! Réservation ${otaReservation.id} créée avec succès.`);
      setSimulating(false);
      triggerToast(`Réservation simulée via ${simChannel} (${otaRef}) remontée avec succès !`);
    }, 1200);
  };

  const handleClearConsoleLogs = () => {
    setSimConsoleLogs([
      `[INFO] Console vidée le ${new Date().toLocaleTimeString()}`,
      `[INFO] Prêt pour un nouvel essai d'intégration.`
    ]);
  };

  // Helper template renderer
  const handleUpdateTemplateText = (id: string, text: string) => {
    setNotificationTemplates(notificationTemplates.map(nt => nt.id === id ? { ...nt, body: text } : nt));
  };

  const activeTemplateObj = notificationTemplates.find(nt => nt.id === selectedNotificationId) || notificationTemplates[0];

  // 14 Ordered Sidebar items
  const tabsList = [
    { id: 'identite', title: '1. Identité Établissement', desc: 'Logo, nom, contacts, adresse', icon: Building2 },
    { id: 'legale', title: '2. Informations Légales', desc: 'Raison sociale, RCCM, NIF, capital', icon: FileText },
    { id: 'formats', title: '3. Fuseau & Formats', desc: 'Devises, fuseau horaire, dates', icon: Globe },
    { id: 'taxes', title: '4. Taxes et TVA', desc: 'TVA, taxe séjour, simulateur local', icon: Percent },
    { id: 'prix', title: '5. Politiques de Prix', desc: 'Grille tarifaire, weekends, saisons', icon: Sliders },
    { id: 'remise', title: '6. Politiques de Remise', desc: 'Plafonds de réduction, motifs VIP', icon: ShieldAlert },
    { id: 'facture', title: '7. Templates Facture', desc: 'Design, entêtes folios, A4 vs Ticket', icon: Receipt },
    { id: 'proforma', title: '8. Templates Proforma / Reçu', desc: 'Devis proforma, validité, QR Codes', icon: Layout },
    { id: 'rapports', title: '9. Paramètres de Rapports', desc: 'Périodes, emails, agrégation taxes', icon: FileBarChart },
    { id: 'notifications', title: '10. Notifications', desc: 'Triggers, modèles d\'emails, signature', icon: Mail },
    { id: 'securite', title: '11. Sécurité et Accès', desc: 'Mots de passe, API Sandbox', icon: Shield },
    { id: 'champs', title: '12. Champs Personnalisés', desc: 'Champs d\'objets PMS personnalisables', icon: Layers },
    { id: 'documents', title: '13. Documents & Impression', desc: 'Cachets administratifs, signatures', icon: Printer },
    { id: 'sauvegarde', title: '14. Sauvegarde & Publication', desc: 'Restauration, réinitialisation usine', icon: Database }
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-xs" id="settings_screen">
      
      {/* SCREEN HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e3e0dd] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
            <BrunchLogo size={55} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#423d38] tracking-tight flex items-center gap-2">
              Console de Configuration & Paramétrage PMS
            </h2>
            <p className="text-xs text-[#797067]">
              Module d'administration officiel de <strong className="text-[#fe6e00]">Brunch Bouaké</strong> pour réguler l'ensemble des politiques, formats et documents légaux.
            </p>
          </div>
        </div>

        <button 
          onClick={() => handleSaveAllSettings()}
          className="bg-[#016630] hover:bg-[#025227] text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start lg:self-center text-xs"
        >
          <FileCheck className="w-4 h-4" />
          Sauvegarder Global
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: 14 NAVIGATION ITEMS BAR (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-1.5 max-h-[750px] overflow-y-auto pr-1">
          <span className="text-[10px] font-bold text-[#797067] uppercase tracking-widest px-2 mb-1">Sections de Configuration</span>
          {tabsList.map(tab => {
            const IconComp = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-white border-[#fe6e00] text-[#fe6e00] shadow-sm font-bold' 
                    : 'bg-transparent border-transparent hover:bg-white/40 text-[#797067]'
                }`}
              >
                <div className={`p-1.5 rounded-md mt-0.5 ${isSelected ? 'bg-[#fe6e00]/10 text-[#fe6e00]' : 'bg-gray-100 text-[#797067]'}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className={`text-[11px] ${isSelected ? 'font-black' : 'font-semibold text-gray-700'}`}>{tab.title}</span>
                  <span className="text-[9px] opacity-80 font-normal leading-normal">{tab.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT COLUMN: ACTIVE TAB PANEL (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#e3e0dd] rounded-xl p-6 shadow-sm min-h-[500px]">
          
          {/* 1. IDENTITE DE L'ETABLISSEMENT */}
          {activeTab === 'identite' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4.5 h-4.5 text-[#fe6e00]" /> 1. Identité de l'Établissement
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Identité visuelle de Brunch Bouaké et coordonnées de contact principales.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom commercial :</label>
                  <input 
                    type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Slogan commercial :</label>
                  <input 
                    type="text" value={slogan} onChange={(e) => setSlogan(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Téléphone direct :</label>
                  <input 
                    type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Site Internet :</label>
                  <input 
                    type="text" value={website} onChange={(e) => setWebsite(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">E-mail principal :</label>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Adresse géographique :</label>
                  <input 
                    type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Brève description :</label>
                  <textarea 
                    rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none"
                  />
                </div>
              </div>

              {/* Logo Preview box */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-5">
                <BrunchLogo size={90} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-[#423d38]">Logo Officiel Actif</span>
                  <p className="text-[10px] text-[#797067] leading-relaxed">
                    Le logo de <strong className="text-[#fe6e00]">Brunch Resto-Bar VIP</strong> est incorporé à la base de données du PMS. Il apparaît sur l'ensemble de vos folios, pré-factures proforma, et rapports.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-[#dcfce7] text-[#016630] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-[#016630]/20">Haute Définition Vectorielle SVG</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. INFORMATIONS LEGALES */}
          {activeTab === 'legale' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-[#fe6e00]" /> 2. Informations Légales Administratives
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Données fiscales officielles obligatoires pour l'établissement des factures comptables en Côte d'Ivoire.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Raison Sociale :</label>
                  <input 
                    type="text" required value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-bold"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Registre du Commerce (RCCM) :</label>
                  <input 
                    type="text" required value={rccm} onChange={(e) => setRccm(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Numéro NIF / IFU Fiscal :</label>
                  <input 
                    type="text" required value={nif} onChange={(e) => setNif(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Représentant Légal :</label>
                  <input 
                    type="text" value={representative} onChange={(e) => setRepresentative(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Capital Social :</label>
                  <input 
                    type="text" value={capitalSocial} onChange={(e) => setCapitalSocial(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Politique d'Annulation de séjour :</label>
                <textarea 
                  rows={2} value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Politique de Remboursement :</label>
                <textarea 
                  rows={2} value={refundPolicy} onChange={(e) => setRefundPolicy(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2"
                />
              </div>
            </div>
          )}

          {/* 3. FUSEAU HORAIRE ET FORMATS */}
          {activeTab === 'formats' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-4.5 h-4.5 text-[#fe6e00]" /> 3. Fuseau Horaire & Formats Globaux
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Configuration régionale pour les dates, devises et heures.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Fuseau Horaire Local :</label>
                  <select 
                    value={timezone} onChange={(e) => setTimezone(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none"
                  >
                    <option value="Africa/Abidjan (GMT)">Afrique/Abidjan (GMT / UTC+0)</option>
                    <option value="Africa/Dakar (GMT)">Afrique/Dakar (GMT / UTC+0)</option>
                    <option value="Europe/Paris (GMT+1)">Europe/Paris (CET / UTC+1)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Format de Date :</label>
                  <select 
                    value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2"
                  >
                    <option value="DD/MM/YYYY">JJ/MM/AAAA (Standard Français)</option>
                    <option value="YYYY-MM-DD">AAAA-MM-JJ (ISO 8601)</option>
                    <option value="MM/DD/YYYY">MM/JJ/AAAA (US)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Devise monétaire par défaut :</label>
                  <select 
                    value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none font-bold"
                  >
                    <option value="FCFA">F CFA (Franc CFA - XOF)</option>
                    <option value="EUR">€ (Euro - EUR)</option>
                    <option value="USD">$ (Dollar US - USD)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Séparateur de milliers :</label>
                  <select 
                    value={numberFormat} onChange={(e) => setNumberFormat(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2"
                  >
                    <option value="space">Espace (ex: 35 000 F CFA)</option>
                    <option value="comma">Virgule (ex: 35,000 F CFA)</option>
                    <option value="dot">Point (ex: 35.000 F CFA)</option>
                  </select>
                </div>
              </div>

              <div className="bg-[#fef9c2]/30 border border-[#fe6e00]/20 p-4 rounded-xl flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#fe6e00] shrink-0 mt-0.5" />
                <p className="text-[10px] text-[#797067] leading-relaxed">
                  L'horodatage actuel basé sur votre fuseau est calé sur l'heure de Bouaké. Tous les journaux d'historique s'adapteront à ces paramètres de rendu.
                </p>
              </div>
            </div>
          )}

          {/* 4. TAXES ET TVA */}
          {activeTab === 'taxes' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="w-4.5 h-4.5 text-[#fe6e00]" /> 4. Taxes et TVA Réglementaires
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Registre de prélèvement de la fiscalité hôtelière active de Côte d'Ivoire.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e3e0dd] text-[#797067] uppercase tracking-wider text-[9px] font-bold">
                      <th className="py-2">Nom Taxe</th>
                      <th className="py-2">Type</th>
                      <th className="py-2">Valeur</th>
                      <th className="py-2">Catégorie</th>
                      <th className="py-2 text-center">Statut</th>
                      <th className="py-2 text-right">Effacer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.map(t => (
                      <tr key={t.id} className="border-b border-[#f3f4f6] text-[#423d38] hover:bg-gray-50 font-medium">
                        <td className="py-2 font-bold">{t.name}</td>
                        <td className="py-2 text-[#797067] text-[10px]">{t.type === 'percentage' ? 'Pourcentage (%)' : 'Montant Fixe'}</td>
                        <td className="py-2 font-mono font-bold">{t.value.toLocaleString()} {t.type === 'percentage' ? '%' : 'FCFA'}</td>
                        <td className="py-2 text-[10px]"><span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-bold">{t.category}</span></td>
                        <td className="py-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleTax(t.id)}
                            className={`px-2 py-0.5 rounded-full font-bold text-[8px] uppercase border cursor-pointer ${
                              t.active ? 'bg-[#dcfce7] text-[#016630] border-[#016630]/20' : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {t.active ? 'Actif' : 'Inactif'}
                          </button>
                        </td>
                        <td className="py-2 text-right">
                          <button type="button" onClick={() => handleDeleteTax(t.id)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Tax Form */}
              <div className="bg-[#f3f4f6]/60 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-2.5">
                <span className="font-bold text-[9px] uppercase text-[#797067]">Ajouter une taxe additionnelle :</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input 
                    type="text" placeholder="Nom (Ex: TVA Locale)" value={newTaxName} onChange={(e) => setNewTaxName(e.target.value)}
                    className="bg-white border border-[#e3e0dd] rounded p-1.5 text-xs"
                  />
                  <select 
                    value={newTaxType} onChange={(e: any) => setNewTaxType(e.target.value)}
                    className="bg-white border border-[#e3e0dd] rounded p-1.5 text-xs font-semibold"
                  >
                    <option value="percentage">Pourcentage (%)</option>
                    <option value="fixed">Montant Fixe (FCFA)</option>
                  </select>
                  <input 
                    type="number" placeholder="Valeur" value={newTaxValue} onChange={(e) => setNewTaxValue(e.target.value)}
                    className="bg-white border border-[#e3e0dd] rounded p-1.5 text-xs font-mono"
                  />
                  <button type="button" onClick={handleAddTax} className="bg-[#016630] text-white rounded font-bold text-center py-1.5 cursor-pointer flex items-center justify-center gap-1 text-xs">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
              </div>

              {/* Interactive Live Tax Calculator */}
              <div className="border border-dashed border-[#e3e0dd] p-3 rounded-xl">
                <span className="font-extrabold text-[9px] uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#fe6e00]" /> Simulateur Fiscal en Temps Réel
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                  <div>
                    <label className="text-[9px] text-[#797067]">Prix HT (FCFA) :</label>
                    <input type="number" value={simBasePrice} onChange={(e) => setSimBasePrice(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded w-full p-1.5 font-mono" />
                  </div>
                  <div>
                    <label className="text-[9px] text-[#797067]">Nuitées :</label>
                    <input type="number" value={simNights} onChange={(e) => setSimNights(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded w-full p-1.5 font-mono" />
                  </div>
                  <button type="button" onClick={handleRunSimulation} className="bg-[#fe6e00] text-white font-bold rounded py-2 self-end text-xs">
                    Simuler le Calcul
                  </button>
                </div>

                {simResults && (
                  <div className="bg-[#fef9c2]/20 border border-[#fe6e00]/10 p-3 rounded-lg mt-3 font-mono text-[10px]">
                    <div className="flex justify-between border-b pb-1 font-bold"><span>Total d'Hébergement HT :</span><span>{simResults.base.toLocaleString()} FCFA</span></div>
                    {simResults.taxes.map((t: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-gray-500 py-0.5"><span>+ {t.name} ({t.formula}) :</span><span>{t.amount.toLocaleString()} FCFA</span></div>
                    ))}
                    <div className="flex justify-between border-t pt-1 font-black text-xs text-[#fe6e00] mt-1"><span>Total TTC estimé :</span><span>{simResults.grandTotal.toLocaleString()} FCFA</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. POLITIQUES DE PRIX */}
          {activeTab === 'prix' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4.5 h-4.5 text-[#fe6e00]" /> 5. Politiques de Prix & Grille Hôtelière
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Ajustement de la grille tarifaire standard des types de chambres.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Chambre Standard (FCFA) :</label>
                  <input type="number" value={standardPrice} onChange={(e) => setStandardPrice(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Chambre Deluxe (FCFA) :</label>
                  <input type="number" value={deluxePrice} onChange={(e) => setDeluxePrice(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Suite Royale (FCFA) :</label>
                  <input type="number" value={suitePrice} onChange={(e) => setSuitePrice(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Pavillon Brunch (FCFA) :</label>
                  <input type="number" value={pavillonPrice} onChange={(e) => setPavillonPrice(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
              </div>

              <div className="bg-[#f3f4f6]/60 p-4 rounded-xl border border-[#e3e0dd] flex flex-col gap-3">
                <span className="font-bold text-[9px] uppercase tracking-wider text-[#797067]">Multiplicateurs et coefficients saisonniers :</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#797067]">Majoration Weekend (%) :</label>
                    <input type="number" value={weekendMultiplier} onChange={(e) => setWeekendMultiplier(e.target.value)} className="bg-white border rounded p-1.5 font-mono" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#797067]">Haute Saison (%) :</label>
                    <input type="number" value={highSeasonMultiplier} onChange={(e) => setHighSeasonMultiplier(e.target.value)} className="bg-white border rounded p-1.5 font-mono" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-[#797067]">Basse Saison (%) :</label>
                    <input type="number" value={lowSeasonMultiplier} onChange={(e) => setLowSeasonMultiplier(e.target.value)} className="bg-white border rounded p-1.5 font-mono" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 6. POLITIQUES DE REMISE */}
          {activeTab === 'remise' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4.5 h-4.5 text-[#fe6e00]" /> 6. Politiques & Caps de Remise
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Encadrement réglementaire des remises commerciales accordées aux clients.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 bg-gray-50 p-3 rounded-lg border">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Cap Réceptionniste (%) :</label>
                  <input type="number" value={receptionistCap} onChange={(e) => setReceptionistCap(e.target.value)} className="bg-white border rounded-md p-1.5 font-mono mt-1 font-bold" />
                  <span className="text-[8px] text-[#797067] mt-1 leading-normal">Seuil autonome maximal de l'accueil.</span>
                </div>
                <div className="flex flex-col gap-1 bg-gray-50 p-3 rounded-lg border">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Cap Directeur (%) :</label>
                  <input type="number" value={managerCap} onChange={(e) => setManagerCap(e.target.value)} className="bg-white border rounded-md p-1.5 font-mono mt-1 font-bold" />
                  <span className="text-[8px] text-[#797067] mt-1 leading-normal">Seuil autonome maximal de la direction.</span>
                </div>
                <div className="flex flex-col gap-1 bg-gray-50 p-3 rounded-lg border">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Remise Corporate (%) :</label>
                  <input type="number" value={corporateDiscount} onChange={(e) => setCorporateDiscount(e.target.value)} className="bg-white border rounded-md p-1.5 font-mono mt-1 font-bold" />
                  <span className="text-[8px] text-[#797067] mt-1 leading-normal">Taux de remise standard partenaires.</span>
                </div>
              </div>

              <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
                <span className="font-bold text-[9px] uppercase tracking-wider text-[#797067]">Motifs de remise commercial approuvés :</span>
                <div className="flex flex-wrap gap-2">
                  {discountReasons.map((r, idx) => (
                    <span key={idx} className="bg-gray-100 px-2.5 py-1 rounded-full text-gray-700 font-semibold flex items-center gap-1.5">
                      {r}
                      <button type="button" onClick={() => handleDeleteReason(r)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                    </span>
                  ))}
                </div>
                <form onSubmit={handleAddDiscountReason} className="flex gap-2">
                  <input 
                    type="text" required placeholder="Nouveau motif (Ex: Geste Commercial)" value={newReason} onChange={(e) => setNewReason(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-1.5 text-xs flex-1"
                  />
                  <button type="submit" className="bg-[#fe6e00] text-white px-4 py-1.5 rounded font-bold text-xs">Ajouter motif</button>
                </form>
              </div>
            </div>
          )}

          {/* 7. TEMPLATES FACTURE */}
          {activeTab === 'facture' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4.5 h-4.5 text-[#fe6e00]" /> 7. Configuration des Factures & Numérotation
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Séquençage comptable et styles d'impression.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Préfixe Factures :</label>
                  <input type="text" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Séquence Facture :</label>
                  <input type="number" value={invoiceSequence} onChange={(e) => setInvoiceSequence(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Préfixe Folios :</label>
                  <input type="text" value={folioPrefix} onChange={(e) => setFolioPrefix(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Séquence Folios :</label>
                  <input type="number" value={folioSequence} onChange={(e) => setFolioSequence(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Format d'Impression :</label>
                  <select value={paperSize} onChange={(e) => setPaperSize(e.target.value)} className="bg-white border rounded p-1.5 font-bold">
                    <option value="A4">A4 Standard PDF (Impression Bureau)</option>
                    <option value="80mm">Ticket Thermique 80mm (Caisse Rapide)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">En-tête Facture :</label>
                  <select value={headerStyle} onChange={(e) => setHeaderStyle(e.target.value)} className="bg-white border rounded p-1.5">
                    <option value="side">Deux colonnes (Logo gauche, Infos droite)</option>
                    <option value="center">Centré (Logo et texte au milieu)</option>
                    <option value="minimal">Minimaliste</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38]">
                  <input type="checkbox" checked={showLogo} onChange={(e) => setShowLogo(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                  <span>Afficher le logo officiel de Brunch Bouaké en haut des factures</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38]">
                  <input type="checkbox" checked={showTaxTable} onChange={(e) => setShowTaxTable(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                  <span>Afficher le tableau récapitulatif détaillé des taxes réglementaires</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38]">
                  <input type="checkbox" checked={showLegalNo} onChange={(e) => setShowLegalNo(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                  <span>Afficher les mentions d'immatriculation RCCM & NIF de l'établissement</span>
                </label>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mention de bas de facture (Remerciement) :</label>
                <input type="text" value={thankYouMessage} onChange={(e) => setThankYouMessage(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-2.5" />
              </div>
            </div>
          )}

          {/* 8. TEMPLATES PROFORMA / RECU */}
          {activeTab === 'proforma' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Layout className="w-4.5 h-4.5 text-[#fe6e00]" /> 8. Modèles d'Estimations & Reçus
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Configuration des pièces d'acomptes, proforma et reçus rapides.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Titre du document Proforma :</label>
                  <input type="text" value={proformaTitle} onChange={(e) => setProformaTitle(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Validité légale du devis (jours) :</label>
                  <input type="number" value={proformaValidity} onChange={(e) => setProformaValidity(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono" />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Titre de l'en-tête du Reçu de caisse :</label>
                  <input type="text" value={receiptHeader} onChange={(e) => setReceiptHeader(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38] bg-gray-50 p-3 rounded-lg border">
                <input type="checkbox" checked={showQRCode} onChange={(e) => setShowQRCode(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                <div className="flex flex-col">
                  <span>Imprimer le QR Code de paiement mobile (Orange/MTN/Moov)</span>
                  <span className="text-[9px] text-[#797067] font-normal leading-normal">Permet au réceptionniste d'afficher un QR Code à scanner pour un virement d'acompte instantané.</span>
                </div>
              </label>
            </div>
          )}

          {/* 9. PARAMETRES DE RAPPORTS */}
          {activeTab === 'rapports' && (
            <div className="flex flex-col gap-5 animate-scale-up text-xs">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <FileBarChart className="w-4.5 h-4.5 text-[#fe6e00]" /> 9. Configuration Avancée des Rapports & KPI
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">
                  Définissez ce que l'équipe voit, comment les KPI d'occupation, ADR et RevPAR sont calculés, segmentés et exportés.
                </p>
              </div>

              {/* NESTED SUB-TABS SELECTOR */}
              <div className="flex flex-wrap gap-1 bg-gray-50 p-1 rounded-lg border">
                <button
                  type="button" onClick={() => setReportsSubTab('generaux')}
                  className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded font-bold text-center transition-all cursor-pointer ${
                    reportsSubTab === 'generaux' ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  1. Paramètres Généraux
                </button>
                <button
                  type="button" onClick={() => setReportsSubTab('kpis')}
                  className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded font-bold text-center transition-all cursor-pointer ${
                    reportsSubTab === 'kpis' ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  2. KPI & Indicateurs
                </button>
                <button
                  type="button" onClick={() => setReportsSubTab('filtres')}
                  className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded font-bold text-center transition-all cursor-pointer ${
                    reportsSubTab === 'filtres' ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  3. Filtres & Périodes
                </button>
                <button
                  type="button" onClick={() => setReportsSubTab('segments')}
                  className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded font-bold text-center transition-all cursor-pointer ${
                    reportsSubTab === 'segments' ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  4. Segmentation
                </button>
                <button
                  type="button" onClick={() => setReportsSubTab('export')}
                  className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded font-bold text-center transition-all cursor-pointer ${
                    reportsSubTab === 'export' ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  5. Export & Impression
                </button>
                <button
                  type="button" onClick={() => setReportsSubTab('schedules')}
                  className={`flex-1 min-w-[120px] py-1.5 px-2.5 rounded font-bold text-center transition-all cursor-pointer ${
                    reportsSubTab === 'schedules' ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  6. Planification Auto.
                </button>
              </div>

              {/* SUB-TAB CONTENTS */}
              
              {/* 1. PARAMÈTRES GÉNÉRAUX */}
              {reportsSubTab === 'generaux' && (
                <div className="flex flex-col gap-4 animate-scale-up">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Nom du rapport par défaut :</label>
                      <input 
                        type="text" value={reportNameDefault} onChange={(e) => setReportNameDefault(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2 font-semibold text-gray-800"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Devise d'affichage comptable :</label>
                      <select 
                        value={reportCurrency} onChange={(e) => setReportCurrency(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2 font-bold"
                      >
                        <option value="FCFA">Franc CFA (F CFA)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="USD">Dollar US ($)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Fuseau Horaire de calcul :</label>
                      <select 
                        value={reportTimezone} onChange={(e) => setReportTimezone(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2 font-mono"
                      >
                        <option value="GMT (Europe/London - Bouaké Local Time)">GMT (Bouaké, Abidjan, Yamoussoukro)</option>
                        <option value="GMT+1 (Paris, Brussels)">GMT+1 (Paris, Bruxelles)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Langue des rapports d'audit :</label>
                      <select 
                        value={reportLanguage} onChange={(e) => setReportLanguage(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2"
                      >
                        <option value="Français">Français (PMS Officiel)</option>
                        <option value="Anglais">Anglais (English Reports)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Format de date :</label>
                      <select 
                        value={reportDateFormat} onChange={(e) => setReportDateFormat(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2 font-mono"
                      >
                        <option value="DD/MM/YYYY">JJ/MM/AAAA (25/12/2026)</option>
                        <option value="YYYY-MM-DD">AAAA-MM-JJ (2026-12-25)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Début de la journée opérationnelle :</label>
                      <input 
                        type="time" value={reportStartOfDay} onChange={(e) => setReportStartOfDay(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2 font-mono text-center"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Heure limite de clôture comptable :</label>
                      <input 
                        type="time" value={reportAccountingClose} onChange={(e) => setReportAccountingClose(e.target.value)}
                        className="bg-gray-50 border rounded-md p-2 font-mono text-center"
                      />
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 flex flex-col gap-2 mt-2">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                      <Info className="w-4 h-4 text-[#fe6e00]" /> Règle de Synchronisation Temporelle
                    </span>
                    <span className="text-[10px] text-gray-600 leading-normal">
                      Ces heures de clôture opérationnelle permettent d'éviter les écarts de nuitée entre les réservations actives, la caisse d'accueil et le rapport d'activité consolidé.
                    </span>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 mt-1">
                      <input 
                        type="checkbox" checked={includeTaxesInStats} onChange={(e) => setIncludeTaxesInStats(e.target.checked)}
                        className="rounded border-gray-300 text-[#fe6e00]"
                      />
                      <span>Inclure les taxes (TVA, taxe de séjour) par défaut dans le calcul du chiffre d'affaires brut hôtelier</span>
                    </label>
                  </div>
                </div>
              )}

              {/* 2. KPI ET INDICATEURS */}
              {reportsSubTab === 'kpis' && (
                <div className="flex flex-col gap-4 animate-scale-up">
                  <div className="bg-gray-50 p-3 rounded-lg border flex flex-col gap-1">
                    <span className="font-bold text-gray-700">Filtre et Visibilité des KPI</span>
                    <span className="text-[10px] text-gray-400">Sélectionnez les indicateurs à calculer et afficher dans l'application.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.keys(activeKPIs).map((key) => {
                      const labels: Record<string, string> = {
                        occupation: 'Taux d’Occupation (%)',
                        adr: 'ADR (Prix Moyen Chambre)',
                        revpar: 'RevPAR (Revenu par Chambre)',
                        totalRev: 'Chiffre d’Affaires Total',
                        roomRev: 'Revenu Chambres seul',
                        extrasRev: 'Revenu Extras',
                        fbRev: 'Revenu Restauration Brunch',
                        cancellationRate: 'Taux d’Annulation',
                        pickup: 'Pickup (Nouvel élan)',
                        noshow: 'No-Show (Absences)',
                        avgStay: 'Durée Moyenne Séjour',
                        paidAmount: 'Montant encaissé en caisse',
                        openBalance: 'Solde Restant Dû (Folio ouvert)'
                      };
                      return (
                        <div key={key} className="bg-white p-3 border rounded-lg flex flex-col gap-2 shadow-sm">
                          <label className="flex items-center justify-between font-bold text-gray-800 cursor-pointer">
                            <span>{labels[key] || key}</span>
                            <input
                              type="checkbox"
                              checked={activeKPIs[key]}
                              onChange={(e) => {
                                setActiveKPIs({ ...activeKPIs, [key]: e.target.checked });
                              }}
                              className="rounded border-gray-300 text-[#fe6e00]"
                            />
                          </label>

                          <div className="flex gap-2 border-t pt-1.5 text-[9px] text-gray-500">
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input 
                                type="checkbox" checked={!!dashboardKPIs[key]}
                                disabled={!activeKPIs[key]}
                                onChange={(e) => setDashboardKPIs({ ...dashboardKPIs, [key]: e.target.checked })}
                                className="rounded border-gray-300 text-emerald-600"
                              />
                              <span>Principal Dashboard</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-center gap-4 text-xs mt-2">
                    <div className="flex flex-col">
                      <span className="font-extrabold text-gray-800">KPI Comparatif par Défaut :</span>
                      <span className="text-[10px] text-gray-400">Sélectionnez la métrique pour les graphiques de tendance croisée.</span>
                    </div>
                    <select 
                      value={defaultComparativeKPI} onChange={(e) => setDefaultComparativeKPI(e.target.value)}
                      className="bg-white border rounded p-1.5 font-bold focus:outline-none"
                    >
                      <option value="occupation">Taux d'Occupation vs ADR</option>
                      <option value="revpar">RevPAR vs ADR</option>
                      <option value="totalRev">Chiffre d'Affaires vs Annulation</option>
                    </select>
                  </div>
                </div>
              )}

              {/* 3. FILTRES ET PÉRIODES */}
              {reportsSubTab === 'filtres' && (
                <div className="flex flex-col gap-4 animate-scale-up">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="font-bold text-gray-700 block">Périodes & Filtres par Défaut</span>
                    <span className="text-[10px] text-gray-400">Configurez les plages temporelles et filtres d'activité par défaut au chargement.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Période de référence :</label>
                      <select 
                        value={reportPeriod} onChange={(e) => setReportPeriod(e.target.value)}
                        className="bg-white border rounded p-2 font-bold"
                      >
                        <option value="Today">Aujourd’hui (Données en direct)</option>
                        <option value="Yesterday">Hier complet</option>
                        <option value="Week">Cette Semaine opérationnelle</option>
                        <option value="Month">Ce Mois comptable complet</option>
                        <option value="Year">Année fiscale en cours</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Type de chambre par défaut :</label>
                      <select 
                        value={defaultFilters.roomType}
                        onChange={(e) => setDefaultFilters({ ...defaultFilters, roomType: e.target.value })}
                        className="bg-white border rounded p-2"
                      >
                        <option value="Tous">Tous les types (Standard, Deluxe, Suite, Pavillon)</option>
                        <option value="Standard">Standard uniquement</option>
                        <option value="Deluxe">Deluxe uniquement</option>
                        <option value="Suite Royale">Suite Royale uniquement</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Statut de réservation par défaut :</label>
                      <select 
                        value={defaultFilters.status}
                        onChange={(e) => setDefaultFilters({ ...defaultFilters, status: e.target.value })}
                        className="bg-white border rounded p-2"
                      >
                        <option value="Tous">Tous les statuts (Confirmé, En Cours, Terminé)</option>
                        <option value="En Cours">Séjours actifs uniquement (In-House)</option>
                        <option value="Confirmé">Réservations futures uniquement</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Canal de réservation (Source) :</label>
                      <select 
                        value={defaultFilters.channel}
                        onChange={(e) => setDefaultFilters({ ...defaultFilters, channel: e.target.value })}
                        className="bg-white border rounded p-2"
                      >
                        <option value="Tous">Tous les canaux (OTA, Direct, Agence, Téléphone)</option>
                        <option value="Direct">Directement à l'hôtel (Walk-In/Site)</option>
                        <option value="OTA">OTA (Booking.com, Expedia, Airbnb)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. SEGMENTATION DES DONNÉES */}
              {reportsSubTab === 'segments' && (
                <div className="flex flex-col gap-4 animate-scale-up">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="font-bold text-gray-700 block">Filtres de Segmentation Stratégique</span>
                    <span className="text-[10px] text-gray-400">Définissez des groupes de clients ou sources de réservation réutilisables dans vos rapports.</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {segments.map((seg) => (
                      <div key={seg.id} className="bg-white p-3 border rounded-lg flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center font-bold">
                            <SlidersHorizontal className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-800 text-xs block">{seg.name}</span>
                            <span className="text-[9px] text-gray-400 font-mono">Règle : {seg.rule}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px]">Réutilisable</span>
                          <button
                            type="button"
                            onClick={() => setSegments(segments.filter(s => s.id !== seg.id))}
                            className="text-red-500 hover:text-red-700 font-bold text-sm"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADD SEGMENT FORM */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newSegmentName.trim()) return;
                      const newSeg = {
                        id: `SEG-0${segments.length + 1}`,
                        name: newSegmentName,
                        rule: newSegmentRule,
                        isActive: true
                      };
                      setSegments([...segments, newSeg]);
                      setNewSegmentName('');
                      triggerToast(`Segment créé: ${newSegmentName}`);
                    }}
                    className="bg-gray-50 p-4 border rounded-xl flex flex-col gap-3 mt-1"
                  >
                    <span className="font-bold text-[#423d38] uppercase tracking-wider text-[9px]">Ajouter un segment personnalisé :</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500">Nom descriptif du segment :</label>
                        <input 
                          type="text" required placeholder="Ex: Segment Corporate VIP"
                          value={newSegmentName} onChange={(e) => setNewSegmentName(e.target.value)}
                          className="bg-white border rounded p-1.5 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500">Règle de filtrage associée :</label>
                        <select 
                          value={newSegmentRule} onChange={(e) => setNewSegmentRule(e.target.value)}
                          className="bg-white border rounded p-1.5 focus:outline-none"
                        >
                          <option value="Source de réservation = Direct">Source de réservation = Direct</option>
                          <option value="Canal = Booking.com">Canal = Booking.com</option>
                          <option value="Canal = Airbnb">Canal = Airbnb</option>
                          <option value="Type de chambre = Suite Royale">Type de chambre = Suite Royale</option>
                          <option value="Type de Client = VIP">Type de Client = VIP</option>
                          <option value="Type de Client = Corporate">Type de Client = Corporate</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" className="bg-[#fe6e00] text-white py-1.5 px-4 rounded font-bold text-xs self-end cursor-pointer">
                      Créer Segment
                    </button>
                  </form>
                </div>
              )}

              {/* 5. EXPORT ET IMPRESSION */}
              {reportsSubTab === 'export' && (
                <div className="flex flex-col gap-4 animate-scale-up">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="font-bold text-gray-700 block">Modèle d'Impression des Rapports d'Activité</span>
                    <span className="text-[10px] text-gray-400">Définissez la charte esthétique et légale des exports PDF, Excel, CSV hôteliers.</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Gabarit d'En-tête officiel :</label>
                      <select 
                        value={exportHeaderTemplate} onChange={(e) => setExportHeaderTemplate(e.target.value)}
                        className="bg-white border rounded p-2 font-bold"
                      >
                        <option value="Standard d'Établissement">Standard d'Établissement (Nom + Logo gauche)</option>
                        <option value="Minimaliste Admin">Gouvernemental (Mentions légales centrées)</option>
                        <option value="Signature Royale">Design VIP (Filigrane couleur café)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Format de numérotation :</label>
                      <input 
                        type="text" value={exportFooterText} onChange={(e) => setExportFooterText(e.target.value)}
                        className="bg-white border rounded p-2 font-mono"
                      />
                    </div>

                    <div className="flex flex-col gap-1 col-span-1 md:col-span-2">
                      <label className="font-bold text-gray-500 uppercase tracking-widest text-[9px]">Mention légale obligatoire en bas de page :</label>
                      <textarea 
                        rows={2} value={exportMentionLegale} onChange={(e) => setExportMentionLegale(e.target.value)}
                        className="bg-white border rounded p-2 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 bg-gray-50 p-3 rounded-lg border">
                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input 
                        type="checkbox" checked={exportShowLogo} onChange={(e) => setExportShowLogo(e.target.checked)}
                        className="rounded border-gray-300 text-[#fe6e00]"
                      />
                      <span>Afficher le logo officiel en filigrane</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input 
                        type="checkbox" checked={exportShowSignatures} onChange={(e) => setExportShowSignatures(e.target.checked)}
                        className="rounded border-gray-300 text-[#fe6e00]"
                      />
                      <span>Ajouter un bloc de signature de la direction</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input 
                        type="checkbox" checked={exportShowCover} onChange={(e) => setExportShowCover(e.target.checked)}
                        className="rounded border-gray-300 text-[#fe6e00]"
                      />
                      <span>Générer une page de garde hôtelière</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer font-bold">
                      <input 
                        type="checkbox" checked={exportPageNumbering} onChange={(e) => setExportPageNumbering(e.target.checked)}
                        className="rounded border-gray-300 text-[#fe6e00]"
                      />
                      <span>Activer la numérotation automatique des folios</span>
                    </label>
                  </div>

                  {/* ACTION EXPORTS */}
                  <div className="border-t pt-4 flex flex-wrap gap-2 justify-end">
                    <button 
                      type="button"
                      onClick={() => triggerToast("Prévisualisation de l'en-tête générée dans vos impressions !")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Prévisualiser
                    </button>
                    <button 
                      type="button"
                      onClick={() => triggerToast("Succès: Exportation du rapport d'activité en PDF comptable !")}
                      className="bg-[#fe6e00] text-white font-bold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" /> Exporter en PDF
                    </button>
                    <button 
                      type="button"
                      onClick={() => triggerToast("Succès: Exportation de la grille de données en Excel (xlsx) !")}
                      className="bg-[#016630] text-white font-bold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" /> Exporter Excel / CSV
                    </button>
                  </div>
                </div>
              )}

              {/* 6. RAPPORT AUTOMATIQUE ET PLANIFICATION */}
              {reportsSubTab === 'schedules' && (
                <div className="flex flex-col gap-4 animate-scale-up">
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <span className="font-bold text-gray-700 block">Planification & Envois E-mails Automatiques</span>
                    <span className="text-[10px] text-gray-400">Configurez l'envoi périodique et sécurisé des données au front-desk ou à l'expert-comptable.</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {schedules.map((sch) => (
                      <div key={sch.id} className="bg-white p-3 border rounded-lg flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Clock className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-gray-800 text-xs block uppercase">
                              Rapport {sch.type === 'daily' ? 'Quotidien' : sch.type === 'weekly' ? 'Hebdomadaire' : 'Mensuel'} à {sch.time}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono block">Destinataires: {sch.recipients}</span>
                            <span className="text-[8px] font-bold text-[#fe6e00] font-mono">Format attaché : {sch.format}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="checkbox" checked={sch.enabled}
                              onChange={(e) => {
                                setSchedules(schedules.map(s => s.id === sch.id ? { ...s, enabled: e.target.checked } : s));
                                triggerToast(`Tâche auto ${sch.id} ${e.target.checked ? 'activée' : 'désactivée'}`);
                              }}
                              className="rounded border-gray-300 text-[#fe6e00]"
                            />
                            <span className="text-[10px] font-bold text-gray-500">Actif</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setSchedules(schedules.filter(s => s.id !== sch.id))}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADD SCHEDULE FORM */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newScheduleRecipients.trim()) return;
                      const newSch = {
                        id: `SCH-0${schedules.length + 1}`,
                        type: newScheduleType,
                        time: newScheduleTime,
                        recipients: newScheduleRecipients,
                        format: newScheduleFormat,
                        enabled: true
                      };
                      setSchedules([...schedules, newSch]);
                      setNewScheduleRecipients('');
                      triggerToast('Nouvel envoi automatique planifié !');
                    }}
                    className="bg-gray-50 p-4 border rounded-xl flex flex-col gap-3 mt-1"
                  >
                    <span className="font-bold text-[#423d38] uppercase tracking-wider text-[9px]">Planifier un nouvel envoi comptable auto :</span>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500">Fréquence :</label>
                        <select 
                          value={newScheduleType} onChange={(e) => setNewScheduleType(e.target.value)}
                          className="bg-white border rounded p-1.5 focus:outline-none"
                        >
                          <option value="daily">Rapport Quotidien</option>
                          <option value="weekly">Rapport Hebdomadaire</option>
                          <option value="monthly">Rapport Mensuel</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500">Heure d'envoi :</label>
                        <input 
                          type="time" required
                          value={newScheduleTime} onChange={(e) => setNewScheduleTime(e.target.value)}
                          className="bg-white border rounded p-1.5 font-mono text-center focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500">Format d'export :</label>
                        <select 
                          value={newScheduleFormat} onChange={(e) => setNewScheduleFormat(e.target.value)}
                          className="bg-white border rounded p-1.5 focus:outline-none font-bold"
                        >
                          <option value="PDF">PDF officiel sécurisé</option>
                          <option value="Excel">Grille Excel comptable (xlsx)</option>
                          <option value="CSV">Format brut CSV</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-gray-500">E-mails (séparés par virgule) :</label>
                        <input 
                          type="text" required placeholder="Ex: direction@hotel.ci"
                          value={newScheduleRecipients} onChange={(e) => setNewScheduleRecipients(e.target.value)}
                          className="bg-white border rounded p-1.5 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button type="submit" className="bg-[#016630] text-white py-1.5 px-4 rounded font-bold text-xs self-end cursor-pointer">
                      Planifier l'envoi automatique
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* 10. NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-4.5 h-4.5 text-[#fe6e00]" /> 10. Notifications & Alertes Automatiques
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Configuration des déclencheurs et modèles d'e-mails.</p>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38]">
                  <input type="checkbox" checked={sendOnBooking} onChange={(e) => setSendOnBooking(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                  <span>Envoyer automatiquement un e-mail de confirmation dès la création de séjour</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38]">
                  <input type="checkbox" checked={sendOnCheckout} onChange={(e) => setSendOnCheckout(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                  <span>Envoyer la facture définitive acquittée au check-out en pièce-jointe PDF</span>
                </label>
              </div>

              <div className="bg-white border rounded-xl p-4 flex flex-col gap-3">
                <span className="font-bold text-[9px] uppercase tracking-wider text-[#797067]">Modèles d'emails hôteliers :</span>
                <div className="flex gap-2">
                  {notificationTemplates.map(nt => (
                    <button
                      key={nt.id} type="button"
                      onClick={() => setSelectedNotificationId(nt.id)}
                      className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                        selectedNotificationId === nt.id ? 'bg-[#fe6e00] text-white shadow-sm' : 'bg-gray-100 text-[#797067] hover:bg-gray-200'
                      }`}
                    >
                      {nt.title}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 bg-[#f3f4f6]/60 p-4 rounded-xl border border-[#e3e0dd] mt-1">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Sujet de l'e-mail :</label>
                    <input 
                      type="text" value={activeTemplateObj.subject}
                      onChange={(e) => {
                        setNotificationTemplates(notificationTemplates.map(nt => nt.id === activeTemplateObj.id ? { ...nt, subject: e.target.value } : nt));
                      }}
                      className="bg-white border border-[#e3e0dd] rounded p-2 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Corps du message :</label>
                    <textarea 
                      rows={4} value={activeTemplateObj.body}
                      onChange={(e) => handleUpdateTemplateText(activeTemplateObj.id, e.target.value)}
                      className="bg-white border border-[#e3e0dd] rounded p-2 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Signature de mail standard globale :</label>
                <textarea rows={2} value={emailSignature} onChange={(e) => setEmailSignature(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono" />
              </div>
            </div>
          )}

          {/* 11. SECURITE ET ACCES */}
          {activeTab === 'securite' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-4.5 h-4.5 text-[#fe6e00]" /> 11. Sécurité, Autorisations & Connecteurs OTA
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Contrôle des habilitations et simulateur d'appels API de Channel Manager.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mot de passe Directeur (Autorisation Remises) :</label>
                  <input type="password" value={managerPassword} onChange={(e) => setManagerPassword(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 font-mono font-bold" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Rôle de l'utilisateur actuel :</label>
                  <input type="text" disabled value={operatorRole} className="bg-gray-100 border border-gray-300 rounded-md p-2 font-bold text-gray-500" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#423d38]">
                <input type="checkbox" checked={ipRestriction} onChange={(e) => setIpRestriction(e.target.checked)} className="rounded border-gray-300 text-[#fe6e00]" />
                <span>Restreindre l'accès à la plage d'IP de l'établissement (Bouaké Intranet)</span>
              </label>

              {/* INTEGRATION WEBHOOK SIMULATOR PANEL */}
              <div className="border-t border-gray-200 pt-4 flex flex-col gap-3">
                <span className="font-extrabold text-[9px] uppercase text-[#fe6e00] tracking-widest">Connecteur API Channel Manager (OTA Sandbox)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Fournisseur :</label>
                    <select value={simProvider} onChange={(e) => setSimProvider(e.target.value)} className="bg-white border rounded p-1 text-[#423d38] font-bold">
                      <option value="Channex">Channex APIs (channex.io)</option>
                      <option value="Zodomus">Zodomus Webhook Connector</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-gray-500 font-bold uppercase">Clé API (Sandbox) :</label>
                    <input type="text" value={simApiKey} onChange={(e) => setSimApiKey(e.target.value)} className="bg-white border rounded p-1 font-mono text-[10px]" />
                  </div>
                </div>

                <div className="bg-[#fcfaf7] border border-gray-300 p-4 rounded-xl flex flex-col gap-3">
                  <span className="font-bold text-[10px] text-gray-700">Simuler une remontée automatique de réservation (OTA webhook)</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input type="text" placeholder="Voyageur" value={simGuestName} onChange={(e) => setSimGuestName(e.target.value)} className="bg-white border rounded p-1 text-xs" />
                    <select value={simRoomType} onChange={(e) => setSimRoomType(e.target.value)} className="bg-white border rounded p-1 text-xs font-semibold">
                      <option value="Standard">Chambre Standard</option>
                      <option value="Deluxe">Chambre Deluxe</option>
                      <option value="Suite Royale">Suite Royale</option>
                    </select>
                    <button type="button" disabled={simulating} onClick={handleSimulateBooking} className="bg-[#fe6e00] hover:bg-[#e05d00] text-white rounded font-bold text-[10px] cursor-pointer">
                      {simulating ? "Appel API..." : "Émettre Webhook"}
                    </button>
                  </div>
                  
                  {/* Console logs */}
                  <div className="flex justify-between items-center text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1 mt-1">
                    <span>Console de simulation API</span>
                    <button type="button" onClick={handleClearConsoleLogs} className="text-red-500 hover:underline cursor-pointer">Vider la console</button>
                  </div>
                  <div className="bg-[#1e1e1e] rounded-lg p-3 font-mono text-gray-300 text-[9px] max-h-32 overflow-y-auto">
                    {simConsoleLogs.slice(-3).map((log, i) => (
                      <div key={i} className="text-gray-400 py-0.5">{log}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 12. CHAMPS PERSONNALISES */}
          {activeTab === 'champs' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4.5 h-4.5 text-[#fe6e00]" /> 12. Champs Additionnels Personnalisés
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Augmentez les fiches séjour et profils clients avec des attributs personnalisés.</p>
              </div>

              <div className="flex flex-col gap-2">
                {customFields.map(cf => (
                  <div key={cf.id} className="bg-gray-50 border p-2.5 rounded flex justify-between items-center font-semibold">
                    <span>Module: <strong className="text-[#fe6e00]">{cf.target}</strong> • Champ: <strong className="text-gray-700">{cf.name}</strong> ({cf.type})</span>
                    <button type="button" onClick={() => handleDeleteCustomField(cf.id)} className="text-red-500 hover:text-red-700 text-xs font-bold">Supprimer</button>
                  </div>
                ))}
              </div>

              <div className="bg-[#f3f4f6]/60 p-3 rounded-lg border border-[#e3e0dd] grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-end mt-2">
                <div>
                  <label className="text-[9px] text-[#797067] font-bold uppercase">Cible :</label>
                  <select value={newFieldTarget} onChange={(e) => setNewFieldTarget(e.target.value)} className="bg-white border rounded w-full p-1 text-xs">
                    <option value="Réservation">Réservation</option>
                    <option value="Client">Client</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[#797067] font-bold uppercase">Type :</label>
                  <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)} className="bg-white border rounded w-full p-1 text-xs">
                    <option value="text">Texte libre</option>
                    <option value="number">Nombre</option>
                    <option value="date">Sélecteur Date</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-[#797067] font-bold uppercase">Libellé :</label>
                  <input type="text" placeholder="Ex: N° Vol d'arrivée" value={newFieldName} onChange={(e) => setNewFieldName(e.target.value)} className="bg-white border rounded w-full p-1 text-xs" />
                </div>
                <button type="button" onClick={handleAddCustomField} className="bg-[#016630] text-white rounded p-1.5 font-bold text-xs">Ajouter</button>
              </div>
            </div>
          )}

          {/* 13. DOCUMENTS ET IMPRESSION */}
          {activeTab === 'documents' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Printer className="w-4.5 h-4.5 text-[#fe6e00]" /> 13. Cachets & Signatures de l'Établissement
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Génération automatique des tampons légaux comptables sur vos folios de séjour.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Texte d'approbation du cachet :</label>
                    <input type="text" value={stampText} onChange={(e) => setStampText(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-2 font-bold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Couleur du cachet administratif :</label>
                    <select value={stampColor} onChange={(e) => setStampColor(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-2 font-bold">
                      <option value="#016630">Vert Comptabilité (Reçu)</option>
                      <option value="#fb2c36">Rouge Certifié (Urgent)</option>
                      <option value="#1c130c">Noir Neutre</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                      <input type="checkbox" checked={showSignature} onChange={(e) => setShowSignature(e.target.checked)} className="rounded text-[#fe6e00]" />
                      <span>Apposer la signature officielle en bas des folios</span>
                    </label>
                  </div>
                  {showSignature && (
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom du signataire :</label>
                      <input type="text" value={signatureName} onChange={(e) => setSignatureName(e.target.value)} className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-2" />
                    </div>
                  )}
                </div>

                {/* Stamp visual representation */}
                <div className="bg-gray-50 p-4 rounded-xl border flex flex-col items-center justify-center min-h-[180px]">
                  <div 
                    className="w-28 h-28 rounded-full border-4 border-dashed flex flex-col items-center justify-center p-2 text-center rotate-6 select-none font-sans font-bold"
                    style={{ borderColor: stampColor, color: stampColor }}
                  >
                    <span className="text-[7px] tracking-wider">BRUNCH BOUAKÉ</span>
                    <div className="h-px w-full my-0.5" style={{ backgroundColor: stampColor }}></div>
                    <span className="text-[8px] uppercase font-black tracking-tighter leading-none my-1">{stampText}</span>
                    <div className="h-px w-full my-0.5" style={{ backgroundColor: stampColor }}></div>
                    <span className="text-[6px] font-mono">CI-BKE-2026</span>
                  </div>
                  <span className="text-[8px] text-gray-400 mt-2 font-mono">Aperçu du Tampon Virtuel</span>
                </div>
              </div>
            </div>
          )}

          {/* 14. SAUVEGARDE ET PUBLICATION */}
          {activeTab === 'sauvegarde' && (
            <div className="flex flex-col gap-5 animate-scale-up">
              <div className="border-b border-[#e3e0dd] pb-3">
                <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4.5 h-4.5 text-[#fe6e00]" /> 14. Sauvegardes, Publication & Restauration
                </h3>
                <p className="text-[#797067] text-[11px] mt-0.5">Outils de préservation des données de configuration et réinitialisation d'usine.</p>
              </div>

              <div className="flex flex-col gap-2 font-sans">
                <span className="font-bold text-[9px] text-[#797067] uppercase tracking-wider">Historique des points de restauration :</span>
                {backups.map(b => (
                  <div key={b.id} className="bg-gray-50 border p-2.5 rounded flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800 text-[11px]">{b.desc}</span>
                      <span className="text-[9px] text-[#797067] font-mono mt-0.5">Le {b.date} • Auteur: {b.user}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => triggerToast(`Configuration restaurée au point de sauvegarde ${b.id}`)}
                      className="bg-white hover:bg-gray-100 border text-gray-700 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Restaurer
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateBackup} className="bg-gray-50 p-3 rounded-lg border flex gap-2 items-end">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="font-bold text-[9px] text-gray-500 uppercase">Créer un nouveau point de restauration :</label>
                  <input type="text" placeholder="Description du point de sauvegarde" value={newBackupDesc} onChange={(e) => setNewBackupDesc(e.target.value)} className="bg-white border rounded p-1.5 text-xs w-full" />
                </div>
                <button type="submit" className="bg-[#016630] text-white rounded p-1.5 font-bold text-xs h-9">Sauvegarder</button>
              </form>

              {/* Reset to factory defaults */}
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4 mt-2">
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-red-800 text-xs uppercase tracking-wider">Réinitialisation complète de l'application (Usine)</span>
                  <span className="text-[10px] text-red-600 max-w-md leading-normal">Efface toutes les réservations, historiques, clients et réinitialise l'application à ses configurations initiales.</span>
                </div>
                <button type="button" onClick={handleResetSystem} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg text-xs shrink-0">Réinitialiser Tout</button>
              </div>
            </div>
          )}

          {/* Bottom validation section buttons */}
          <div className="flex justify-between items-center border-t border-[#e3e0dd] pt-4 mt-6">
            <span className="text-[10px] text-[#797067] italic font-semibold">* Pensez à enregistrer vos réglages avant de changer d'onglet</span>
            <button 
              type="button" 
              onClick={() => handleSaveAllSettings()}
              className="bg-[#fe6e00] hover:bg-[#e05d00] text-white font-extrabold px-5 py-2 rounded-lg text-xs shadow-sm"
            >
              Sauvegarder cet onglet
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
