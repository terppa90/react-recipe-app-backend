import express from 'express';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  deleteRecipe,
  updateRecipe,
  searchRecipes,
  addReview,
  deleteReview,
  getSuggestedRecipes,
} from '../controllers/recipeController.js';

import authenticateJWT from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', authenticateJWT, createRecipe);
router.delete('/:id', authenticateJWT, deleteRecipe);
router.put('/:id', authenticateJWT, updateRecipe);
router.get('/', searchRecipes);
router.post('/:id/reviews', authenticateJWT, addReview);
router.delete('/:id/reviews', authenticateJWT, deleteReview);
router.get('/suggested/:id', getSuggestedRecipes);

export default router;
