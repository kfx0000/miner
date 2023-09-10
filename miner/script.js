// This is not a classic Miner game. To win, you have to place all the flags on the mined tiles. When you set the last flag, if any of the flags are set wrong, you'll lose.

const numCells = 225;
const numBombs = 45;
//10.15.20 - 23.34.45 - 40.60.80

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
    document.querySelector(".flag_counter").textContent = flags;
    inGame = true;
}

function showCongrat(txt, colr) {
    if(document.querySelector(".modal").classList.contains("modal_visible") ||
        document.querySelector(".modal_text").classList.contains("modal_text_visible")) {
        document.querySelector(".modal").classList.add("modal_block");
        setTimeout(() => {
            document.querySelector(".modal").classList.remove("modal_visible");
            document.querySelector(".modal_text").classList.remove("modal_text_visible");
        }, 501);
        setTimeout(() => {
            document.querySelector(".modal").classList.remove("modal_block");
        }, 1001);
    } else {
        document.querySelector(".modal_text").style.color = colr;
        document.querySelector(".modal_text").textContent = txt;
        document.querySelector(".modal_text").classList.add("modal_text_visible");
        document.querySelector(".modal").classList.add("modal_visible");
    }
}

function showMenu() {
    if(document.querySelector(".menu").classList.contains("menu_show")) {
        document.querySelector(".menu").classList.remove("menu_show");
    } else {
        document.querySelector(".menu").classList.add("menu_show");
    }
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
    showCongrat("You LOSE!!!", "#666");
}

function openAll() {
    for(let i = 1; i <= numCells; i++) openTile(`tile-${i}`);
    inGame = false;
    showCongrat("You WIN!!!", "#e11");
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
            document.querySelector(".flag_counter").textContent = flags;
        } else {
            flags--;
            tile.add("tile_flag");
            document.querySelector(".flag_counter").textContent = flags;
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
    if(!event.target.classList.contains("menu") &&
        !event.target.classList.contains("header__butt-container") &&
        !event.target.classList.contains("header__button") &&
        !event.target.classList.contains("menu__caption") &&
        !event.target.classList.contains("menu__selector") &&
        !event.target.classList.contains("menu__selector-capt"))
            document.querySelector(".menu").classList.remove("menu_show");
    if(inGame) if(event.target.classList.contains("tile")) openTile(event.target.classList[1]);
    console.log(event.target.classList);
});
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if(inGame) if(event.target.classList.contains("tile")) flagTile(event.target.classList[1]);
});
