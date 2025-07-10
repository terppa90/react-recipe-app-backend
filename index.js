import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import recipeRoutes from './routes/recipeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(
  cors({
    // origin: 'http://localhost:5173',
    origin: 'https://react-recipe-app-2025.netlify.app/',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 10000 })
);
app.use(
  session({
    secret: 'salainenavain',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // true vain HTTPS:llä
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// eslint-disable-next-line no-undef
await mongoose.connect(process.env.MONGO_URI);

app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);

app.listen(3001, () => {
  console.log('Palvelin käynnissä http://localhost:3001');
});

// import express from 'express';
// import cors from 'cors';
// import mongoose from 'mongoose';
// import Recipe from './models/recipe.js';

// const app = express();
// app.use(express.json({ limit: '10mb' }));
// app.use(
//   express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 10000 })
// );
// app.use(cors());

// // Tietokantayhteys
// await mongoose.connect(
//   'mongodb+srv://terppa:terppa666@cluster0.bkqsg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
// );

// // API-reitit
// app.get('/api/recipes', async (req, res) => {
//   const recipes = await Recipe.find();
//   res.json(recipes);
// });

// app.get('/api/recipes/:id', async (req, res) => {
//   try {
//     const recipe = await Recipe.findById(req.params.id);
//     if (!recipe) return res.status(404).json({ error: 'Reseptiä ei löytynyt' });
//     res.json(recipe);
//   } catch (err) {
//     console.error('Yksittäisen reseptin hakuvirhe:', err);
//     res.status(500).json({ error: 'Virhe haettaessa reseptiä' });
//   }
// });

// app.post('/api/recipes', async (req, res) => {
//   const recipe = new Recipe(req.body);
//   await recipe.save();
//   res.status(201).json(recipe);
// });

// // app.post('/api/recipes', async (req, res) => {
// //   try {
// //     const { title, ingredients, instructions, images } = req.body;
// //     const recipe = new Recipe({ title, ingredients, instructions, images });
// //     await recipe.save();
// //     res.status(201).json(recipe);
// //   } catch (err) {
// //     console.error('Virhe tallennettaessa:', err);
// //     res.status(500).json({ error: 'Tallennus epäonnistui' });
// //   }
// // });

// app.put('/api/recipes/:id', async (req, res) => {
//   console.log('Muokataan reseptiä id: ' + req.params.id);

//   try {
//     const updatedRecipe = await Recipe.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(updatedRecipe);
//   } catch (err) {
//     console.error('Päivitysvirhe:', err);
//     res.status(500).json({ error: 'Päivitys epäonnistui' });
//   }
// });

// app.delete('/api/recipes/:id', async (req, res) => {
//   console.log('Poistetaan id: ' + req.params.id);

//   try {
//     const { id } = req.params;
//     await Recipe.findByIdAndDelete(id);
//     res.status(204).send(); // No Content
//   } catch (err) {
//     console.error('Poistovirhe:', err);
//     res.status(500).json({ error: 'Reseptin poistaminen epäonnistui' });
//   }
// });

// app.listen(3001, () => console.log('Server running on http://localhost:3001'));
