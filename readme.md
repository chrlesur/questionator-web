# Questionator Web

Questionator Web est une application web qui génère automatiquement des questions à partir d'un texte donné en utilisant l'API Claude d'Anthropic. Cet outil est conçu pour créer des questionnaires pertinents basés sur le contenu fourni, ce qui peut être utile pour des fins éducatives, de révision ou de test de compréhension.

## Fonctionnalités

- Génération de questions basées sur un fichier texte téléchargé
- Utilisation de l'API Claude 3.5 Sonnet d'Anthropic pour une génération de questions de haute qualité
- Personnalisation du nombre de questions générées (1 à 15)
- Support de différents formats de sortie (texte, HTML, Markdown)
- Interface web responsive et conviviale
- Possibilité de télécharger les questions générées
- Gestion de la clé API Anthropic directement depuis l'interface web

## Prérequis

- Node.js (version 14.0.0 ou supérieure)
- Une clé API valide pour l'API Claude d'Anthropic (à obtenir sur le site d'Anthropic)

## Installation

1. Clonez ce dépôt :
   ```
   git clone https://github.com/chrlesur/questionator-web.git
   cd questionator-web
   ```

2. Installez les dépendances :
   ```
   npm install
   ```

## Utilisation

1. Démarrez le serveur :
   ```
   npm start
   ```

2. Ouvrez votre navigateur et accédez à `http://localhost:3000`.

3. Dans l'interface web :
   - Entrez votre clé API Anthropic dans le champ prévu à cet effet et cliquez sur "Sauvegarder et tester la clé"
   - Téléchargez un fichier texte contenant le contenu à partir duquel vous souhaitez générer des questions
   - Choisissez le nombre de questions à générer
   - Sélectionnez le format de sortie souhaité
   - Cliquez sur "Générer les questions"

4. Une fois les questions générées, vous pouvez les visualiser directement dans l'interface ou les télécharger dans le format choisi en cliquant sur le bouton "Télécharger".

## Structure du projet

- `server.js` : Point d'entrée du serveur Node.js
- `routes/api.js` : Routes API pour la génération de questions
- `public/` : Contient les fichiers statiques du frontend
  - `index.html` : Page principale de l'application
  - `css/styles.css` : Styles CSS de l'application
  - `js/main.js` : Script JavaScript principal du frontend

## Sécurité

La clé API est stockée localement dans le navigateur de l'utilisateur. Assurez-vous d'utiliser Questionator Web sur un appareil sécurisé et ne partagez pas votre clé API.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Contact

Si vous avez des questions ou des suggestions, n'hésitez pas à ouvrir une issue sur GitHub ou à me contacter directement à [christophe.lesur@cloud-temple.com].