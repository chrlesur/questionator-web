const express = require('express');
const router = express.Router();
const axios = require('axios');
const logger = require('../logger');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// URL et modèle de l'API Claude mis à jour
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL_NAME = 'claude-3-5-sonnet-20240620';

router.post('/test-api-key', async (req, res) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(400).json({ error: "La clé API Anthropic est requise" });
    }

    try {
        const response = await axios.post(CLAUDE_API_URL, {
            model: CLAUDE_MODEL_NAME,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Test de la clé API' }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        });

        if (response.status === 200) {
            res.json({ message: 'Clé API valide' });
        } else {
            res.status(400).json({ error: 'Clé API invalide' });
        }
    } catch (error) {
        logger.error("Erreur lors du test de la clé API:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Erreur lors du test de la clé API" });
    }
});

router.post('/generate-questions', upload.single('file'), async (req, res) => {
    const apiKey = req.headers['x-api-key'];
    const { count, format = 'html' } = req.body;
    const file = req.file;

    logger.info(`Demande de génération reçue. Count: ${count}, Format: ${format}`);

    if (!file) {
        return res.status(400).json({ error: "Aucun fichier n'a été téléchargé" });
    }

    if (!count) {
        return res.status(400).json({ error: "Le nombre de questions est requis" });
    }

    if (!apiKey) {
        return res.status(400).json({ error: "La clé API Anthropic est requise" });
    }

    try {
        const text = file.buffer.toString('utf-8');
        logger.info(`Génération de ${count} questions à partir d'un fichier de ${text.length} caractères`);
        const prompt = `Générez ${count} questions pertinentes basées sur le verbatim suivant. Pour chaque question, fournissez la question, la bonne réponse, une explication de pourquoi c'est la bonne réponse, et le passage associé du verbatim. Renvoyez le résultat sous forme de JSON valide avec la structure suivante :
        {
          "questions": [
            {
              "question": "La question",
              "answer": "La réponse",
              "reason": "L'explication",
              "passage": "Le passage du verbatim"
            },
            ...
          ]
        }
        Verbatim: ${text}`;

        const response = await axios.post(CLAUDE_API_URL, {
            model: CLAUDE_MODEL_NAME,
            max_tokens: 8000,
            messages: [{ role: 'user', content: prompt }]
        }, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            }
        });

        logger.info('Réponse reçue de Claude API');
        const generatedText = response.data.content[0].text;
        logger.debug('Texte généré:', generatedText);

        const questions = parseQuestions(generatedText);
        logger.info(`${questions.length} questions extraites`);

        // Limiter le nombre de questions si nécessaire
        const limitedQuestions = questions.slice(0, count);

        const formattedOutput = formatOutput(limitedQuestions, format);
        res.json({ questions: formattedOutput });
    } catch (error) {
        logger.error("Erreur lors de l'appel à l'API Claude:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Erreur lors de la génération des questions" });
    }
});

function parseQuestions(text) {
    logger.debug('Parsing des questions à partir du JSON généré');
    try {
        // Chercher le début et la fin du JSON dans le texte
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}') + 1;
        const jsonString = text.slice(jsonStart, jsonEnd);
        
        // Parser le JSON
        const data = JSON.parse(jsonString);
        
        if (Array.isArray(data.questions)) {
            return data.questions;
        } else {
            logger.error('Le JSON parsé ne contient pas un tableau de questions');
            return [];
        }
    } catch (error) {
        logger.error('Erreur lors du parsing du JSON:', error);
        return [];
    }
}

function formatOutput(questions, format) {
    switch (format) {
        case 'text':
            return questions.map((q, i) => 
                `Question ${i + 1}: ${q.question}\n` +
                `Réponse: ${q.answer}\n` +
                `Explication: ${q.reason}\n` +
                `Passage: ${q.passage}\n`
            ).join('\n');
        case 'markdown':
            return questions.map((q, i) => 
                `## Question ${i + 1}\n\n` +
                `${q.question}\n\n` +
                `**Réponse:** ${q.answer}\n\n` +
                `**Explication:** ${q.reason}\n\n` +
                `**Passage:** ${q.passage}\n\n`
            ).join('');
        case 'html':
        default:
            return `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Questions générées par Questionator</title>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                        h1 { color: #2c3e50; }
                        .question { background-color: #f9f9f9; border-left: 5px solid #3498db; padding: 15px; margin-bottom: 20px; }
                        .question h2 { color: #3498db; margin-top: 0; }
                        .answer, .reason, .passage { margin-top: 10px; }
                        .answer strong, .reason strong, .passage strong { color: #2c3e50; }
                    </style>
                </head>
                <body>
                    <h1>Questions générées par Questionator</h1>
                    ${questions.map((q, i) => `
                        <div class="question">
                            <h2>Question ${i + 1}</h2>
                            <p>${q.question}</p>
                            <div class="answer"><strong>Réponse:</strong> ${q.answer}</div>
                            <div class="reason"><strong>Explication:</strong> ${q.reason}</div>
                            <div class="passage"><strong>Passage:</strong> ${q.passage}</div>
                        </div>
                    `).join('')}
                </body>
                </html>
            `;
    }
}

module.exports = router;