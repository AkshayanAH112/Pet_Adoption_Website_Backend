import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Admin credentials - you can change these as needed
const adminCredentials = {
  username: 'admin',
  email: 'admin@petadoption.com',
  password: 'Admin@123',
  role: 'admin'
};

// Set MongoDB connection string directly
const MONGODB_URI = 'mongodb://localhost:27017/pet_adoption';

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Check if admin already exists
      const existingAdmin = await User.findOne({ 
        $or: [
          { username: adminCredentials.username },
          { email: adminCredentials.email },
          { role: 'admin' }
        ]
      });
      
      if (existingAdmin) {
        console.log('Admin account already exists:');
        console.log(`Username: ${existingAdmin.username}`);
        console.log(`Email: ${existingAdmin.email}`);
        console.log('Please use these credentials to login (with your existing password)');
      } else {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminCredentials.password, salt);
        
        // Create admin user
        const adminUser = new User({
          username: adminCredentials.username,
          email: adminCredentials.email,
          password: hashedPassword,
          role: adminCredentials.role
        });
        
        await adminUser.save();
        
        console.log('Admin account created successfully:');
        console.log(`Username: ${adminCredentials.username}`);
        console.log(`Email: ${adminCredentials.email}`);
        console.log(`Password: ${adminCredentials.password}`);
        console.log('Please save these credentials securely and change the password after first login.');
      }
    } catch (error) {
      console.error('Error creating admin account:', error);
    } finally {
      // Close the MongoDB connection
      mongoose.connection.close();
      console.log('MongoDB connection closed');
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
