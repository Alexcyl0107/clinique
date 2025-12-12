require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- MONGODB CONNECTION ---
// Note: Si MONGODB_URI n'est pas défini, le serveur démarre mais les appels DB échoueront.
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connecté'))
    .catch(err => console.error('❌ Erreur MongoDB:', err));
} else {
    console.warn('⚠️ MONGODB_URI non défini. Le backend ne persistera pas les données.');
}

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String, // En prod: Hash this!
    role: { type: String, enum: ['ADMIN', 'DOCTOR', 'PHARMACIST', 'PATIENT'] },
    referenceCode: String,
    height: Number,
    weight: Number,
    bloodGroup: String,
    phone: String
});
const User = mongoose.model('User', UserSchema);

const AppointmentSchema = new mongoose.Schema({
    patientId: String,
    patientName: String,
    patientPhone: String,
    symptoms: String,
    doctorId: String,
    serviceId: String,
    date: String,
    time: String,
    status: String,
    isEmergency: Boolean,
    isAcknowledged: Boolean,
    createdAt: { type: Date, default: Date.now }
});
const Appointment = mongoose.model('Appointment', AppointmentSchema);

const ProductSchema = new mongoose.Schema({
    name: String,
    category: String,
    price: Number,
    purchasePrice: Number,
    stock: Number,
    minStockAlert: Number,
    expiryDate: String,
    image: String,
    type: String
});
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
    patientName: String,
    total: Number,
    items: Array,
    date: { type: Date, default: Date.now },
    paymentMethod: String
});
const Order = mongoose.model('Order', OrderSchema);

// --- ROUTES ---

// 1. Auth
app.post('/api/auth/login', async (req, res) => {
    const { email, password, refCode } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }
        if (user.role !== 'PATIENT' && user.referenceCode !== refCode) {
            return res.status(403).json({ error: "Code de sécurité invalide" });
        }
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        // Pour la démo, on accepte le mot de passe en clair
        const newUser = await User.create({ ...req.body, role: 'PATIENT' });
        res.json(newUser);
    } catch (e) {
        res.status(400).json({ error: "Erreur lors de l'inscription (Email déjà utilisé ?)" });
    }
});

// 2. Appointments
app.get('/api/appointments', async (req, res) => {
    try {
        const apps = await Appointment.find().sort({ createdAt: -1 });
        res.json(apps);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const app = await Appointment.create({
            ...req.body,
            status: 'PENDING_DOCTOR',
            isAcknowledged: false
        });
        res.json(app);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/appointments/:id', async (req, res) => {
    try {
        const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/appointments/:id', async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 3. Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/products', async (req, res) => {
    try {
        const { id, ...data } = req.body;
        if (id) {
            const updated = await Product.findByIdAndUpdate(id, data, { new: true });
            return res.json(updated);
        }
        const newProd = await Product.create(data);
        res.json(newProd);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 4. Orders
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ date: -1 });
        res.json(orders);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/orders', async (req, res) => {
    try {
        const order = await Order.create(req.body);
        // Update stocks
        for (const item of req.body.items) {
            await Product.findByIdAndUpdate(item.product.id, { 
                $inc: { stock: -item.quantity } 
            });
        }
        res.json(order);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// 5. Stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalApps = await Appointment.countDocuments();
        const pendingApps = await Appointment.countDocuments({ status: 'PENDING_ADMIN' });
        const confirmedApps = await Appointment.countDocuments({ status: 'SCHEDULED' });
        
        // Urgences actives (non terminées)
        const emergencyCount = await Appointment.countDocuments({ isEmergency: true, status: { $ne: 'COMPLETED' } });
        // Urgences qui sonnent (non acquittées)
        const unacknowledged = await Appointment.countDocuments({ isEmergency: true, status: { $ne: 'COMPLETED' }, isAcknowledged: { $ne: true } });

        const products = await Product.find();
        const lowStock = products.filter(p => p.stock <= p.minStockAlert).length;

        // Mock daily revenue for demo if no orders
        const orders = await Order.find();
        const totalRev = orders.reduce((acc, o) => acc + o.total, 0);

        res.json({
            totalAppointments: totalApps,
            pendingAppointments: pendingApps,
            confirmedAppointments: confirmedApps,
            emergencyCount,
            unacknowledgedEmergencies: unacknowledged,
            lowStockItems: lowStock,
            totalProducts: products.length,
            todaysRevenue: totalRev, // Simplified
            monthlyRevenue: totalRev,
            salesData: [],
            topProducts: []
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur backend lancé sur le port ${PORT}`));