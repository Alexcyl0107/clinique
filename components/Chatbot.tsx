import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GeminiService } from '../services/geminiService';
import { useClinic } from '../context/ClinicContext';
import { DataService } from '../services/dataService';
import { useLocation } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  isAlert?: boolean;
}

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Bonjour ! Je suis l'Assistant IA de CliniqueBeta. Je peux vous aider pour le triage, les horaires ou vos questions médicales.", sender: 'bot' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { user } = useAuth();
  const { config } = useClinic();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Suggest actions based on route (Context Awareness)
  const getSuggestedActions = () => {
      const path = location.pathname;
      if (path === '/booking') return [
          { label: "Analyser mes symptômes", query: "J'ai mal à la tête, de la fièvre et des courbatures. Quel service ?" },
          { label: "Meilleur créneau", query: "Quel est le meilleur moment pour venir demain ?" }
      ];
      if (path === '/pharmacy') return [
          { label: "Chercher médicament", query: "Avez-vous du Paracétamol en stock ?" },
          { label: "Vérifier Interactions", query: "Puis-je prendre de l'Aspirine avec des anticoagulants ?" }
      ];
      if (path.includes('doctor')) return [
          { label: "Générer Rapport", query: "Génère un compte-rendu pour le dernier patient." },
          { label: "Aide Diagnostic", query: "Suggère un diagnostic : fièvre persistante, fatigue, toux sèche." },
          { label: "Optimiser Planning", query: "Optimise mon planning de la semaine." }
      ];
      if (path.includes('pharmacy-admin')) return [
          { label: "Prédiction Stock", query: "Analyse les risques de rupture." },
          { label: "Détection Fraude", query: "Y a-t-il des anomalies dans les commandes récentes ?" }
      ];
      // Default / Patient Portal
      return [
          { label: "Prendre RDV", query: "Comment prendre rendez-vous ?" },
          { label: "Conseil Santé", query: "Comment prévenir le paludisme ?" },
          { label: "Mes Documents", query: "Où sont mes résultats ?" }
      ];
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || !user) return;

    const userMsg: Message = { id: Date.now(), text: textToSend, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
        // 1. Build Data Context
        let context = `Nom de la clinique: ${config.name}. Téléphone: ${config.phone}. `;
        
        if (user.role === 'ADMIN' || user.role === 'PHARMACIST') {
             const stats = await DataService.getStats();
             context += `Données Temps Réel: ${stats.lowStockItems} produits bas, ${stats.pendingOrders} commandes en attente.`;
        }
        
        // 2. Call Gemini with Page Context
        const replyText = await GeminiService.chat(user, userMsg.text, context, location.pathname);
        
        setIsTyping(false);
        setMessages(prev => [...prev, { 
            id: Date.now()+1, 
            text: replyText, 
            sender: 'bot', 
            isAlert: replyText.includes('URGENCE') || replyText.includes('911')
        }]);

    } catch (e) {
        setIsTyping(false);
        setMessages(prev => [...prev, { id: Date.now()+1, text: "Erreur de connexion à l'IA.", sender: 'bot' }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-transform hover:scale-110 flex items-center gap-2 group"
        >
          <div className="relative">
            <Sparkles size={24} className="group-hover:animate-spin" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
            </span>
          </div>
          <span className="font-bold hidden md:inline">Assistant IA</span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white dark:bg-gray-800 w-80 md:w-96 rounded-2xl shadow-2xl flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden animate-fade-in-up h-[600px]">
          {/* Header */}
          <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <Bot size={24} />
              <div>
                <h3 className="font-bold">Gemini Intelligence</h3>
                <p className="text-xs text-primary-100 opacity-80 flex items-center gap-1">
                   <Sparkles size={10}/>
                   {location.pathname === '/booking' ? 'Mode Triage' : 
                     location.pathname.includes('doctor') ? 'Assistant Clinique' : 
                     location.pathname.includes('pharmacy') ? 'Expert Pharma' : 'Assistant Santé'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-primary-700 p-1 rounded">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                  msg.sender === 'user' 
                    ? 'bg-primary-600 text-white rounded-br-none' 
                    : msg.isAlert 
                        ? 'bg-red-100 text-red-800 border border-red-300 rounded-bl-none font-bold'
                        : 'bg-white dark:bg-gray-800 dark:text-gray-200 text-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none'
                }`}>
                  {msg.isAlert && <ShieldAlert size={16} className="mb-1 inline mr-1"/>}
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
                <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl rounded-bl-none text-xs text-gray-500 flex items-center gap-2">
                        <Sparkles size={12} className="animate-spin text-primary-500"/> Analyse en cours...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 font-bold uppercase">Suggestions contextuelles</p>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {getSuggestedActions().map((action, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSend(action.query)}
                        className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-xs text-primary-600 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-gray-600 transition-colors shadow-sm"
                      >
                          {action.label}
                      </button>
                  ))}
              </div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Posez une question..."
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
            <button onClick={() => handleSend()} className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700">
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};