const crypto = require('crypto');
const readline = require('readline');

const moves = process.argv.slice(2);

class Game {
    constructor(moves) {
        this.moves = [...moves];
    }

    makeRandomTurn() {
        const randomIndex = Math.floor(Math.random() * this.moves.length)
        return this.moves[randomIndex];
    }

    getGameResult(userTurn, computerTurn, winMessage = 'You win!', loseMessage = 'Computer wins!') {
        const diff = (computerTurn - userTurn + this.moves.length) % this.moves.length;

        if (diff === 0) {
            return 'Draw';
        } else if (diff <= moves.length / 2) {
            return winMessage;
        } else {
            return loseMessage;
        }
    }
}

class SecretKey {
    generateRandomKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

class Hmac {
    constructor(turn, key) {
        this.turn = turn;
        this.key = key;
    }

    createHmac() {
        return crypto.createHmac('sha3-256', this.key).update(this.turn).digest('hex');
    }
}

class Table {
    constructor(game) {
        this.game = game;
    }

    showTable(moves) {
        const matrix = [];

        for (let i = 0; i < moves.length; i++) {
            const row = {};
            for (let j = 0; j < moves.length; j++) {
                row[moves[j]] = this.game.getGameResult(i, j, 'Win', 'Lose');
            }
            matrix.push(row);
        }
        const newMatrix = matrix.map((obj, index) => ({" ": moves[index], ...obj}));
        console.table(newMatrix);
    }
}

function hasDuplicates(arr) {
    return arr.length !== new Set(arr).size;
}

const dublicateValidator = {
    isValid: (moves) => !hasDuplicates(moves),
    message: 'Values should not be the same',
}

const lengthValidator = {
    isValid: (moves) => !(moves.length < 3),
    message: 'Number of arguments must be more than 2. Example: rock paper scissors',
}

const oddValidator = {
    isValid: (moves) => !(moves.length % 2 === 0),
    message: 'Number of arguments must be odd(3 or 5, etc.). Example: rock paper scissors',
}

const validators = [dublicateValidator, lengthValidator, oddValidator];

function validateInput(moves) {
    validators.forEach(({isValid, message}) => {
        if (!isValid(moves)) throw new Error(message);
    })
}

function showAvailableMoves() {
    moves.forEach((item, i) => {
        console.log(`${i + 1} - ${item}`);
    })
}

function startGame() {
    try {
        validateInput(moves);

        const secretKey = new SecretKey();
        const key = secretKey.generateRandomKey();
        const game = new Game(moves);
        const randomTurn = game.makeRandomTurn();
        const hmac = new Hmac(randomTurn, key);
        const hmacHash = hmac.createHmac();

        console.log(`HMAC: ${hmacHash}`);
        console.log('Available moves:');

        showAvailableMoves();

        console.log('0 - exit\n? - help');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        function askForMove() {
            rl.question('Enter your move: ', (number) => {

                const move = moves[Number(number - 1)];

                if (number === '0') {
                    rl.close();
                } else if (number === '?') {
                    const table = new Table(game);
                    table.showTable(moves);
                    askForMove();
                } else if (!move) {
                    console.log(`You must input correct value`);
                    askForMove();
                } else {
                    console.log(`Your move: ${move}`);
                    console.log(`Computer move: ${randomTurn}`);
                    console.log(game.getGameResult(+number, moves.indexOf(randomTurn) + 1))
                    console.log(`HMAC key: ${key}`);

                    rl.close();
                }
            });
        }

        askForMove();
    }
    catch (err){
        console.log(err.message);
    }
}

startGame();
