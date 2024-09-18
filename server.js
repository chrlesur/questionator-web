const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('./routes/api');
const logger = require('./logger');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// Servir les fichiers statiques depuis le dossier 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware pour la journalisation des requêtes HTTP
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.url}`);
  next();
});

app.use('/api', apiRoutes);

// Gestion des erreurs
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  res.status(500).send('Une erreur est survenue');
});

app.listen(port, () => {
  logger.info(`Questionator Web server running on port ${port}`);
});

// Gestion des rejets de promesses non gérés
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
