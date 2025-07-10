import express from 'express';
import {
  getAllRecipes,
  getRecipeById,
  createRecipe,
  deleteRecipe,
  updateRecipe,
  searchRecipes,
  // addComment,
  addReview,
  deleteReview,
} from '../controllers/recipeController.js';

const router = express.Router();

router.get('/', getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', createRecipe);
router.delete('/:id', deleteRecipe);
router.put('/:id', updateRecipe);
router.get('/', searchRecipes);
// router.post('/:id/comments', addComment);
router.post('/:id/reviews', addReview);
router.delete('/:id/reviews', deleteReview);

export default router;
