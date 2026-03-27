require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');

// 路由 - 暂时注释掉，等后续任务实现
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const periodRoutes = require('./routes/periods');
// const temperatureRoutes = require('./routes/temperatures');
// const ovulationTestRoutes = require('./routes/ovulationTests');
// const intercourseRecordRoutes = require('./routes/intercourseRecords');
// const predictionRoutes = require('./routes/predictions');

const app = express();

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes - 暂时注释掉
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/periods', periodRoutes);
// app.use('/api/temperatures', temperatureRoutes);
// app.use('/api/ovulation-tests', ovulationTestRoutes);
// app.use('/api/intercourse-records', intercourseRecordRoutes);
// app.use('/api/predictions', predictionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});