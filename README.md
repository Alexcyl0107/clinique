# CliniqueBeta - Guide de Déploiement Complet (MERN)

Ce projet est une application complète de gestion hospitalière et pharmaceutique.
Elle est conçue pour fonctionner avec une architecture **MERN** (MongoDB, Express, React, Node.js).

---

## 🏗️ PARTIE 1 : PRÉPARATION DE LA BASE DE DONNÉES (MongoDB Atlas)

1.  Allez sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) et créez un compte gratuit.
2.  Créez un nouveau **Cluster** (GRATUIT / M0 Sandbox).
3.  Dans "Database Access", créez un utilisateur (ex: `admin`) avec un mot de passe sécurisé.
4.  Dans "Network Access", ajoutez l'adresse IP `0.0.0.0/0` (pour autoriser l'accès depuis n'importe où).
5.  Cliquez sur **Connect** > **Drivers** et copiez votre "Connection String".
    *   Elle ressemble à : `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
    *   Remplacez `<password>` par votre mot de passe.
    *   **Gardez cette URL précieusement.**

---

## 🛠️ PARTIE 2 : CRÉATION DU BACKEND (Node.js + Express)

Puisque ce projet ne contient que le Frontend, vous devez créer un dossier séparé pour le backend.

1.  Créez un nouveau dossier sur votre ordinateur : `clinique-backend`.
2.  Ouvrez ce dossier dans un terminal et lancez :
    ```bash
    npm init -y
    npm install express mongoose cors dotenv
    ```
3.  Créez un fichier `server.js` et collez-y le code suivant :

```javascript
// server.js - Code complet du Backend
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// CONNEXION MONGODB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB Connecté'))
.catch(err => console.error('❌ Erreur MongoDB:', err));

// --- SCHEMAS (Modèles de données) ---
const UserSchema = new mongoose.Schema({
    name: String, email: {type: String, unique: true}, password: String,
    role: {type: String, enum: ['ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT']},
    referenceCode: String, height: Number, weight: Number, bloodGroup: String
});
const User = mongoose.model('User', UserSchema);

const AppointmentSchema = new mongoose.Schema({
    patientName: String, symptoms: String, status: String,
    date: String, time: String, isEmergency: Boolean, doctorId: String
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

const ProductSchema = new mongoose.Schema({
    name: String, category: String, price: Number, stock: Number, minStockAlert: Number
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    total: Number, date: Date, items: Array
});
const Order = mongoose.model('Order', OrderSchema);

// --- ROUTES API ---

// 1. Auth
app.post('/api/auth/login', async (req, res) => {
    const { email, password, refCode } = req.body;
    // En prod : Utilisez bcrypt pour vérifier le mot de passe hashé
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(401).json({error: "Invalid creds"});
    if (user.role !== 'PATIENT' && user.referenceCode !== refCode) return res.status(403).json({error: "Invalid Security Code"});
    res.json(user);
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const newUser = await User.create({...req.body, role: 'PATIENT', password: '123456'}); // Default pass for demo
        res.json(newUser);
    } catch(e) { res.status(400).json({error: e.message}); }
});

// 2. Appointments
app.get('/api/appointments', async (req, res) => {
    const apps = await Appointment.find().sort({_id: -1});
    res.json(apps);
});
app.post('/api/appointments', async (req, res) => {
    const app = await Appointment.create(req.body);
    res.json(app);
});
app.put('/api/appointments/:id/plan', async (req, res) => {
    await Appointment.findByIdAndUpdate(req.params.id, req.body);
    res.json({success: true});
});

// 3. Products (Pharmacie)
app.get('/api/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});
app.post('/api/products', async (req, res) => {
    const prod = await Product.create(req.body);
    res.json(prod);
});

// 4. Stats (Dashboard)
app.get('/api/stats/dashboard', async (req, res) => {
    const totalApps = await Appointment.countDocuments();
    const emergencyCount = await Appointment.countDocuments({isEmergency: true, status: {$ne: 'COMPLETED'}});
    const lowStock = await Product.countDocuments({stock: {$lt: 10}});
    res.json({
        totalAppointments: totalApps,
        emergencyCount,
        lowStockItems: lowStock,
        todaysRevenue: 150000 // À calculer dynamiquement avec les Orders
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));
```

4.  Créez un fichier `.env` dans le dossier backend :
    ```env
    MONGODB_URI=votre_connection_string_mongodb_copiée_etape_1
    PORT=5000
    ```
5.  Testez en local : `node server.js`.

---

## 🚀 PARTIE 3 : DÉPLOIEMENT DU BACKEND (Render)

1.  Poussez votre dossier `clinique-backend` sur GitHub.
2.  Allez sur [Render.com](https://render.com).
3.  Cliquez sur **New** > **Web Service**.
4.  Connectez votre repo GitHub Backend.
5.  Dans les configurations :
    *   **Build Command:** `npm install`
    *   **Start Command:** `node server.js`
6.  Cliquez sur **Advanced** et ajoutez la variable d'environnement :
    *   `MONGODB_URI` : (Collez votre lien MongoDB Atlas)
7.  Lancez le déploiement. Render vous donnera une URL (ex: `https://clinique-api.onrender.com`).

---

## 🌐 PARTIE 4 : DÉPLOIEMENT DU FRONTEND (Vercel)

1.  Poussez le code actuel (Frontend React) sur GitHub.
2.  Allez sur [Vercel.com](https://vercel.com).
3.  Importez votre projet Frontend.
4.  Dans **Environment Variables**, ajoutez :
    *   `NEXT_PUBLIC_API_URL` : `https://clinique-api.onrender.com/api` (L'URL de votre backend Render + /api)
    *   `REACT_APP_API_KEY` : (Votre clé Google Gemini si vous l'avez)
5.  Déployez.

---

## 🔑 ACCÈS ET TESTS

Une fois tout connecté, le Frontend parlera au Backend, qui stockera les données dans MongoDB.

Si le Backend est éteint, le Frontend utilisera automatiquement des **Données Mock** (simulation) pour ne pas afficher d'écran blanc.

**Identifiants Démo (Si DB vide) :**
Créer un compte via "S'inscrire" pour tester le flux complet.
