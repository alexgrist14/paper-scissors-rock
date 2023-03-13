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
    showTable(moves) {
        const newGame = new Game(moves);
        const matrix = [];
        for (let i = 0; i < moves.length; i++) {
            const row = {};
            for (let j = 0; j < moves.length; j++) {
                row[moves[j]] = newGame.getGameResult(i, j, 'Win', 'Lose');
            }
            matrix.push(row);
        }
        const newMatrix = matrix.map((obj, index) => ({" ": moves[index], ...obj}));
        console.table(newMatrix);
    }
}

function startGame() {
    if (hasDuplicates(moves)) {
        console.log('Values should not be the same');
    } else if (moves.length < 3) {
        console.log('Number of arguments must be more than 2. Example: rock paper scissors');
    } else if (moves.length % 2 === 0) {
        console.log('Number of arguments must be odd(3 or 5, etc.). Example: rock paper scissors');
    } else {
        const newKey = new SecretKey();
        const key = newKey.generateRandomKey();
        const newGame = new Game(moves);
        const randomTurn = newGame.makeRandomTurn();
        const newHmac = new Hmac(randomTurn, key);
        const hmac = newHmac.createHmac();

        console.log(`HMAC: ${hmac}`);
        console.log('Available moves:');
        moves.forEach((item, i) => {
            console.log(`${i + 1} - ${item}`);
        })
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
                    const newTable = new Table();
                    newTable.showTable(moves);
                    askForMove();
                } else if (!move) {
                    console.log(`You must input correct value`);
                    askForMove();
                } else {
                    console.log(`Your move: ${move}`);
                    console.log(`Computer move: ${randomTurn}`);
                    console.log(newGame.getGameResult(+number, moves.indexOf(randomTurn) + 1))
                    console.log(`HMAC key: ${key}`);
                    rl.close();
                }
            });
        }
        askForMove();
    }
}

function hasDuplicates(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i] === arr[j])
                return true;
        }
    }
    return false;
}

startGame();
