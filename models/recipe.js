import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const recipeSchema = mongoose.Schema({
  title: String,
  ingredients: String,
  instructions: String,
  // images: [String],
  image: String,
  // comments: [
  //   {
  //     username: String,
  //     text: String,
  //     createdAt: {
  //       type: Date,
  //       default: Date.now,
  //     },
  //   },
  // ],
  reviews: [reviewSchema],
});

let Recipe = mongoose.model('Recipe', recipeSchema);

export default Recipe;
