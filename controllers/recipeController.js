/* eslint-disable no-unused-vars */
import Recipe from '../models/recipe.js';
import mongoose from 'mongoose';

export const getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate(
      'userId',
      'username'
    );

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
    console.log('userId:', req.user.id);

    const { title, ingredients, instructions, image } = req.body;
    const recipe = new Recipe({
      title,
      ingredients,
      instructions,
      image,
      userId: req.user.id,
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: 'Tallennus epäonnistui' });
  }
};

export const deleteRecipe = async (req, res) => {
  try {
    console.log('Delete req by user: ', req.user);

    const recipe = await Recipe.findById(req.params.id);
    console.log('recipe.user: ', recipe.userId);

    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    if (!recipe.userId || recipe.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Ei oikeuksia poistaa tätä reseptiä' });
    }

    // Varmista että kirjautunut käyttäjä on reseptin omistaja
    if (recipe.userId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Ei oikeuksia poistaa tätä reseptiä' });
    }

    await recipe.deleteOne();
    res.status(200).json({ message: 'Resepti poistettu' });
  } catch (err) {
    console.error('Poistovirhe:', err);
    res.status(500).json({ message: 'Poistossa tapahtui virhe' });
  }
};

export const updateRecipe = async (req, res) => {
  const recipeId = req.params.id;

  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    // Varmista, että kirjautunut käyttäjä on reseptin luoja
    if (!recipe.userId || recipe.userId?.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Ei oikeutta muokata tätä reseptiä' });
    }

    // Päivitä kentät
    recipe.title = req.body.title;
    recipe.ingredients = req.body.ingredients;
    recipe.instructions = req.body.instructions;
    recipe.image = req.body.image;

    await recipe.save();

    res.status(200).json({ message: 'Resepti päivitetty', recipe });
  } catch (err) {
    console.error('Muokkausvirhe:', err);
    res.status(500).json({ message: 'Reseptin muokkauksessa tapahtui virhe' });
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

export const addReview = async (req, res) => {
  const recipeId = req.params.id;
  const { rating, comment } = req.body;

  console.log('Käyttäjä:', req.user);

  // Tarkistetaan että käyttäjä on kirjautunut
  if (!req.user) {
    return res.status(401).json({ message: 'Ei valtuutusta' });
  }

  try {
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    // Tarkistetaan onko käyttäjä jo arvostellut reseptin
    const existingReview = recipe.reviews.find(
      (r) => r.user.toString() === req.user.id
    );

    if (existingReview) {
      return res
        .status(400)
        .json({ message: 'Olet jo arvostellut tämän reseptin' });
    }

    // Luodaan uusi arvostelu
    const newReview = {
      user: req.user.id,
      username: req.user.username, // Lisätään myös username näkyvyyttä varten
      rating: Number(rating),
      comment,
      createdAt: new Date(),
    };

    recipe.reviews.push(newReview);
    await recipe.save();

    res.status(201).json({ message: 'Arvostelu lisätty', recipe });
  } catch (error) {
    console.error('Arvostelun lisäysvirhe:', error);
    res
      .status(500)
      .json({ message: 'Jokin meni pieleen arvostelun tallennuksessa.' });
  }
};

export const deleteReview = async (req, res) => {
  const recipeId = req.params.id;

  if (!req.user) {
    return res.status(401).json({ message: 'Ei valtuutusta' });
  }

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Reseptiä ei löytynyt' });
    }

    // Suodatetaan pois arvostelu, jonka käyttäjä haluaa poistaa
    const originalLength = recipe.reviews.length;
    recipe.reviews = recipe.reviews.filter(
      (review) => review.user.toString() !== req.user.id
    );

    if (recipe.reviews.length === originalLength) {
      return res
        .status(404)
        .json({ message: 'Arvostelua ei löytynyt tai se ei kuulu sinulle' });
    }

    await recipe.save();
    res.status(200).json({ message: 'Arvostelu poistettu', recipe });
  } catch (err) {
    console.error('Virhe arvostelun poistossa:', err);
    res.status(500).json({ message: 'Arvostelun poistaminen epäonnistui' });
  }
};

export const getSuggestedRecipes = async (req, res) => {
  try {
    const excludeId = req.params.id;
    const suggestions = await Recipe.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } },
      { $sample: { size: 2 } }, // random 2
    ]);

    res.json(suggestions);
  } catch (err) {
    console.error('Virhe ehdotetuissa resepteissä:', err);
    res.status(500).json({ message: 'Ehdotusten haku epäonnistui' });
  }
};
