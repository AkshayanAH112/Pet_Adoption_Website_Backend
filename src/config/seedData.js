import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Pet from '../models/Pet.js';

// Default user accounts
const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@petadoption.com',
    password: 'Admin@123',
    role: 'admin'
  },
  {
    username: 'shelter1',
    email: 'shelter@petadoption.com',
    password: 'Shelter@123',
    role: 'shelter'
  },
  {
    username: 'adopter1',
    email: 'adopter@petadoption.com',
    password: 'Adopter@123',
    role: 'adopter'
  }
];

// Sample pets data (will be created if no pets exist)
const samplePets = [
  {
    name: 'Max',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    description: 'Friendly and playful golden retriever who loves long walks and playing fetch.',
    mood: 'happy',
    isAdopted: false
  },
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Siamese',
    age: 2,
    description: 'Elegant Siamese cat who enjoys sunbathing and quiet naps.',
    mood: 'sleepy',
    isAdopted: false
  },
  {
    name: 'Buddy',
    species: 'dog',
    breed: 'Labrador',
    age: 4,
    description: 'Energetic Labrador who loves swimming and playing with kids.',
    mood: 'playful',
    isAdopted: false
  }
];

// Function to seed the database with initial data
export const seedDatabase = async () => {
  console.log('Checking if database needs to be seeded...');
  
  try {
    // Check if admin user exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    if (adminCount === 0) {
      console.log('No admin account found. Creating default users...');
      
      // Create default users
      for (const userData of defaultUsers) {
        const existingUser = await User.findOne({ 
          $or: [{ username: userData.username }, { email: userData.email }]
        });
        
        if (!existingUser) {
          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(userData.password, salt);
          
          // Create new user
          const newUser = new User({
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            role: userData.role
          });
          
          await newUser.save();
          console.log(`Created ${userData.role} account: ${userData.username} (${userData.email})`);
        } else {
          console.log(`User ${existingUser.username} already exists, skipping creation.`);
        }
      }
      
      console.log('Default users created successfully!');
    } else {
      console.log('Admin account already exists, skipping user creation.');
    }
    
    // Check if there are any pets
    const petCount = await Pet.countDocuments();
    
    if (petCount === 0) {
      console.log('No pets found. Creating sample pets...');
      
      // Get shelter user to assign as supplier
      const shelterUser = await User.findOne({ role: 'shelter' });
      
      if (shelterUser) {
        // Create sample pets
        for (const petData of samplePets) {
          const newPet = new Pet({
            ...petData,
            supplier: shelterUser._id
          });
          
          await newPet.save();
          console.log(`Created pet: ${petData.name} (${petData.species})`);
        }
        
        console.log('Sample pets created successfully!');
      } else {
        console.log('No shelter user found. Skipping pet creation.');
      }
    } else {
      console.log('Pets already exist, skipping pet creation.');
    }
    
    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

export default seedDatabase;
