import Pet from '../models/Pet.js';

const PERSONALITY_WEIGHTS = {
  'active': { dog: 0.9, cat: 0.4, bird: 0.6 },
  'calm': { dog: 0.4, cat: 0.9, bird: 0.7 },
  'social': { dog: 0.8, cat: 0.5, bird: 0.9 },
  'independent': { dog: 0.3, cat: 0.9, bird: 0.5 }
};

export const petMatchingQuiz = async (req, res) => {
  try {
    const { 
      lifestyle, 
      homeSize, 
      energyLevel, 
      socialPreference, 
      timeAvailable 
    } = req.body;

    // Determine personality match
    let personalityType = 'independent';
    if (socialPreference === 'high' && energyLevel === 'high') {
      personalityType = 'active';
    } else if (socialPreference === 'low' && timeAvailable === 'limited') {
      personalityType = 'independent';
    } else if (socialPreference === 'high' && timeAvailable === 'plenty') {
      personalityType = 'social';
    } else if (energyLevel === 'low') {
      personalityType = 'calm';
    }

    // Filter pets based on home size and lifestyle
    const petFilter = {
      isAdopted: false
    };

    if (homeSize === 'small') {
      petFilter.$or = [
        { species: 'cat' },
        { species: 'bird' }
      ];
    }

    // Find potential pets
    const pets = await Pet.find(petFilter);

    // Score and rank pets
    const scoredPets = pets.map(pet => {
      let score = 0;

      // Personality match
      const personalityScore = PERSONALITY_WEIGHTS[personalityType][pet.species] || 0;
      score += personalityScore * 50;

      // Lifestyle match
      if (lifestyle === 'apartment' && pet.species !== 'dog') {
        score += 30;
      }

      // Time availability match
      if (timeAvailable === 'limited' && pet.species === 'cat') {
        score += 20;
      }

      return {
        pet,
        score
      };
    });

    // Sort pets by score in descending order
    const matchedPets = scoredPets
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.pet);

    res.json({
      message: 'Pet matching results',
      matchedPets,
      personalityType
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error in pet matching quiz', 
      error: error.message 
    });
  }
};
