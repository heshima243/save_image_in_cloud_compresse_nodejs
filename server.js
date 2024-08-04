const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars').engine;
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs'); // Ajout de l'importation du module fs

const Handlebars = require('handlebars');
const expressHandlebars = require('express-handlebars').engine;
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');

const upload = multer({ dest: 'uploads/' });

mongoose.connect('mongodb+srv://heshimajulienofficial:55Y6SVqn8LW1Z55l@backendapi.gock3f5.mongodb.net/?retryWrites=true&w=majority&appName=backendAPI', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB'));
db.once('open', () => {
  console.log('Connecté à la base de données MongoDB');
});

const imageSchema = new mongoose.Schema({
  name: String,
  path: String,
});

const Image = mongoose.model('Image', imageSchema);

const app = express();

app.engine('handlebars', expressHandlebars({
  handlebars: allowInsecurePrototypeAccess(Handlebars)
}));
app.set('view engine', 'handlebars');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.get('/', (req, res) => {
  res.render('upload');
});

app.post('/upload', upload.single('image'), async (req, res) => {
  const { originalname, path: tempPath } = req.file;
  const compressedPath = `uploads/compressed-${originalname}`;

  try {
    await sharp(tempPath)
      .resize({ width: 800 }) // Redimensionner l'image à une largeur de 800px
      .toFile(compressedPath);

    // Supprimer le fichier original non compressé
    fs.unlinkSync(tempPath);

    const newImage = new Image({
      name: originalname,
      path: compressedPath,
    });

    await newImage.save();
    console.log('Image compressée et sauvegardée avec succès');
  } catch (err) {
    console.error(err);
  }

  res.redirect('/images');
});

app.get('/images', async (req, res) => {
  try {
    const images = await Image.find({});
    res.render('images', { images });
  } catch (error) {
    console.log(error);
    res.render('error');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
