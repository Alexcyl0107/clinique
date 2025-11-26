# CliniqueBeta - ERP Médical Intelligent

Plateforme de gestion hospitalière et pharmaceutique complète (React + TypeScript).

## 🔒 VOS ACCÈS DÉVELOPPEUR (PERSONNEL)

Ces comptes vous donnent un accès complet pour tester l'application.

**ASTUCE DEV :** Sur la page de connexion, **double-cliquez sur le logo (la croix)** pour remplir automatiquement les identifiants Admin ci-dessous.

| Rôle | Email | Code Sécurité (OBLIGATOIRE) | Mot de passe |
| :--- | :--- | :--- | :--- |
| **Admin (Tout Accès)** | `moi@admin.com` | `MOI-DEV-KEY` | `123456` |
| **Médecin** | `moi@doc.com` | `MOI-DEV-KEY` | `123456` |
| **Pharmacien** | `moi@pharma.com` | `MOI-DEV-KEY` | `123456` |
| **Patient** | `moi@patient.com` | *(Aucun)* | `123456` |

---

## 🌍 Comptes de Démonstration Standards

Si vous souhaitez tester les comptes par défaut du système :

*   **Admin :** `admin@clinic.com` | Code: `ADMIN-SECURE-2025`
*   **Médecin :** `doc@clinic.com` | Code: `DOC-MED-2025`
*   **Pharmacien :** `pharma@clinic.com` | Code: `PHARMA-STOCK-2025`
*   **Patient :** `patient@clinic.com`

---

## 🌟 Fonctionnalités Clés

*   **Intelligence Artificielle (Gemini) :**
    *   Triage automatique des patients lors de la prise de RDV.
    *   Détection d'interactions médicamenteuses.
    *   Prédiction des stocks et fraudes.
    *   Assistant clinique pour les médecins.
*   **Sécurité Renforcée :**
    *   Double validation pour le personnel (Email + Code unique).
    *   Logs d'audit.
*   **Workflow Clinique :**
    *   Demande RDV Patient -> Planification Médecin -> Validation Admin.
    *   Alerte Sonore "Code Blue" pour les urgences.
*   **Pharmacie ERP :**
    *   Gestion inventaire en 5 étapes.
    *   Copier-coller d'images produits (Ctrl+V).
    *   Point de vente (POS).

## 🚀 Installation & Lancement

1.  Cloner le projet.
2.  `npm install`
3.  Créer un fichier `.env` à la racine avec votre clé API Gemini :
    ```
    API_KEY=votre_cle_api_google_gemini_ici
    ```
    *(Si aucune clé n'est fournie, l'IA fonctionnera en mode simulation)*.
4.  `npm start` ou `npm run dev`

## 🌍 Déploiement

*   **Frontend :** Vercel
*   **Backend (Simulé) :** Les données sont stockées dans le `localStorage` du navigateur pour cette démo. Pour la production, connectez le `dataService.ts` à une API REST Node.js/MongoDB.