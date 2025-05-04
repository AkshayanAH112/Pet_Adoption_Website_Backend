import User from '../models/User.js';
import Pet from '../models/Pet.js';
import { validateObjectId } from '../utils/validation.js';

// Get all users (admin only)
export const getUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Validate object ID
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const user = await User.findById(id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user (admin only)
export const updateUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const { name, email, role, status } = req.body;

    // Validate object ID
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.username = name; // Update username field with name value from frontend
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { id } = req.params;

    // Validate object ID
    if (!validateObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has pets and handle them
    const userPets = await Pet.find({ supplier: id });
    
    if (userPets.length > 0) {
      // Option 1: Delete all pets associated with this user
      await Pet.deleteMany({ supplier: id });
      
      // Option 2 (alternative): Transfer pets to admin or another user
      // await Pet.updateMany({ supplier: id }, { supplier: req.user._id });
    }

    // Delete user
    await User.findByIdAndDelete(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile (for the authenticated user to update their own profile)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Get the authenticated user's ID
    const { name, email, phone, address } = req.body;

    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get admin dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    // Get counts
    const userCount = await User.countDocuments();
    const shelterCount = await User.countDocuments({ role: 'shelter' });
    const adopterCount = await User.countDocuments({ role: 'adopter' });
    
    const petCount = await Pet.countDocuments();
    const adoptedPetCount = await Pet.countDocuments({ isAdopted: true });
    const availablePetCount = await Pet.countDocuments({ isAdopted: false });
    
    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');
    
    // Get recent pets
    const recentPets = await Pet.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('supplier', 'username');
    
    // Get pet species distribution
    const speciesDistribution = await Pet.aggregate([
      {
        $group: {
          _id: '$species',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      counts: {
        users: userCount,
        shelters: shelterCount,
        adopters: adopterCount,
        pets: petCount,
        adoptedPets: adoptedPetCount,
        availablePets: availablePetCount
      },
      recentUsers,
      recentPets,
      speciesDistribution
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
