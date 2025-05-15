const express = require('express'); //framework usado para criar o servidor
const fs = require('fs'); //modulo usado para ler e escrever ficheiros
const bodyParser = require('body-parser'); //modulo usado para processar dados vindos de formulários em formato JSON
const path = require('path'); //modulo para trabalhar com camunhos de ficheiros
const app = express(); //cria uma instância do servidor
const port = 3000; 

app.use(express.static(path.join(__dirname, '/')));// vai buscar os ficheiros estáticos na pasta raiz
app.use(bodyParser.json()); 

//define uma rota para pedidos POST dos outros ficheiros
app.post('/save-score', (req, res) => {
    const { name, highscore } = req.body;// Extrai o nome e a pontuação do corpo do pedido
    // Cria a string para guardar o nome e a pontuação
    const scoreEntry = `Nome: ${name}, Pontuação: ${highscore}\n`; // Formatação dos registos

    // Insere a string no ficheiro(e cria o ficheiro se não existir)
    fs.appendFile('highscores.txt', scoreEntry, (err) => {
        if (err) { // Verifica se houve erro
            console.error(err);
            res.status(500).send('Erro ao guardar a pontuação');
            return;
        }
        // Se não houver erro, envia uma resposta de sucesso para o cliente e para a consola 
        console.log('Pontuação inserida!');
        res.send({ message: 'Pontuação inserida' });
    });
});

//define uma rota para pedidos GET dos outros ficheiros
app.get('/last-scores', (req, res) => {
    fs.readFile('highscores.txt', 'utf8', (err, data) => { //lé o ficheiro de pontuações
        if (err) { // Verifica se houve erro
            console.error(err);
            res.status(500).send('Erro ao ler o ficheiro de pontuações');
            return;
        }
        // Divide os dados em linhas e pega nas últimas 3 linhas
        const lines = data.trim().split('\n');
        const lastThreeEntries = lines.slice(-3);
        //envia as últimas 3 linhas para o ficheiro logica.js
        res.json(lastThreeEntries);
    });
});

//Inicia o servirdor e dá feedback na consola
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
