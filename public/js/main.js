document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const fileInput = document.getElementById('file-input');
    const questionCount = document.getElementById('question-count');
    const outputFormat = document.getElementById('output-format');
    const generateBtn = document.getElementById('generate-btn');
    const questionsContainer = document.getElementById('questions-container');
    const downloadBtn = document.getElementById('download-btn');

    let generatedContent = '';

    // Charger la clé API sauvegardée
    apiKeyInput.value = localStorage.getItem('anthropicApiKey') || '';

    saveApiKeyBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            try {
                console.log('Test de la clé API...');
                const response = await fetch('/api/test-api-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Key': apiKey
                    }
                });
                if (response.ok) {
                    localStorage.setItem('anthropicApiKey', apiKey);
                    console.log('Clé API sauvegardée avec succès');
                    alert('Clé API valide et sauvegardée avec succès !');
                } else {
                    console.error('Clé API invalide');
                    alert('La clé API semble être invalide. Veuillez vérifier et réessayer.');
                }
            } catch (error) {
                console.error('Erreur lors du test de la clé API:', error);
                alert('Une erreur est survenue lors du test de la clé API.');
            }
        } else {
            alert('Veuillez entrer une clé API valide.');
        }
    });

    generateBtn.addEventListener('click', async () => {
        const apiKey = localStorage.getItem('anthropicApiKey');
        if (!apiKey) {
            alert("Veuillez d'abord configurer votre clé API Anthropic.");
            return;
        }

        const file = fileInput.files[0];
        if (!file) {
            alert('Veuillez sélectionner un fichier avant de générer des questions.');
            return;
        }

        const count = parseInt(questionCount.value);
        const format = outputFormat.value;

        if (isNaN(count) || count < 1 || count > 15) {
            alert('Le nombre de questions doit être entre 1 et 15.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Génération en cours...';

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('count', count);
            formData.append('format', format);

            console.log('Envoi de la requête au serveur...');
            const response = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: {
                    'X-API-Key': apiKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            console.log('Réponse reçue du serveur');
            const data = await response.json();
            console.log('Données reçues:', data);

            if (data.questions) {
                generatedContent = data.questions;
                displayQuestions(generatedContent, format);
                downloadBtn.style.display = 'block';
            } else {
                console.error('Aucune question reçue dans la réponse');
                alert("Aucune question n'a été générée. Veuillez réessayer.");
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Une erreur est survenue lors de la génération des questions.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Générer les questions';
        }
    });

    function displayQuestions(questions, format) {
        console.log('Affichage des questions. Format:', format);
        console.log('Contenu des questions:', questions);

        questionsContainer.innerHTML = '';
        switch (format) {
            case 'text':
            case 'markdown':
                const pre = document.createElement('pre');
                pre.textContent = questions;
                questionsContainer.appendChild(pre);
                break;
            case 'html':
            default:
                questionsContainer.innerHTML = questions;
                break;
        }
    }

    downloadBtn.addEventListener('click', () => {
        const format = outputFormat.value;
        let filename = 'questions_generees';
        let content = generatedContent;
        let type = 'text/plain';

        switch (format) {
            case 'html':
                filename += '.html';
                type = 'text/html';
                break;
            case 'markdown':
                filename += '.md';
                type = 'text/markdown';
                break;
            default:
                filename += '.txt';
        }

        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
});
