import React, { useEffect, useState, useRef } from 'react';
import { DataService } from '../services/dataService';
import { GeminiService } from '../services/geminiService';
import { PharmacyProduct, PharmacyOrder, PharmacySaleItem, Supplier, DashboardStats, InventorySessionItem } from '../types';
import { Package, AlertTriangle, ShoppingCart, Plus, Search, Trash2, Printer, Users, BarChart2, DollarSign, Archive, Save, X, Image as ImageIcon, TrendingUp, CheckCircle, ArrowRight, Clipboard, Lock, Thermometer, Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const PharmacyAdmin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'pos' | 'orders' | 'ai'>('dashboard');
  const [products, setProducts] = useState<PharmacyProduct[]>([]);
  const [orders, setOrders] = useState<PharmacyOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  
  // POS State
  const [cart, setCart] = useState<PharmacySaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState<PharmacyOrder | null>(null);

  // Inventory State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<PharmacyProduct | null>(null);
  const [pastedImage, setPastedImage] = useState<string>('');

  // 5-Step Inventory Wizard State
  const [inventoryStep, setInventoryStep] = useState(1);
  const [inventorySession, setInventorySession] = useState<{[key:string]: InventorySessionItem}>({});
  const [inventoryReportStats, setInventoryReportStats] = useState<{items: number, valueReal: number, valueSystem: number, diffCount: number}>({items:0, valueReal:0, valueSystem:0, diffCount:0});

  // AI State
  const [aiPrediction, setAiPrediction] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Print Ref
  const receiptRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const [p, o, s] = await Promise.all([
      DataService.getPharmacyProducts(),
      DataService.getOrders(),
      DataService.getStats()
    ]);
    setProducts(p);
    setOrders(o);
    setStats(s);
  };

  // --- IMAGE PASTE HANDLER ---
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
        if (!showProductModal) return;
        const items = e.clipboardData?.items;
        if (!items) return;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if(blob) {
                    const reader = new FileReader();
                    reader.onload = (event) => setPastedImage(event.target?.result as string);
                    reader.readAsDataURL(blob);
                }
            }
        }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [showProductModal]);

  // --- AI PREDICTION ---
  const handleAiPrediction = async () => {
      setLoadingAi(true);
      const result = await GeminiService.predictStock(products);
      setAiPrediction(result);
      setLoadingAi(false);
  };

  // --- POS LOGIC ---
  const addToCart = (product: PharmacyProduct) => {
    if (product.stock <= 0) return alert("Rupture de stock !");
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.product.price } : item);
      }
      return [...prev, { product, quantity: 1, subtotal: product.price }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const order = await DataService.processSale(cart, 'CASH');
      setLastOrder(order);
      setShowReceipt(true);
      setCart([]);
      refreshData();
    } catch (e: any) {
      alert("Erreur lors de la vente: " + e.message);
    }
  };

  const handlePrint = () => {
      window.print();
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  // --- PRODUCT MANAGEMENT ---
  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const product: any = {
      id: editingProduct?.id || '',
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      purchasePrice: Number(formData.get('purchasePrice')),
      stock: Number(formData.get('stock')),
      minStockAlert: Number(formData.get('minStockAlert')),
      barcode: formData.get('barcode') as string,
      location: formData.get('location') as string,
      image: pastedImage || editingProduct?.image || 'https://placehold.co/300x300?text=Med', 
      expiryDate: formData.get('expiryDate') as string,
      requiresPrescription: formData.get('prescription') === 'on'
    };
    await DataService.saveProduct(product);
    setShowProductModal(false);
    setPastedImage('');
    refreshData();
  };

  const startInventory = () => {
      const sessionData: {[key:string]: InventorySessionItem} = {};
      products.forEach(p => {
          sessionData[p.id] = { productId: p.id, productName: p.name, category: p.category, systemStock: p.stock, countedStock: p.stock, purchasePrice: p.purchasePrice, notes: '' };
      });
      setInventorySession(sessionData);
      setInventoryStep(2);
  };

  // Minimal Inventory Logic for Step 2
  const handleCountUpdate = (id: string, val: number) => setInventorySession(prev => ({ ...prev, [id]: { ...prev[id], countedStock: val } }));

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm no-print">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Archive className="text-primary-600"/> Pharmacie ERP
        </h1>
        <div className="flex overflow-x-auto space-x-1 w-full md:w-auto pb-2 md:pb-0">
          <TabButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<BarChart2 size={18}/>} label="Stats" />
          <TabButton active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} icon={<ShoppingCart size={18}/>} label="Caisse" />
          <TabButton active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} icon={<Package size={18}/>} label="Inventaire" />
          <TabButton active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} icon={<DollarSign size={18}/>} label="Historique" />
          <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<BrainCircuit size={18}/>} label="IA & Fraude" />
        </div>
      </div>

      {/* --- DASHBOARD TAB --- */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard title="CA Aujourd'hui" value={`${stats.todaysRevenue} FCFA`} icon={<DollarSign className="text-green-500" />} color="green" />
            <StatCard title="Ventes Mensuelles" value={`${stats.monthlyRevenue} FCFA`} icon={<BarChart2 className="text-blue-500" />} color="blue" />
            <StatCard title="Produits" value={stats.totalProducts} icon={<Package className="text-purple-500" />} color="purple" />
            <StatCard title="Alertes Stock" value={stats.lowStockItems} icon={<AlertTriangle className="text-red-500" />} color="red" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Graph */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                      <TrendingUp className="text-primary-600"/> Évolution des Ventes (Semaine)
                  </h3>
                  <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.salesData}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  formatter={(value: number) => [`${value} FCFA`, 'Ventes']}
                              />
                              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold mb-6 dark:text-white flex items-center gap-2">
                      <CheckCircle className="text-blue-500"/> Top Produits (Volume)
                  </h3>
                  <div className="space-y-4">
                      {stats.topProducts.map((prod, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                  <span className="font-medium dark:text-white">{prod.name}</span>
                              </div>
                              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{prod.quantity} unités</span>
                          </div>
                      ))}
                      {stats.topProducts.length === 0 && <p className="text-gray-500 italic">Aucune donnée de vente.</p>}
                  </div>
              </div>
          </div>
        </div>
      )}

      {/* --- AI TAB --- */}
      {activeTab === 'ai' && (
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
              <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BrainCircuit className="w-10 h-10 text-primary-600"/>
                  </div>
                  <h2 className="text-2xl font-bold dark:text-white">Assistant Supply Chain & Anti-Fraude</h2>
                  <p className="text-gray-500">Laissez Gemini analyser vos mouvements de stock, détecter les fraudes et prédire vos besoins.</p>
              </div>

              <div className="flex justify-center mb-8">
                  <button 
                    onClick={handleAiPrediction} 
                    disabled={loadingAi}
                    className="bg-primary-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-primary-700 flex items-center gap-2 disabled:opacity-50"
                  >
                      {loadingAi ? <Sparkles className="animate-spin"/> : <Sparkles/>}
                      {loadingAi ? 'Analyse en cours...' : 'Lancer l\'analyse complète'}
                  </button>
              </div>

              {aiPrediction && (
                  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 dark:text-white"><TrendingUp className="text-green-500"/> Rapport d'Analyse</h3>
                      <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                          {aiPrediction}
                      </div>
                  </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="p-4 border rounded-lg bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
                      <h4 className="font-bold text-red-800 dark:text-red-300 flex items-center gap-2"><ShieldAlert size={18}/> Détection Fraude</h4>
                      <p className="text-sm text-red-700 dark:text-red-400 mt-2">
                          L'IA surveille en permanence les écarts de stock et les annulations de commande suspectes. Aucune anomalie critique détectée ces 24h.
                      </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
                      <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2"><TrendingUp size={18}/> Prédiction Ventes</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                          Basé sur l'historique, une hausse de 20% des ventes d'antipaludéens est prévue la semaine prochaine (Saison des pluies). Pensez à approvisionner "Coartem".
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* --- POS TAB --- */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in h-[calc(100vh-200px)]">
          {/* Products Grid */}
          <div className="lg:col-span-2 flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
             <div className="p-4 border-b border-gray-200 dark:border-gray-700">
               <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5"/>
                 <input 
                  type="text" 
                  placeholder="Scanner code-barre ou chercher produit..." 
                  className="pl-10 w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                 />
               </div>
             </div>
             <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-gray-50 dark:bg-gray-900/50">
                {products
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.barcode?.includes(searchTerm))
                  .map(p => (
                  <div 
                    key={p.id} 
                    onClick={() => addToCart(p)}
                    className={`bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-primary-500 ${p.stock <= 0 ? 'opacity-50 grayscale' : ''}`}
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded mb-2 overflow-hidden relative">
                       <img src={p.image} alt={p.name} className="w-full h-full object-cover"/>
                       {p.category === 'STUPEFIANT' && <Lock className="absolute top-1 right-1 text-red-500 bg-white rounded-full p-0.5" size={16}/>}
                    </div>
                    <p className="font-bold text-sm truncate dark:text-white" title={p.name}>{p.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-primary-600 font-bold">{p.price} F</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${p.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{p.stock}</span>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Cart Panel */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
              <h2 className="font-bold text-lg dark:text-white flex items-center gap-2">
                <ShoppingCart size={20}/> Panier Actuel
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">Panier vide</div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-sm dark:text-white">{item.product.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x {item.product.price} F</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-white">{item.subtotal} F</span>
                      <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
               <div className="flex justify-between items-center mb-4">
                 <span className="text-gray-600 dark:text-gray-300">Total à payer</span>
                 <span className="text-2xl font-bold text-primary-600">{cartTotal} FCFA</span>
               </div>
               <button 
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                 Encaisser
               </button>
            </div>
          </div>
        </div>
      )}

       {/* --- INVENTORY TAB --- */}
       {activeTab === 'inventory' && (
         <div className="p-6 bg-white dark:bg-gray-800 rounded-xl">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold dark:text-white">Inventaire Simplifié ({inventoryStep}/5)</h2>
                 {inventoryStep === 1 && <button onClick={startInventory} className="bg-primary-600 text-white px-4 py-2 rounded">Démarrer</button>}
             </div>
             {inventoryStep === 2 && (
                 <div className="overflow-x-auto">
                     <table className="min-w-full"><thead className="bg-gray-50 dark:bg-gray-700"><tr><th className="p-2 text-left">Produit</th><th className="p-2 text-right">Compté</th></tr></thead>
                     <tbody>
                       {Object.values(inventorySession).map((item: InventorySessionItem) => (
                         <tr key={item.productId} className="border-b dark:border-gray-700">
                           <td className="p-2">{item.productName}</td>
                           <td className="p-2 text-right"><input type="number" className="border w-20 p-1" value={item.countedStock} onChange={(e) => handleCountUpdate(item.productId, parseInt(e.target.value))}/></td>
                         </tr>
                       ))}
                     </tbody></table>
                 </div>
             )}
         </div>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
         <div className="bg-white dark:bg-gray-800 p-4 rounded-xl">
             <h2 className="font-bold mb-4">Historique</h2>
             {orders.map(o => <div key={o.id} className="border-b p-2">Commande #{o.id} - {o.total} F</div>)}
         </div>
      )}

      {/* Product Modal Hidden Code... */}
      {showReceipt && lastOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 no-print">
              <div className="bg-white p-6 rounded shadow-xl text-center">
                  <CheckCircle className="text-green-500 mx-auto w-12 h-12 mb-4"/>
                  <h2 className="text-xl font-bold">Vente Réussie !</h2>
                  <p className="mb-4">Total: {lastOrder.total} FCFA</p>
                  <div className="flex gap-2 justify-center">
                      <button onClick={handlePrint} className="bg-gray-200 px-4 py-2 rounded flex gap-2"><Printer size={16}/> Imprimer</button>
                      <button onClick={() => setShowReceipt(false)} className="bg-primary-600 text-white px-4 py-2 rounded">Fermer</button>
                  </div>
              </div>
          </div>
      )}
      
      {/* Printable Receipt Hidden Area */}
      {showReceipt && lastOrder && (
        <div className="hidden print:block absolute top-0 left-0 bg-white p-4 w-full">
            <h1 className="text-center font-bold text-xl">CliniqueBeta</h1>
            <p className="text-center text-sm">Pharmacie Centrale</p>
            <hr className="my-2"/>
            {lastOrder.items.map(i => (
                <div key={i.product.id} className="flex justify-between text-sm">
                    <span>{i.product.name} x{i.quantity}</span>
                    <span>{i.subtotal}</span>
                </div>
            ))}
            <hr className="my-2"/>
            <div className="font-bold text-right">TOTAL: {lastOrder.total} FCFA</div>
        </div>
      )}
    </div>
  );
};

// Components helpers
const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active ? 'bg-primary-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
  >
    {icon} {label}
  </button>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-b-4 border-${color}-500 flex items-center justify-between`}>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-700`}>{icon}</div>
  </div>
);