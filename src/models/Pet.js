import mongoose from 'mongoose';

const petSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  species: { 
    type: String, 
    required: true 
  },
  breed: String,
  age: Number,
  description: String,
  mood: {
    type: String,
    enum: ['happy', 'sad', 'playful', 'sleepy'],
    default: 'happy'
  },
  imageUrl: String,
  isAdopted: {
    type: Boolean,
    default: false
  },
  adoptionDate: Date,
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Dynamic mood logic
petSchema.pre('save', function(next) {
  const daysSinceCreation = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreation > 30 && !this.isAdopted) {
    this.mood = 'sad';
  } else if (daysSinceCreation > 15) {
    this.mood = 'sleepy';
  }
  
  next();
});

export default mongoose.model('Pet', petSchema);
