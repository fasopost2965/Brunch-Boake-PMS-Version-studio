import React, { useState } from 'react';
import { Room, BrunchOrder } from '../types';
import { BRUNCH_MENU } from '../data';
import { Coffee, Plus, Minus, ShoppingCart } from 'lucide-react';

interface BrunchScreenProps {
  rooms: Room[];
  orders: BrunchOrder[];
  setOrders: React.Dispatch<React.SetStateAction<BrunchOrder[]>>;
  setReservations: React.Dispatch<React.SetStateAction<any[]>>;
  triggerToast: (msg: string) => void;
}

export const BrunchScreen: React.FC<BrunchScreenProps> = ({
  rooms,
  orders,
  setOrders,
  setReservations,
  triggerToast
}) => {
  const [selectedRoom, setSelectedRoom] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  const occupiedRooms = rooms.filter(r => r.status === 'Occupé');

  const handleAddToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[itemId] <= 1) {
        delete copy[itemId];
      } else {
        copy[itemId]--;
      }
      return copy;
    });
  };

  const handleClearCart = () => setCart({});

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, qty]) => {
      const item = BRUNCH_MENU.find(i => i.id === itemId);
      return total + (item ? item.price * qty : 0);
    }, 0);
  };

  const handlePlaceOrder = () => {
    if (Object.keys(cart).length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    const orderItems: string[] = [];
    const orderTotal = getCartTotal();

    Object.entries(cart).forEach(([itemId, qty]) => {
      const item = BRUNCH_MENU.find(i => i.id === itemId);
      if (item) {
        orderItems.push(`${qty}x ${item.name}`);
      }
    });

    const isCharged = !!selectedRoom;
    const nextOrderId = `CMD-${String(orders.length + 101).padStart(3, '0')}`;

    const newOrder: BrunchOrder = {
      id: nextOrderId,
      roomNumber: selectedRoom || 'Vente Directe',
      items: orderItems,
      totalAmount: orderTotal,
      timestamp: '2026-07-11 16:50',
      isChargedToRoom: isCharged
    };

    setOrders(prev => [newOrder, ...prev]);

    if (isCharged) {
      // Add order total directly to the corresponding occupied room's current active reservation folio!
      setReservations(prev => prev.map(res => {
        if (res.roomNumber === selectedRoom && res.status === 'En Cours') {
          return {
            ...res,
            totalBill: res.totalBill + orderTotal
          };
        }
        return res;
      }));
      triggerToast(`Commande enregistrée et facturée sur la Chambre ${selectedRoom} (+${orderTotal.toLocaleString()} F).`);
    } else {
      triggerToast(`Commande payée directement d'une valeur de ${orderTotal.toLocaleString()} F.`);
    }

    setCart({});
    setSelectedRoom('');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="brunch_screen">
      <div>
        <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Brunch & Restauration (PDV)</h2>
        <p className="text-xs text-[#797067]">Prise de commande, facturation sur chambre ou vente comptoir.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Brunch Menu Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd]/80 pb-2">Menu du Jour</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BRUNCH_MENU.map(item => {
                const qtyInCart = cart[item.id] || 0;
                return (
                  <div key={item.id} className="border border-[#e3e0dd]/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#fe6e00]/50 hover:scale-[1.01] transition-all bg-white/50">
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-[9px] font-bold text-[#fe6e00] tracking-widest uppercase bg-[#fe6e00]/5 border border-[#fe6e00]/10 px-2 py-0.5 rounded-xl w-fit">
                        {item.category}
                      </span>
                      <h4 className="font-bold text-[#423d38] text-sm mt-1">{item.name}</h4>
                      <p className="text-[#797067] leading-relaxed text-[11px]">{item.desc}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#423d38] text-sm">{item.price.toLocaleString()} F</span>
                      
                      <div className="flex items-center gap-2">
                        {qtyInCart > 0 && (
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="w-7 h-7 rounded-xl bg-white border border-[#e3e0dd]/80 flex items-center justify-center hover:bg-[#f3f4f6]/80 transition-colors text-[#423d38] font-bold cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        )}
                        {qtyInCart > 0 && <span className="font-bold text-sm px-1 text-[#423d38]">{qtyInCart}</span>}
                        <button
                          onClick={() => handleAddToCart(item.id)}
                          className="w-7 h-7 rounded-xl bg-[#fe6e00] text-white flex items-center justify-center hover:bg-[#ff6b00] transition-colors font-bold cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4 text-xs h-full min-h-[350px]">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd]/80 pb-2 flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-[#fe6e00]" /> Panier Actif
            </h3>

            {Object.keys(cart).length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[#797067] italic gap-2 py-10">
                <Coffee className="w-8 h-8 text-[#e3e0dd]" />
                <span>Panier vide. Sélectionnez des délices à gauche.</span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-4">
                {/* Items */}
                <div className="flex flex-col gap-2 overflow-y-auto max-h-60 pr-1">
                  {Object.entries(cart).map(([itemId, qty]) => {
                    const item = BRUNCH_MENU.find(i => i.id === itemId);
                    if (!item) return null;
                    return (
                      <div key={itemId} className="flex justify-between items-center py-1.5 border-b border-[#e3e0dd]/80">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#423d38]">{item.name}</span>
                          <span className="text-[#797067] text-[10px]">{qty} x {item.price.toLocaleString()} F</span>
                        </div>
                        <span className="font-extrabold text-[#423d38]">{(item.price * qty).toLocaleString()} F</span>
                      </div>
                    );
                  })}
                </div>

                <div className="h-px bg-[#e3e0dd]/80"></div>

                {/* Billing selection */}
                <div className="flex flex-col gap-1.5 bg-[#f3f4f6]/50 p-3.5 rounded-xl border border-[#e3e0dd]/80">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de Facturation :</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="bg-white border border-[#e3e0dd]/80 rounded-xl p-2 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                  >
                    <option value="">Vente Directe (Comptoir / Cash)</option>
                    {occupiedRooms.map(r => (
                      <option key={r.id} value={r.id}>
                        Attribuer à Chambre CH {r.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtotal */}
                <div className="flex justify-between items-center text-sm font-black text-[#423d38] mt-2">
                  <span>Total à payer :</span>
                  <span className="text-base text-[#fe6e00] font-extrabold">{getCartTotal().toLocaleString()} F</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4">
                  <button
                    onClick={handleClearCart}
                    className="bg-[#f3f4f6]/50 hover:bg-[#e3e0dd]/80 text-[#423d38] border border-[#e3e0dd]/80 font-bold px-3 py-2.5 rounded-xl transition-all cursor-pointer flex-1"
                  >
                    Vider
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer flex-[2] text-center"
                  >
                    Valider la commande
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
