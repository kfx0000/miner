// This is not a classic Miner game. To win, you have to place all the flags on the mined tiles. When you set the last flag, if any of the flags are set wrong, you'll lose.

const numCells = 100;
const numBombs = 20;

let inGame = false;
let flags = numBombs;
let boardArray = new Array(numCells + 1);

newGame(numCells, numBombs);

function newGame() {
    console.log("New game")
    const elements = document.getElementsByClassName("tile");
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
    const board = document.getElementById("board");
    for(let i = 1; i <= numCells; i++) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        tile.classList.add(`tile-${i}`);
        tile.setAttribute("id", `tile-${i}`);
        board.appendChild(tile);
    }
    boardArray.fill(false);
    for(let i = 0; i < numBombs; i++) {
        let rnd = Math.ceil(numCells * Math.random());
        if(boardArray[rnd]) {
            --i;
            continue;
        } else boardArray[rnd] = true;
    }
    flags = numBombs;
    inGame = true;
}

function openTile(num) {
    if (!document.querySelector(`.${num}`).classList.contains("tile_flag")) {
        let cell = +num.split('-')[1];
        if(boardArray[cell]) {
            openBomb(num, "red");
            openBombs(cell);
        } else {
            document.querySelector(`.${num}`).classList.add("tile_open");
            countTile(cell);
        }
    }
}

function openBomb(num, color) {
    let bombTile = document.createElement("div");
    bombTile.classList.add(`bomb-${color}`);
    document.querySelector(`.${num}`).classList.add("tile_open");
    document.getElementById(num).appendChild(bombTile);
}

function openBombs(cell) {
    for(let i = 1; i <= numCells; i++) {
        let tile = document.getElementById(`tile-${i}`).classList;
        if((i !== cell) && boardArray[i] && (!tile.contains("tile_flag")))
            openBomb(`tile-${i}`, "black");
        if((tile.contains("tile_flag")) && !boardArray[i]) tile.add("tile_cross");
    }
    inGame = false;
    console.log("You LOSE!!!");
}

function openAll() {
    for(let i = 1; i <= numCells; i++) openTile(`tile-${i}`);
    inGame = false;
    console.log("You WIN!!!");
}

function countTile(cell) {
    let res = 0;
    mark(cell, "count");
    document.querySelectorAll(".count").forEach((x) => {
        if(boardArray[x.classList[1].split('-')[1]]) res++;
        x.classList.remove("count");
    });
    if(res) {
        document.querySelector(`.tile-${cell}`).classList.add(`number_${res}`);
        document.querySelector(`.tile-${cell}`).textContent = res;
    } else {
        mark(cell, "mark");
        document.querySelectorAll(".mark").forEach((x) => {
            if(!x.classList.contains("tile_open")) openTile(x.classList[1]);
        });
    }
}

function mark(cell, clss) {
    let rowCol = Math.sqrt(numCells);
    if((cell - 1) % rowCol) document.getElementById(`tile-${cell-1}`).classList.add(clss);             //left
    if(cell % rowCol) document.getElementById(`tile-${cell+1}`).classList.add(clss);                   //right
    if(cell > rowCol) {                                                                          //**if not 1st row
        document.getElementById(`tile-${cell-rowCol}`).classList.add(clss);                            //up
        if((cell - 1) % rowCol) document.getElementById(`tile-${cell-rowCol-1}`).classList.add(clss);  //up-left if not 1st col
        if(cell % rowCol) document.getElementById(`tile-${cell-rowCol+1}`).classList.add(clss);        //up-right if not last col
    }
    if(cell <= numCells - rowCol) {                                                              //**if not last row
        document.getElementById(`tile-${cell+rowCol}`).classList.add(clss);                            // down
        if((cell - 1) % rowCol) document.getElementById(`tile-${cell+rowCol-1}`).classList.add(clss);  //down-left if not 1st col
        if(cell % rowCol) document.getElementById(`tile-${cell+rowCol+1}`).classList.add(clss);        //down-right if not last col
    }
}

function flagTile(num) {
    let tile = document.querySelector(`.${num}`).classList;
    if(!tile.contains("tile_open")) {
        if(tile.contains("tile_flag")) {
            flags++;
            tile.remove("tile_flag");
        } else {
            flags--;
            tile.add("tile_flag");
        }
        if(flags === 0) {
            let win = true;
            document.querySelectorAll(".tile_flag").forEach((x) => {
                if(!boardArray[x.classList[1].split('-')[1]]) win = false;
            });
            if(win) openAll(); else openBombs(0);
        }
    }
}

document.addEventListener("click", (event) => {
    if(inGame) if(event.target.classList.contains("tile")) openTile(event.target.classList[1]);
});
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if(inGame) if(event.target.classList.contains("tile")) flagTile(event.target.classList[1]);
});
