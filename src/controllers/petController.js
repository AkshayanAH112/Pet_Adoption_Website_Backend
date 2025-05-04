import Pet from '../models/Pet.js';
import cloudinary from '../config/cloudinaryConfig.js';
import fs from 'fs';

export const createPet = async (req, res) => {
  try {
    console.log('User attempting to create pet:', req.user);
    
    // Only allow shelter users to create pets
    if (req.user.role !== 'shelter') {
      return res.status(403).json({ 
        message: 'Only shelter users can create pets for adoption',
        userRole: req.user.role
      });
    }
    
    const { name, species, breed, age, description } = req.body;
    let imageUrl = '';

    // Handle image upload to Cloudinary
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary:', req.file.path);
        
        // Make sure the file exists before uploading
        if (!fs.existsSync(req.file.path)) {
          return res.status(400).json({ 
            message: 'Image file not found', 
            path: req.file.path 
          });
        }
        
        // Upload to Cloudinary with detailed options
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'pet_adoption',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill' }
          ],
          // Add unique public_id to avoid conflicts
          public_id: `pet_${Date.now()}`,
          overwrite: true,
          // Add tags for better organization
          tags: ['pet_adoption', 'pet']
        });
        
        console.log('Cloudinary upload successful:', result.secure_url);
        imageUrl = result.secure_url;

        // Remove temporary file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.warn('Could not delete temporary file:', unlinkError.message);
          // Continue even if we can't delete the temp file
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Error uploading image to Cloudinary', 
          error: uploadError.message,
          file: req.file
        });
      }
    }

    const newPet = new Pet({
      name,
      species,
      breed,
      age,
      description,
      imageUrl,
      supplier: req.user.id
    });

    await newPet.save();

    res.status(201).json({ 
      message: 'Pet created successfully', 
      pet: newPet 
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    res.status(500).json({ message: 'Error creating pet', error: error.message });
  }
};

export const getPets = async (req, res) => {
  try {
    const { species, mood, adopted } = req.query;
    
    let filter = {};
    if (species) filter.species = species;
    if (mood) filter.mood = mood;
    if (adopted !== undefined) filter.isAdopted = adopted === 'true';

    // Populate both the supplier and adoptedBy fields to get full user information
    const pets = await Pet.find(filter)
      .populate('supplier', 'username email role')
      .populate('adoptedBy', 'username email role');
    
    console.log('Fetched pets with populated fields:', 
      pets.map(pet => ({
        id: pet._id,
        name: pet.name,
        isAdopted: pet.isAdopted,
        adoptedBy: pet.adoptedBy,
        supplier: pet.supplier
      }))
    );
    
    res.json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    res.status(500).json({ message: 'Error fetching pets', error: error.message });
  }
};

export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pet', error: error.message });
  }
};

export const updatePet = async (req, res) => {
  try {
    console.log('Updating pet:', req.params.id);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Allow both the supplier and admin to update
    if (pet.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to update this pet',
        petSupplier: pet.supplier.toString(),
        userId: req.user.id,
        userRole: req.user.role
      });
    }

    // Update basic pet information
    const { name, species, breed, age, description, mood } = req.body;
    pet.name = name || pet.name;
    pet.species = species || pet.species;
    pet.breed = breed || pet.breed;
    pet.age = age || pet.age;
    pet.description = description || pet.description;
    pet.mood = mood || pet.mood;

    // Handle image upload to Cloudinary if a new image is provided
    if (req.file) {
      try {
        console.log('Uploading new image to Cloudinary:', req.file.path);
        
        // Make sure the file exists before uploading
        if (!fs.existsSync(req.file.path)) {
          return res.status(400).json({ 
            message: 'Image file not found', 
            path: req.file.path 
          });
        }
        
        // Upload to Cloudinary with detailed options
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'pet_adoption',
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill' }
          ],
          // Add unique public_id to avoid conflicts
          public_id: `pet_${pet._id}_${Date.now()}`,
          overwrite: true,
          // Add tags for better organization
          tags: ['pet_adoption', 'pet']
        });
        
        console.log('Cloudinary upload successful:', result.secure_url);
        pet.imageUrl = result.secure_url;

        // Remove temporary file
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.warn('Could not delete temporary file:', unlinkError.message);
          // Continue even if we can't delete the temp file
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ 
          message: 'Error uploading image to Cloudinary', 
          error: uploadError.message,
          file: req.file
        });
      }
    }

    await pet.save();

    res.json({ 
      message: 'Pet updated successfully', 
      pet 
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    res.status(500).json({ message: 'Error updating pet', error: error.message });
  }
};

export const deletePet = async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    // Allow both the supplier and admin to delete
    if (pet.supplier.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Not authorized to delete this pet',
        petSupplier: pet.supplier.toString(),
        userId: req.user.id,
        userRole: req.user.role
      });
    }

    await Pet.findByIdAndDelete(req.params.id);

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pet', error: error.message });
  }
};

export const adoptPet = async (req, res) => {
  try {
    console.log('User attempting to adopt pet:', req.user);
    
    const pet = await Pet.findById(req.params.id);
    
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }

    if (pet.isAdopted) {
      return res.status(400).json({ message: 'Pet is already adopted' });
    }

    // Mark the pet as adopted and store who adopted it
    pet.isAdopted = true;
    pet.adoptionDate = new Date();
    pet.adoptedBy = req.user.id;

    console.log(`Pet ${pet._id} adopted by user ${req.user.id}`);
    
    await pet.save();

    res.json({ 
      message: 'Pet adopted successfully', 
      pet 
    });
  } catch (error) {
    console.error('Error adopting pet:', error);
    res.status(500).json({ message: 'Error adopting pet', error: error.message });
  }
};
