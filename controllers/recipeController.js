/* eslint-disable no-unused-vars */
import Recipe from '../models/recipe.js';

export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// export const getRecipeById = async (req, res) => {
//   const recipe = await Recipe.findById(req.params.id);
//   if (!recipe) return res.status(404).json({ error: 'Reseptiä ei löydy' });
//   res.json(recipe);
// };

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    res.status(200).json(recipe);
  } catch (error) {
    console.error('Virhe reseptiä haettaessa:', error);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};

export const createRecipe = async (req, res) => {
  try {
    const { title, ingredients, instructions, image } = req.body;
    const recipe = new Recipe({ title, ingredients, instructions, image });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Tallennus epäonnistui' });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Poisto epäonnistui' });
  }
};

export const updateRecipe = async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Päivitys epäonnistui' });
  }
};

export const searchRecipes = async (req, res) => {
  const { search } = req.query;

  try {
    let query = {};
    if (search) {
      query = {
        title: { $regex: search, $options: 'i' }, // Case-insensitive haku
      };
    }

    const recipes = await Recipe.find(query);
    res.status(200).json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Reseptien haku epäonnistui' });
  }
};

// export const addComment = async (req, res) => {
//   const { id } = req.params;
//   const { text, username } = req.body;

//   try {
//     const recipe = await Recipe.findById(id);
//     recipe.comments.push({ text, username });
//     await recipe.save();
//     res.status(200).json(recipe);
//   } catch (err) {
//     res.status(500).json({ error: 'Kommentin lisääminen epäonnistui' });
//   }
// };

//

export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const user = req.session.user;

  console.log('Käyttäjä:', user);

  // Tarkista että käyttäjä on kirjautunut
  if (!user || !user.id || !user.username) {
    return res.status(401).json({ message: 'Kirjautuminen vaaditaan' });
  }

  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    // Tarkista onko käyttäjä jo arvostellut reseptin
    const alreadyReviewed = recipe.reviews.find(
      (r) => r.user?.toString() === user.id || r.username === user.username
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: 'Olet jo arvostellut tämän reseptin' });
    }

    // Luo uusi arvostelu
    const newReview = {
      user: user.id,
      username: user.username,
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    recipe.reviews.push(newReview);
    await recipe.save();

    res.status(201).json({ message: 'Arvostelu lisätty', review: newReview });
  } catch (error) {
    console.error('Arvostelun lisäysvirhe:', error);
    res
      .status(500)
      .json({ message: 'Jokin meni pieleen arvostelun tallennuksessa.' });
  }
};

export const deleteReview = async (req, res) => {
  const userId = req.session.user?.id;
  const recipeId = req.params.id;

  if (!userId) {
    return res.status(401).json({ message: 'Kirjautuminen vaaditaan' });
  }

  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    const reviewIndex = recipe.reviews.findIndex(
      (review) => review.user.toString() === userId
    );

    if (reviewIndex === -1) {
      return res
        .status(404)
        .json({ message: 'Et ole arvostellut tätä reseptiä' });
    }

    recipe.reviews.splice(reviewIndex, 1);
    await recipe.save();

    res.status(200).json({ message: 'Arvostelu poistettu' });
  } catch (err) {
    console.error('Arvostelun poisto epäonnistui:', err);
    res.status(500).json({ message: 'Palvelinvirhe' });
  }
};
