import { Router } from 'express';
import { executeQuery, isDbConnected } from '../db/connection';
import { mockReservations } from '../db/inMemoryStore';
import { Reservation } from '../../../frontend/src/types';

const router = Router();

/**
 * Format helper to map database columns back to standard frontend Reservation interface
 */
function formatReservation(r: any): Reservation {
  const formatDate = (dateVal: any): string => {
    if (!dateVal) return '';
    if (dateVal instanceof Date) {
      return dateVal.toISOString().split('T')[0];
    }
    if (typeof dateVal === 'string') {
      return dateVal.split('T')[0];
    }
    return String(dateVal);
  };

  return {
    id: r.id,
    guestName: r.guestName,
    guestEmail: r.guestEmail,
    roomNumber: r.roomNumber,
    checkIn: formatDate(r.checkIn),
    checkOut: formatDate(r.checkOut),
    totalBill: Number(r.totalBill),
    paidAmount: Number(r.paidAmount),
    status: r.status,
    gender: r.gender || undefined,
    birthDate: r.birthDate ? formatDate(r.birthDate) : undefined,
    nationality: r.nationality || undefined,
    idType: r.idType || undefined,
    idNumber: r.idNumber || undefined,
    guestPhone: r.guestPhone || undefined,
    address: r.address || undefined,
    city: r.city || undefined,
    country: r.country || undefined,
    postalCode: r.postalCode || undefined,
    language: r.language || undefined,
    emergencyContact: r.emergencyContact || undefined,
    adults: r.adults !== null ? Number(r.adults) : undefined,
    children: r.children !== null ? Number(r.children) : undefined,
    notes: r.notes || undefined,
    docScanUrl: r.docScanUrl || undefined,
    signatureData: r.signatureData || undefined,
    agreedToTerms: r.agreedToTerms === 1 || r.agreedToTerms === true,
    source: r.source || undefined,
    bookingSource: r.bookingSource || undefined,
    channelType: r.channelType || undefined,
    channelName: r.channelName || undefined,
    otaReference: r.otaReference || undefined,
    originCountry: r.originCountry || undefined,
    createdFrom: r.createdFrom || undefined
  };
}

/**
 * GET /api/reservations
 * Récupère la liste de toutes les réservations PMS
 */
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const sql = 'SELECT * FROM reservations ORDER BY createdAt DESC';
      const dbRes = await executeQuery<any[]>(sql);
      const list = dbRes.map(formatReservation);
      return res.json(list);
    } else {
      return res.json(mockReservations);
    }
  } catch (err: any) {
    console.warn("[FALLBACK] Échec de la récupération des réservations depuis MySQL. Utilisation de inMemoryStore.", err.message);
    return res.json(mockReservations);
  }
});

/**
 * GET /api/reservations/:id
 * Récupère les détails d'une réservation par son ID
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const sql = 'SELECT * FROM reservations WHERE id = ?';
      const dbRes = await executeQuery<any[]>(sql, [id]);
      if (dbRes.length === 0) {
        return res.status(404).json({ error: `Réservation ${id} non trouvée dans la base MySQL.` });
      }
      return res.json(formatReservation(dbRes[0]));
    } else {
      const found = mockReservations.find(r => r.id === id);
      if (!found) return res.status(404).json({ error: `Réservation ${id} non trouvée.` });
      return res.json(found);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/reservations
 * Enregistre une nouvelle réservation (Walk-in, direct, ou ota)
 */
router.post('/', async (req, res) => {
  const resData: Reservation = req.body;

  if (!resData.id || !resData.guestName || !resData.guestEmail || !resData.roomNumber || !resData.checkIn || !resData.checkOut) {
    return res.status(400).json({ error: 'Données de réservation obligatoires manquantes.' });
  }

  try {
    if (isDbConnected()) {
      const sql = `
        INSERT INTO reservations (
          id, guestName, guestEmail, roomNumber, checkIn, checkOut, totalBill, paidAmount, status,
          gender, birthDate, nationality, idType, idNumber, guestPhone, address, city, country,
          postalCode, language, emergencyContact, adults, children, notes, docScanUrl, signatureData,
          agreedToTerms, source, bookingSource, channelType, channelName, otaReference, originCountry, createdFrom
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?
        )
      `;

      const values = [
        resData.id,
        resData.guestName,
        resData.guestEmail,
        resData.roomNumber,
        resData.checkIn,
        resData.checkOut,
        resData.totalBill || 0,
        resData.paidAmount || 0,
        resData.status || 'Confirmé',
        resData.gender || null,
        resData.birthDate || null,
        resData.nationality || null,
        resData.idType || null,
        resData.idNumber || null,
        resData.guestPhone || null,
        resData.address || null,
        resData.city || null,
        resData.country || null,
        resData.postalCode || null,
        resData.language || null,
        resData.emergencyContact || null,
        resData.adults !== undefined ? resData.adults : 1,
        resData.children !== undefined ? resData.children : 0,
        resData.notes || null,
        resData.docScanUrl || null,
        resData.signatureData || null,
        resData.agreedToTerms ? 1 : 0,
        resData.source || null,
        resData.bookingSource || null,
        resData.channelType || null,
        resData.channelName || null,
        resData.otaReference || null,
        resData.originCountry || null,
        resData.createdFrom || 'PMS'
      ];

      await executeQuery(sql, values);
      return res.status(201).json(resData);
    } else {
      // Check for duplication in memory
      const exists = mockReservations.some(r => r.id === resData.id);
      if (exists) return res.status(400).json({ error: `La réservation ${resData.id} existe déjà.` });

      mockReservations.push(resData);
      return res.status(201).json(resData);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/reservations/:id
 * Met à jour une réservation existante (Ex: encaissement de facture, modification de dates, check-in, check-out)
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates: Partial<Reservation> = req.body;

  try {
    if (isDbConnected()) {
      const fields: string[] = [];
      const values: any[] = [];

      // Valid fields for SQL update
      const allowedKeys = [
        'guestName', 'guestEmail', 'roomNumber', 'checkIn', 'checkOut', 'totalBill', 'paidAmount', 'status',
        'gender', 'birthDate', 'nationality', 'idType', 'idNumber', 'guestPhone', 'address', 'city', 'country',
        'postalCode', 'language', 'emergencyContact', 'adults', 'children', 'notes', 'docScanUrl', 'signatureData',
        'agreedToTerms', 'source', 'bookingSource', 'channelType', 'channelName', 'otaReference', 'originCountry', 'createdFrom'
      ];

      Object.entries(updates).forEach(([key, val]) => {
        if (allowedKeys.includes(key)) {
          fields.push(`${key} = ?`);
          if (key === 'agreedToTerms') {
            values.push(val ? 1 : 0);
          } else {
            values.push(val);
          }
        }
      });

      if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ valide à mettre à jour.' });
      }

      values.push(id);
      const sql = `UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);

      // Query the updated item to return
      const selectSql = 'SELECT * FROM reservations WHERE id = ?';
      const results = await executeQuery<any[]>(selectSql, [id]);
      return res.json(formatReservation(results[0]));
    } else {
      const idx = mockReservations.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: `Réservation ${id} non trouvée.` });

      mockReservations[idx] = { ...mockReservations[idx], ...updates };
      return res.json(mockReservations[idx]);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/reservations/:id
 * Annule / supprime une réservation du système
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const sql = 'DELETE FROM reservations WHERE id = ?';
      await executeQuery(sql, [id]);
      return res.json({ success: true, message: `Réservation ${id} supprimée de MySQL.` });
    } else {
      const idx = mockReservations.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: `Réservation ${id} non trouvée.` });

      mockReservations.splice(idx, 1);
      return res.json({ success: true, message: `Réservation ${id} supprimée de la mémoire.` });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
