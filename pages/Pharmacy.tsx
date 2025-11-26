import React, { useEffect, useState } from 'react';
import { PharmacyProduct, PharmacySaleItem, DutyPharmacy } from '../types';
import { DataService } from '../services/dataService';
import { Search, ShoppingBag, Pill, Upload, AlertCircle, ShoppingCart, Trash2, X, Check, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Pharmacy: React.FC = () => {
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [dutyPharmacies, setDutyPharmacies] = useState<DutyPharmacy[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cart & Checkout
  const [cart, setCart] = useState<PharmacySaleItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    DataService.getPharmacyProducts().then(setProducts);
    DataService.getDutyPharmacies().then(setDutyPharmacies);
  }, []);

  const addToCart = (product: PharmacyProduct) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.price } : item);
      }
      return [...prev, { product, quantity: 1, subtotal: product.price }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handlePayment = async () => {
    if(!paymentMethod) return alert("Choisissez un moyen de paiement");
    try {
        await DataService.processSale(cart, paymentMethod, "Client Web");
        setOrderSuccess(true);
        setCart([]);
        setTimeout(() => { setIsCheckoutOpen(false); setOrderSuccess(false); setIsCartOpen(false); }, 3000);
    } catch(e) {
        alert("Erreur de paiement.");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><Pill className="text-primary-600"/> Pharmacie en Ligne</h1>
            <div className="relative w-full md:w-96 mt-4 md:mt-0">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                type="text"
                placeholder="Rechercher (Doliprane, Toux, ...)"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        {/* Duty Pharmacies Alert */}
        <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
             <h3 className="text-blue-800 dark:text-blue-300 font-bold flex items-center gap-2 mb-2">
                 <Clock size={20}/> Pharmacies de Garde (Cette Semaine)
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {dutyPharmacies.map(dp => (
                     <div key={dp.id} className="bg-white dark:bg-gray-800 p-3 rounded shadow-sm flex items-start gap-3">
                         <MapPin className="text-primary-500 mt-1 flex-shrink-0" size={18} />
                         <div>
                             <p className="font-bold text-sm dark:text-white">{dp.name}</p>
                             <p className="text-xs text-gray-500">{dp.location}</p>
                             <p className="text-xs font-mono text-primary-600 mt-1">{dp.phone}</p>
                         </div>
                     </div>
                 ))}
                 {dutyPharmacies.length === 0 && <p className="text-gray-500 text-sm italic">Aucune pharmacie de garde renseignée.</p>}
             </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col group">
              <div className="h-40 w-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                
                {/* Type Badge */}
                <span className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                   {product.type === 'SYRUP' ? '🧴 Sirop' : '💊 Comprimé'}
                </span>

                {product.stock <= 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white font-bold px-3 py-1 rounded transform -rotate-12">RUPTURE</span>
                  </div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="text-xs text-primary-600 dark:text-primary-400 font-semibold uppercase tracking-wider mb-1">
                  {product.category}
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {product.price} <span className="text-xs font-normal text-gray-500">FCFA</span>
                  </span>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className={`p-2 rounded-full ${
                      product.stock > 0
                      ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Button */}
      <button onClick={() => setIsCartOpen(true)} className="fixed bottom-24 right-6 bg-white dark:bg-gray-800 p-4 rounded-full shadow-2xl z-40 border border-primary-200 dark:border-gray-700">
         <div className="relative">
            <ShoppingCart className="text-primary-600" size={24}/>
            {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.reduce((a,b) => a + b.quantity, 0)}</span>}
         </div>
      </button>

      {/* Cart Sidebar */}
      {isCartOpen && (
         <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 h-full shadow-2xl p-6 flex flex-col animate-fade-in-right">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold dark:text-white flex gap-2"><ShoppingCart/> Mon Panier</h2>
                    <button onClick={() => setIsCartOpen(false)}><X className="dark:text-white"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.length === 0 && <p className="text-center text-gray-500 mt-10">Votre panier est vide.</p>}
                    {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                            <img src={item.product.image} className="w-12 h-12 object-cover rounded"/>
                            <div className="flex-1">
                                <p className="font-bold text-sm dark:text-white">{item.product.name}</p>
                                <p className="text-xs text-gray-500">{item.quantity} x {item.product.price} F</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-primary-600">{item.subtotal} F</p>
                                <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 text-xs hover:underline">Retirer</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-xl font-bold mb-4 dark:text-white">
                        <span>Total</span>
                        <span>{cartTotal} FCFA</span>
                    </div>
                    <button 
                        disabled={cart.length === 0} 
                        onClick={() => setIsCheckoutOpen(true)}
                        className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50"
                    >
                        Valider la commande
                    </button>
                </div>
            </div>
         </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl">
                 {!orderSuccess ? (
                    <>
                        <h2 className="text-xl font-bold mb-6 dark:text-white">Paiement Sécurisé</h2>
                        <div className="space-y-3 mb-6">
                            <p className="text-sm text-gray-500 mb-2">Choisissez votre méthode :</p>
                            {['FLOOZ', 'TMONEY', 'CARTE BANCAIRE'].map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => setPaymentMethod(m)}
                                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${paymentMethod === m ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'}`}
                                >
                                    <span className="font-bold dark:text-white">{m}</span>
                                    {paymentMethod === m && <Check className="text-primary-600"/>}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => setIsCheckoutOpen(false)} className="flex-1 py-3 border rounded-xl dark:text-white hover:bg-gray-50">Annuler</button>
                            <button onClick={handlePayment} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700">Payer {cartTotal} F</button>
                        </div>
                    </>
                 ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-10 h-10 text-green-600"/>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Paiement Réussi !</h3>
                        <p className="text-gray-500 mt-2">Votre commande arrive bientôt.</p>
                    </div>
                 )}
             </div>
          </div>
      )}
    </div>
  );
};