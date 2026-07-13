import React, { useState } from 'react';
import { Room, BrunchOrder, Payment } from '../types';
import { api } from '../api';
import { Utensils, Plus, Minus, ShoppingCart, Check, RefreshCw, Clock, Coffee, Sparkles } from 'lucide-react';

interface BrunchScreenProps {
  rooms: Room[];
  orders: BrunchOrder[];
  onOrdersUpdate: () => void;
  onPaymentsUpdate: () => void;
  onRoomsUpdate: () => void;
}

const BRUNCH_MENU = [
  { id: 'MENU-1', name: 'Brunch Signature Ivoirien', description: 'Alloco, brochettes de filet, œuf brouillé aux épices de pays, café de Man.', price: 12000, category: 'Brunch' },
  { id: 'MENU-2', name: 'Brunch Savane d\'Afrique', description: 'Yam frites, poulet braisé croustillant, avocat de pays et jus pressé.', price: 14000, category: 'Brunch' },
  { id: 'MENU-3', name: 'Brunch Américain Classique', description: 'Œufs au plat, bacon croustillant, saucisses de poulet et pancakes.', price: 10000, category: 'Brunch' },
  { id: 'MENU-4', name: 'Pancakes de la Passion', description: 'Trois pancakes moelleux servis avec un coulis frais de fruit de la passion.', price: 5500, category: 'Sucré' },
  { id: 'MENU-5', name: 'Pain perdu à la mangue', description: 'Brioche perdue caramélisée avec morceaux de mangues fraîches rôties.', price: 6000, category: 'Sucré' },
  { id: 'MENU-6', name: 'Cocktail Bouaké Sun', description: 'Mélange exotique rafraîchissant d\'ananas, orange, passion et menthe.', price: 5000, category: 'Boisson' },
  { id: 'MENU-7', name: 'Café de Man (Grand Cru)', description: 'Café de terroir torréfié à Abidjan, préparé selon votre choix (Express, Cappuccino).', price: 3000, category: 'Boisson' },
  { id: 'MENU-8', name: 'Jus de gingembre / Bissap', description: 'Jus traditionnels faits maison, fraîchement pressés et parfumés à la menthe.', price: 2500, category: 'Boisson' }
];

export const BrunchScreen: React.FC<BrunchScreenProps> = ({
  rooms,
  orders,
  onOrdersUpdate,
  onPaymentsUpdate,
  onRoomsUpdate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [chargeToRoom, setChargeToRoom] = useState<boolean>(true);
  const [cart, setCart] = useState<{ [id: string]: number }>({});
  const [submitting, setSubmitting] = useState(false);

  const occupiedRooms = rooms.filter(r => r.status === 'Occupé');

  const handleAddToCart = (menuId: string) => {
    setCart(prev => ({ ...prev, [menuId]: (prev[menuId] || 0) + 1 }));
  };

  const handleRemoveFromCart = (menuId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[menuId] > 1) {
        copy[menuId]--;
      } else {
        delete copy[menuId];
      }
      return copy;
    });
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = BRUNCH_MENU.find(m => m.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = async () => {
    if (!selectedRoom) {
      alert('Veuillez sélectionner un numéro de chambre pour la commande.');
      return;
    }
    if (getCartCount() === 0) {
      alert('Votre panier est vide.');
      return;
    }

    setSubmitting(true);
    try {
      const orderItems: string[] = [];
      Object.entries(cart).forEach(([id, qty]) => {
        const item = BRUNCH_MENU.find(m => m.id === id);
        if (item) {
          orderItems.push(`${qty}x ${item.name}`);
        }
      });

      const totalBill = getCartTotal();
      const newOrder: BrunchOrder = {
        id: `CMD-${Math.floor(100 + Math.random() * 900)}`,
        roomNumber: selectedRoom,
        items: orderItems,
        totalAmount: totalBill,
        timestamp: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isChargedToRoom: chargeToRoom,
      };

      // 1. Create order
      await api.orders.create(newOrder);

      // 2. If charged to room, let's load reservations and find the active reservation for that room, then add the amount to the total bill of that reservation
      if (chargeToRoom) {
        const reservations = await api.reservations.getAll();
        const activeRes = reservations.find(r => r.roomNumber === selectedRoom && r.status === 'En Cours');
        if (activeRes) {
          await api.reservations.update(activeRes.id, {
            totalBill: activeRes.totalBill + totalBill,
          });
        }
      } else {
        // Create an immediate payment
        const newPayment: Payment = {
          id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
          reservationId: `WALK-IN-${newOrder.id}`,
          guestName: `Client Chambre ${selectedRoom} (Brunch)`,
          amount: totalBill,
          method: 'Espèces',
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        };
        await api.payments.create(newPayment);
        onPaymentsUpdate();
      }

      onOrdersUpdate();
      onRoomsUpdate();
      setCart({});
      setSelectedRoom('');
      alert('Commande de Brunch enregistrée avec succès !');
    } catch (err) {
      console.error(err);
      alert('Échec de validation de la commande.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleServeOrder = async (orderId: string) => {
    try {
      await api.orders.delete(orderId);
      onOrdersUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMenu = selectedCategory === 'all' 
    ? BRUNCH_MENU 
    : BRUNCH_MENU.filter(m => m.category === selectedCategory);

  return (
    <div id="brunch-screen" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Menu selection (Col 2) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Coffee className="w-6 h-6 text-[#fe6e00]" />
            Cuisine & Restauration (Brunch)
          </h1>
          <p className="text-sm text-gray-500">Prise de commande, brunchs signatures, et facturation automatique en chambre</p>
        </div>

        {/* Categories */}
        <div className="flex gap-2 border-b pb-4 border-gray-100 overflow-x-auto">
          {['all', 'Brunch', 'Sucré', 'Boisson'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-[#fe6e00] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat === 'all' ? 'Toute la Carte' : cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMenu.map((item) => {
            const count = cart[item.id] || 0;
            return (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:border-[#fe6e00]/50 transition-all">
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-outfit font-semibold text-gray-900 text-sm leading-tight">{item.name}</h3>
                    <span className="text-xs font-bold font-mono text-[#fe6e00] whitespace-nowrap">{item.price.toLocaleString()} FCFA</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal line-clamp-2">{item.description}</p>
                </div>

                <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-50">
                  {count > 0 ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-90 transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-sm w-6 text-center">{count}</span>
                      <button
                        onClick={() => handleAddToCart(item.id)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#fe6e00] text-white hover:bg-[#ff6b00] active:scale-90 transition-all shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item.id)}
                      className="flex items-center gap-1.5 bg-[#fe6e00]/10 hover:bg-[#fe6e00]/20 text-[#fe6e00] px-3 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Active Orders (Col 1) */}
      <div className="space-y-6">
        {/* Checkout Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2 border-gray-100">
            <h2 className="text-base font-outfit font-semibold text-gray-900 flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-gray-500" />
              Panier de commande
            </h2>
            <span className="bg-[#fe6e00]/10 text-[#fe6e00] text-[10px] px-2 py-0.5 rounded-full font-bold">
              {getCartCount()} articles
            </span>
          </div>

          {getCartCount() === 0 ? (
            <div className="text-center py-8 text-gray-400 text-xs">
              Aucun article sélectionné
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(cart).map(([id, qty]) => {
                  const item = BRUNCH_MENU.find(m => m.id === id);
                  if (!item) return null;
                  return (
                    <div key={id} className="flex justify-between items-center text-xs text-gray-700">
                      <span className="flex-1 truncate pr-2">
                        {qty}x {item.name}
                      </span>
                      <span className="font-mono text-gray-900 font-medium">
                        {(item.price * qty).toLocaleString()} FCFA
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-3 space-y-3">
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total :</span>
                  <span className="font-mono text-[#fe6e00]">{getCartTotal().toLocaleString()} FCFA</span>
                </div>

                {/* Destination configuration */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600">Attribuer à la chambre :</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium focus:ring-1 focus:ring-[#fe6e00] outline-none"
                  >
                    <option value="">-- Choisir une chambre --</option>
                    {occupiedRooms.map(r => (
                      <option key={r.id} value={r.id}>Chambre {r.id} ({r.type})</option>
                    ))}
                  </select>
                </div>

                {/* Payment option */}
                {selectedRoom && (
                  <div className="flex items-center gap-2 py-1.5">
                    <input
                      type="checkbox"
                      id="chargeToRoomCheck"
                      checked={chargeToRoom}
                      onChange={(e) => setChargeToRoom(e.target.checked)}
                      className="w-4 h-4 rounded text-[#fe6e00] focus:ring-[#fe6e00]"
                    />
                    <label htmlFor="chargeToRoomCheck" className="text-xs text-gray-600 cursor-pointer select-none">
                      Ajouter automatiquement sur la note de la chambre
                    </label>
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={submitting}
                  className="w-full bg-[#fe6e00] hover:bg-[#ff6b00] text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'Validation...' : 'Valider la commande'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Active Orders List */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-base font-outfit font-semibold text-gray-900 border-b pb-2 border-gray-100">
            Commandes en cours d'envoi
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {orders.length === 0 ? (
              <p className="text-center text-xs text-gray-400 py-4">Aucune commande en cours en cuisine</p>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="p-3 bg-[#fcfaf7] border border-gray-100 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#fe6e00]">{ord.id}</span>
                      <p className="text-xs font-semibold text-gray-800">Chambre {ord.roomNumber}</p>
                    </div>
                    <span className="text-[10px] text-gray-400">{ord.timestamp}</span>
                  </div>
                  <div className="space-y-0.5 pl-2 border-l-2 border-[#fe6e00]/20">
                    {ord.items.map((it, idx) => (
                      <p key={idx} className="text-[11px] text-gray-600 truncate">{it}</p>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100/50">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {ord.isChargedToRoom ? 'Facturé CH' : 'Payé Cash'}
                    </span>
                    <button
                      onClick={() => handleServeOrder(ord.id)}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-all"
                    >
                      Servi
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
