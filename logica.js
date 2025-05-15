$(document).ready(function () {
    const canvas = document.getElementById("snakeCanvas");
    canvas.height = window.innerHeight - 10;
    canvas.width = window.innerHeight - 10;
    const ctx = canvas.getContext("2d");
    const scoreContainer = $("#score");
    const gameOverScreen = $("#gameOverScreen");
    const gameOverScore = $("#gameOverScore");
    const playerName = $("#playerName");

    //define uma grelha de 30x30
    const gridSize = 30;
    //define a posição inicial da cobra,da maça e da joia
    const snake = [{ x: 10, y: 10 }];
    const food = { x: 15, y: 12 };
    const bonus = { x: 17, y: 0};
    let snakeLenght = -1;
    let score = 0;
    let highscore = 0;
    let direction = "right";
    let offset = 1;
    let canDrawBonus = false;
    let gameOver = false;
    let bonusFallSpeed = 0.5;
    //definição dos sprites
    let headSprite = new Image();
    let bodySprite = new Image();
    let foodSprite = new Image();
    let bonusSprite = new Image();
    let tailSpriteDown = new Image();
    let tailSpriteUp = new Image();
    let tailSpriteLeft = new Image();
    let tailSpriteRight = new Image();
    let groundSprite = new Image();
    let collectSound = new Audio();
    let losingSound = new Audio();
    let bonusSound = new Audio();
    let music = new Audio();    
    headSprite.src = 'sprites/head.png';
    bodySprite.src = 'sprites/body.png'; 
    foodSprite.src = 'sprites/food.png';
    bonusSprite.src = 'sprites/bonus.png'; 
    tailSpriteDown.src = 'sprites/tailDown.png';
    tailSpriteUp.src = 'sprites/tailUp.png';
    tailSpriteLeft.src = 'sprites/tailLeft.png';
    tailSpriteRight.src = 'sprites/tailRight.png';
    groundSprite.src = 'sprites/ground.png';
    collectSound.src = 'som/collect.mp3';
    losingSound.src = 'som/losing.mp3';
    bonusSound.src = 'som/bonus.mp3';
    music.src = 'som/music.mp3';


    //funçao para aumentar a pontuação e atualizar o placar com uma animação
    function increaseScore(value) {
        score+= value;
        $(scoreContainer).fadeOut('slow', function() {
            $(this).text(score).fadeIn('slow');
        });
    }

    //funçao que desenha a cobra
    function drawSnake() {
    //verifica quais sprites devem ser desenhados de acordo com o segmento da cobra
    snake.forEach(segment => {
        if(segment == snake[0]){
            ctx.drawImage(headSprite, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            }
        if(segment != snake[0] && segment != snake[snake.length - 1]){
            ctx.drawImage(bodySprite, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
            }
        if(segment == snake[snake.length - 1]){
            //se a cobra tiver mais de um segmento, verifica qual sprite de cauda deve ser desenhado de acordo com a direção do penúltimo segmento
            if(snakeLenght >= 0){
                 if(segment.x < snake[snakeLenght].x){
                    ctx.drawImage(tailSpriteLeft, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
                    }
                if(segment.x > snake[snakeLenght].x){
                    ctx.drawImage(tailSpriteRight, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
                    }
                if(segment.y < snake[snakeLenght].y){
                    ctx.drawImage(tailSpriteUp, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);    
                    }
                if(segment.y > snake[snakeLenght].y){
                    ctx.drawImage(tailSpriteDown, segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);    
                    }
                }
            }
        });
    }

    //função que desenha os itens do jogo
    function drawItems() {
        ctx.drawImage(foodSprite, food.x * gridSize, food.y * gridSize, gridSize, gridSize);
        //garante que so desenha a joia se esta ja nao estiver no ecrã e faz com que a joia caia
        if(canDrawBonus){
            bonus.y+= bonusFallSpeed;
            //assim que esta toca no chão, a joia desaparece e é gerada uma nova posição para esta
            if(bonus.y > canvas.height / gridSize){
                bonus.y = -1;
                bonus.x = Math.floor(Math.random() * canvas.width / gridSize);
                canDrawBonus = false;
            }
            ctx.drawImage(bonusSprite, bonus.x * gridSize, bonus.y * gridSize, gridSize, gridSize);
        }
    }

    //funçao para mover a cobre conforme a direção premida pelo jogador
    function moveSnake() {
        const head = { ...snake[0] };
        switch (direction) {
            case "up":
                head.y--;
                break;
            case "down":
                head.y++;
                break;
            case "left":
                head.x--;
                break;
            case "right":
                head.x++;
                break;
        }
        
        //funçao que verifica se a cobra comeu a maça e aumenta o tamanho da cobra e a pontuação
        if (head.x === food.x && head.y === food.y) {
            snake.unshift(head);
            snakeLenght++;
            increaseScore(1);
            collectSound.play();
            //faz com que cada faz que a posiçao seja multipla de 5 a joia seja gerada
            if(score % 5 == 0 && score > 0) {
                canDrawBonus = true;
            }
            //gera uma nova posiçao aleatoria para a maça 
            food.x = Math.floor(Math.random() * canvas.width / gridSize);
            food.y = Math.floor(Math.random() * canvas.height / gridSize);
        } 
        //verifica se a cobra comeu a joia e dimunui o tamanho da cobra e aumenta a pontuação
        else if(head.x === bonus.x && head.y === bonus.y){
            snake.splice(-2,1);
            canDrawBonus = false;
            snakeLenght--;
            increaseScore(3);
            bonusSound.play();
            //gera uma nova posiçao horizontal aleatoria para a joia
            bonus.x = Math.floor(Math.random() * canvas.width / gridSize);
            bonus.y = -1;
        }
        //caso nao tenha comido nada, a cobra continua a andar
        else {
            snake.unshift(head);
            snake.pop();
        }
    }

    //funçao para verificar colisões com as paredes e com a propria cobra
    function checkCollision() {
        const head = snake[0];
        if (head.x < -offset || head.x >= canvas.width / gridSize + offset || head.y <= -offset || head.y > canvas.height / gridSize + offset) {
            losingSound.play();
            gameOver = true;
        }
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                losingSound.play();
                gameOver = true;
            }
        }
    }

    //função para ir buscar as ultimas 3 pontuações ao servidor
    function fetchLastScores() {
        // Faz um pedido GET ao servidor para buscar as últimas pontuações
        fetch('/last-scores')
            .then(response => {
                //se a resposta não for bem sucedida, envia um erro
                if (!response.ok) {
                    throw new Error('Falha ao buscar as últimas pontuações');
                }
                //se a resposta for bem sucedida, converte os dados para JSON
                return response.json();
            })
            //assim que os dados forem convertidos, cria uma lista com as pontuações e adiciona ao elemento HTML
            .then(scores => {
                //vai buscar o elemento HTML onde as pontuações vão ser adicionadas
                const scoresList = document.getElementById('scoresList');
                scoresList.innerHTML = ''; // Limpa as pontuações anteriores
                scores.forEach(score => {
                    // Cria um novo elemento list para cada pontuação e adiciona ao elemento HTML
                    const scoreItem = document.createElement('li');
                    scoreItem.textContent = score;
                    //adiciona a lista no elemento HTML
                    scoresList.appendChild(scoreItem);
                });
            })
            //caso haja erro a inserir as pontuações na lista, envia um erro para a consola
            .catch(error => {
                console.error('Erro ao buscar as últimas pontuações:', error);
            });
    }

    
    //funçao que gera um loop a cada 100ms para executar a logico do jogo
    function gameLoop() {
        if(!gameOver){
            $(gameOverScreen).hide();
            ctx.drawImage(groundSprite, 0, 0, canvas.width, canvas.height);
            $(scoreContainer).text("Pontuação: " + score);
            music.play();
            drawSnake();
            drawItems();
            moveSnake();
            checkCollision();
            setTimeout(gameLoop, 100);
        }else{//lógica para quando o jogo acaba
            music.pause();
            $(gameOverScreen).show();
            $(gameOverScore).text("Pontuação: " + score);
            fetchLastScores();
            //limpa o campo de input visto que este guardava o nome do jogador anterior
            $(playerName).val('');
            // Adiciona um event listener para o botão de submeter a pontuação
            $('#submitScore').on('click', function() {
                //vai buscar o nome inserido no input
                const playerName = $('#playerName').val();
                const finalScore = score; 

                // Verifica se o nome do jogador não está vazio
                if(playerName.trim() !== '') {
                    //faz um pedido POST ao servidor para guardar a pontuação
                    fetch('/save-score', {
                        method: 'POST',
                        headers: { //especifica o tipo de dados que vai ser enviado
                            'Content-Type': 'application/json',
                        },
                        //converte os dados para uma string JSON
                        body: JSON.stringify({ name: playerName, highscore: finalScore }),
                    })
                    //assim que o server responda o script devolve os dados em JSON para o servidor 
                    .then(response => response.json())
                    //assim que o server responda dá feedback na consola e recomeça o jogo
                    .then(data => {
                        console.log('The score has been saved!', data);
                        location.reload();
                    })
                    //verifica se houve erros
                    .catch((error) => {
                        console.error('Error:', error);
                    });
                } else {//mensagem de erro caso o nome esteja vazio
                    alert('Please enter your name.');
                }
            });
        }
    }

    //unica funçao chamada dentro da função de jQuery para além da funçao keydown
    gameLoop();


    //funçao que verifica qual a seta premida mas so muda a direção caso esta diferente da direção oposta à atual
    $(document).keydown(function (e) {
        switch (e.key) {
            case "ArrowUp":
                if(direction == "down"){
                    break;
                }
                else{
                    direction = "up";
                    break;
                }
            case "ArrowDown":
                if(direction == "up"){
                    break;
                }
                else{
                    direction = "down";
                    break;
                }
            case "ArrowLeft":
                if(direction == "right"){
                    break;
                }
                else{
                    direction = "left";
                    break;
                }
            case "ArrowRight":
                if(direction == "left"){
                    break;
                }
                else{
                    direction = "right";
                    break;
                }
        }
    });
});

