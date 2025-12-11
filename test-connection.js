const mongoose = require('mongoose');
require('dotenv').config();

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student_management');
    console.log('✅ MongoDB Connected Successfully!');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available Collections:', collections.map(c => c.name));
    
    // Check students collection
    const Student = mongoose.model('Student', new mongoose.Schema({}));
    const studentCount = await Student.countDocuments();
    console.log('📊 Students in database:', studentCount);
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Connection Error:', error.message);
    process.exit(1);
  }
}

testConnection();