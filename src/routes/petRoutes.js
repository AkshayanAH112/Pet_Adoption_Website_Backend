import express from 'express';
import { 
  createPet, 
  getPets, 
  getPetById, 
  updatePet, 
  deletePet,
  adoptPet 
} from '../controllers/petController.js';
import { authenticateToken, checkRole } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Create pet (role check is in the controller)
router.post('/', authenticateToken, upload.single('image'), createPet);

// Anyone can view pets
router.get('/', getPets);
router.get('/:id', getPetById);

// Only the pet supplier can update or delete their pets
router.put('/:id', authenticateToken, upload.single('image'), updatePet);
router.delete('/:id', authenticateToken, deletePet);

// Only adopters can adopt pets
router.patch('/:id/adopt', authenticateToken, checkRole(['adopter']), adoptPet);

export default router;
