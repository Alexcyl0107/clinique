import { GoogleGenAI } from "@google/genai";
import { User, PharmacyProduct, Appointment, DashboardStats } from "../types";

// NOTE: This requires an API Key. 
// For demo purposes, if no key is found, it falls back to a mock response.
// To use real AI, set process.env.API_KEY in your build environment.
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const GeminiService = {
  // --- 1. CHAT GÉNÉRAL & CONTEXTUEL (Assistant Médical Intelligent) ---
  chat: async (user: User, message: string, contextData: string, pageContext: string): Promise<string> => {
    if (!ai) return mockResponse(message, pageContext);

    try {
        const roleDesc = user.role === 'PATIENT' ? 'un patient' : `un membre du personnel (${user.role})`;
        
        let specificInstruction = "";
        if (pageContext === '/booking') {
            specificInstruction = "RÔLE: Agent de TRIAGE. Analyse les symptômes. Si fièvre/douleur, suggère le service adapté. Si urgence vitale (cœur, souffle), dis d'aller aux urgences immédiatement.";
        } else if (pageContext === '/pharmacy') {
            specificInstruction = "RÔLE: PHARMACIEN CONSEIL. Vérifie les interactions, propose des génériques. Ne valide jamais une ordonnance sans avis humain.";
        } else if (pageContext.includes('doctor')) {
            specificInstruction = "RÔLE: ASSISTANT CLINIQUE. Aide au diagnostic différentiel, résume les dossiers. Sois technique et précis (Terminologie médicale).";
        } else if (pageContext.includes('pharmacy-admin')) {
             specificInstruction = "RÔLE: EXPERT SUPPLY CHAIN. Analyse les stocks, prédis les ruptures, détecte les anomalies de commande.";
        } else if (pageContext.includes('patient')) {
             specificInstruction = "RÔLE: ASSISTANT SANTÉ PERSONNEL. Rappelle l'hydratation, explique les ordonnances simplement, rassure.";
        }

        const systemPrompt = `
            Tu es l'IA centrale de CliniqueBeta.
            Ton interlocuteur est ${roleDesc} nommé ${user.name}.
            Contexte Page : ${pageContext}
            Données Contexte : ${contextData}

            RÈGLES :
            1. SÉCURITÉ : En cas d'urgence vitale, renvoie vers le 911 ou le bouton URGENCE.
            2. ${specificInstruction}
            3. Réponds de manière courte et structurée.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: { systemInstruction: systemPrompt }
        });

        return response.text || "Désolé, je n'ai pas pu générer de réponse.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Erreur technique IA. Veuillez réessayer.";
    }
  },

  // --- 2. VISION (OCR ORDONNANCE & LABO) ---
  analyzeImage: async (base64Image: string, type: 'PRESCRIPTION' | 'LAB_RESULT'): Promise<string> => {
      if (!ai) return type === 'PRESCRIPTION' 
          ? "Simulation OCR: Paracétamol 1g (3 boîtes), Amoxicilline 500mg (2 boîtes) détectés." 
          : "Simulation Labo: Glycémie à jeun 1.2g/L (Élevée). Le reste est normal.";

      try {
          const prompt = type === 'PRESCRIPTION' 
            ? "Agis comme un pharmacien. Lis cette ordonnance. Liste les médicaments, dosages et quantités. Sors le résultat en texte clair."
            : "Agis comme un biologiste. Analyse ce résultat de laboratoire. Indique les valeurs anormales en gras et suggère une interprétation clinique.";

          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: {
                  parts: [
                      { text: prompt },
                      { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } }
                  ]
              }
          });
          return response.text || "Image illisible.";
      } catch (e) {
          return "Erreur d'analyse d'image.";
      }
  },

  // --- 3. ANALYSE TRIAGE (Booking) ---
  analyzeTriage: async (symptoms: string): Promise<{urgency: boolean, service: string, advice: string}> => {
      if (!ai) {
          // Mock simple logic
          const isUrgent = symptoms.toLowerCase().includes('douleur') || symptoms.toLowerCase().includes('fièvre') || symptoms.toLowerCase().includes('sang');
          return { 
              urgency: isUrgent, 
              service: isUrgent ? 'Urgences' : 'Médecine Générale', 
              advice: 'Simulation: Repos et hydratation en attendant.' 
          };
      }

      const prompt = `
        Analyse ces symptômes : "${symptoms}".
        Détermine :
        1. Si c'est une URGENCE (Oui/Non).
        2. Le service le plus adapté (Cardiologie, Pédiatrie, Généraliste, Gynéco, Ophtalmo, etc.).
        3. Un conseil court.
        Réponds UNIQUEMENT au format JSON : { "urgency": boolean, "service": string, "advice": string }
      `;
      
      try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        return JSON.parse(response.text || "{}");
      } catch (e) {
          return { urgency: false, service: 'Généraliste', advice: 'Consultation standard recommandée.' };
      }
  },

  // --- 4. PRÉDICTION STOCK & FRAUDE (Pharma Admin) ---
  predictStock: async (products: PharmacyProduct[]): Promise<string> => {
      if (!ai) return "Simulation: Rupture probable de Paracétamol dans 3 jours. Anomalie détectée sur stock 'Morphine' (écart inexpliqué).";

      const productSummary = products.map(p => `${p.name} (Stock: ${p.stock}, Seuil: ${p.minStockAlert})`).join(', ');

      const prompt = `
        Analyse cette liste de stock : ${productSummary}.
        Tâche 1: Prédiction de rupture (basée sur stock < seuil * 1.5).
        Tâche 2: Détection anomalies (Stocks négatifs ou incohérents).
        Tâche 3: Suggestion de commande.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      return response.text || "Analyse impossible.";
  },

  // --- 5. ASSISTANT CLINIQUE (Médecin) ---
  generateMedicalReport: async (notes: string, patientInfo: string): Promise<string> => {
      if (!ai) return "Rapport généré automatiquement : Patient stable. Constantes normales. Traitement continué.";

      const prompt = `
        Génère un compte-rendu médical structuré (SOAP: Subjectif, Objectif, Analyse, Plan).
        Patient: ${patientInfo}
        Notes du médecin: "${notes}"
        Ajoute une section "Diagnostic différentiel suggéré" basé sur les symptômes.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      return response.text || "Erreur génération rapport.";
  },

  // --- 6. OPTIMISATION PLANNING (Médecin) ---
  optimizeSchedule: async (appointments: Appointment[]): Promise<string> => {
      if (!ai) return "Suggestion : Regrouper les consultations pédiatriques le matin. 2 créneaux libres détectés mardi à 14h.";

      const appList = appointments.map(a => `${a.date} ${a.time} - ${a.status}`).join('\n');
      const prompt = `
        Analyse ce planning :
        ${appList}
        Suggère des optimisations pour réduire les temps d'attente et regrouper les types de consultations.
        Identifie les risques de retard.
      `;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    return response.text || "Optimisation indisponible.";
  },

  // --- 7. INTERACTIONS MÉDICAMENTEUSES (Pharmacie) ---
  checkDrugInteractions: async (drugs: string[]): Promise<string> => {
      if (!ai) return "Simulation: Aucune interaction majeure détectée entre ces produits.";
      
      const prompt = `
        Analyse la liste de médicaments suivante : ${drugs.join(', ')}.
        Y a-t-il des interactions médicamenteuses dangereuses ?
        Y a-t-il des contre-indications majeures ?
        Réponds de manière concise.
      `;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      return response.text || "Analyse interactions impossible.";
  }
};

// --- MOCK RESPONSES ---
const mockResponse = (msg: string, context: string) => {
    const lower = msg.toLowerCase();
    if (lower.includes('horaire')) return "Nos horaires : Lundi-Vendredi 7h30-18h30. Urgences 24/7.";
    if (lower.includes('tete') || lower.includes('fievre')) return "Je recommande le service de Médecine Générale. Si difficulté respiratoire, allez aux Urgences.";
    if (lower.includes('rdv') || lower.includes('rendez-vous')) return "Vous pouvez prendre RDV via l'onglet 'Prendre RDV'. Je peux optimiser le créneau pour vous.";
    return "Je suis Gemini (Mode Démo). Configurez une clé API pour activer mes fonctions avancées (Triage, Vision, Prédictions, Planning).";
};