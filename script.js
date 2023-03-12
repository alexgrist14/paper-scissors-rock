const crypto = require('crypto');
const readline = require('readline');
const moves = process.argv.slice(2);

class Game{
    constructor(moves) {
        this.moves = [...moves];
    }

    makeRandomTurn(){
        const randomIndex = Math.floor(Math.random() * this.moves.length)
        return this.moves[randomIndex];
    }

    getMathResult(userTurn, computerTurn){
        const diff = (computerTurn - userTurn + moves.length) % moves.length;
        if(diff === 0){
            return 'Tie';
        } else if(diff <= (moves.length) / 2){
            return 'You win!';
        }else{
            return 'Computer wins!';
        }
    }

}

class SecretKey{
    generateRandomKey(){
        return crypto.randomBytes(32).toString('hex');
    }
}

class Hmac{
    constructor(turn,key) {
        this.turn = turn;
        this.key = key;
    }
    createHmac(){
        return crypto.createHmac('sha3-256',this.key).update(this.turn).digest('hex');
    }

}

class Table{
    showTable(){

    }
}


function startGame(){
    if(moves.length < 3){
        console.log('Number of arguments must be more than 2');
    }else if(moves.length%2 === 0){
        console.log('Number of arguments must be odd')
    }else{
        const newKey = new SecretKey();
        const key = newKey.generateRandomKey();
        const newGame = new Game(moves);
        const randomTurn = newGame.makeRandomTurn();
        const newHmac = new Hmac(randomTurn,key);
        const hmac = newHmac.createHmac();

        console.log(`HMAC: ${hmac}`);
        console.log('Available moves:');
        moves.forEach((item,i)=>{
            console.log(`${i+1} - ${item}`);
        })
        console.log('0 - exit\n? - help');

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Enter your move: ', (name) => {
            console.log(`Your move: ${moves[Number(name-1)]}`);
            console.log(`Computer move: ${randomTurn}`);
            console.log(newGame.getMathResult(+name,moves.indexOf(randomTurn) + 1))
            console.log(`HMAC key: ${key}`);
            rl.close();
        });
    }
}

startGame();

