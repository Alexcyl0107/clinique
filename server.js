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