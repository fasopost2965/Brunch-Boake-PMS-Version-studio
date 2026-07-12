import { Router } from 'express';
import { executeQuery, isDbConnected } from '../db/connection';
import { mockRooms } from '../db/inMemoryStore';
import { Room } from '../../../frontend/src/types';

const router = Router();

/**
 * GET /api/rooms
 * Récupère la liste de toutes les chambres
 */
router.get('/', async (req, res) => {
  try {
    if (isDbConnected()) {
      const sql = 'SELECT id, type, status, price, capacity FROM chambres';
      const dbRooms = await executeQuery<any[]>(sql);
      // Map MySQL rows to JSON matching Room type
      const rooms: Room[] = dbRooms.map(r => ({
        id: r.id,
        type: r.type,
        status: r.status,
        price: r.price,
        capacity: r.capacity
      }));
      return res.json(rooms);
    } else {
      return res.json(mockRooms);
    }
  } catch (err: any) {
    console.warn("[FALLBACK] Échec de la récupération des chambres depuis MySQL. Utilisation du inMemoryStore.", err.message);
    return res.json(mockRooms);
  }
});

/**
 * GET /api/rooms/:id
 * Récupère une chambre spécifique par son numéro
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const sql = 'SELECT id, type, status, price, capacity FROM chambres WHERE id = ?';
      const dbRooms = await executeQuery<any[]>(sql, [id]);
      if (dbRooms.length === 0) {
        return res.status(404).json({ error: 'Chambre non trouvée dans la base MySQL.' });
      }
      const r = dbRooms[0];
      const room: Room = {
        id: r.id,
        type: r.type,
        status: r.status,
        price: r.price,
        capacity: r.capacity
      };
      return res.json(room);
    } else {
      const room = mockRooms.find(r => r.id === id);
      if (!room) return res.status(404).json({ error: 'Chambre non trouvée.' });
      return res.json(room);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/rooms
 * Crée une nouvelle chambre
 */
router.post('/', async (req, res) => {
  const room: Room = req.body;
  
  if (!room.id || !room.type || !room.status || !room.price || !room.capacity) {
    return res.status(400).json({ error: 'Données de la chambre incomplètes (id, type, status, price, capacity requis).' });
  }

  try {
    if (isDbConnected()) {
      const sql = 'INSERT INTO chambres (id, type, status, price, capacity) VALUES (?, ?, ?, ?, ?)';
      await executeQuery(sql, [room.id, room.type, room.status, room.price, room.capacity]);
      return res.status(201).json(room);
    } else {
      // Check if already exists in memory
      const exists = mockRooms.some(r => r.id === room.id);
      if (exists) return res.status(400).json({ error: `La chambre n°${room.id} existe déjà.` });
      
      mockRooms.push(room);
      return res.status(201).json(room);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/rooms/:id
 * Met à jour les propriétés d'une chambre (comme son état de ménage ou d'occupation)
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const updates: Partial<Room> = req.body;
  
  try {
    if (isDbConnected()) {
      const fields: string[] = [];
      const values: any[] = [];
      
      // Filter valid updating fields
      if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
      if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
      if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }
      if (updates.capacity !== undefined) { fields.push('capacity = ?'); values.push(updates.capacity); }
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ valide à mettre à jour (type, status, price, capacity).' });
      }
      
      values.push(id);
      const sql = `UPDATE chambres SET ${fields.join(', ')} WHERE id = ?`;
      await executeQuery(sql, values);
      
      // Query the updated item
      const selectSql = 'SELECT id, type, status, price, capacity FROM chambres WHERE id = ?';
      const results = await executeQuery<any[]>(selectSql, [id]);
      return res.json(results[0]);
    } else {
      const idx = mockRooms.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Chambre non trouvée.' });
      
      mockRooms[idx] = { ...mockRooms[idx], ...updates };
      return res.json(mockRooms[idx]);
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/rooms/:id
 * Supprime une chambre
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (isDbConnected()) {
      const sql = 'DELETE FROM chambres WHERE id = ?';
      await executeQuery(sql, [id]);
      return res.json({ success: true, message: `Chambre ${id} supprimée de MySQL.` });
    } else {
      const idx = mockRooms.findIndex(r => r.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Chambre non trouvée.' });
      
      mockRooms.splice(idx, 1);
      return res.json({ success: true, message: `Chambre ${id} supprimée de la mémoire.` });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
