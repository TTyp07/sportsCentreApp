const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/facilities', require('./routes/facility.routes'));
app.use('/api/bookings', require('./routes/booking.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/partners', require('./routes/partner.routes'));
app.use('/api/equipment', require('./routes/equipment.routes'));
app.use('/api/admin', require('./routes/admin.routes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));