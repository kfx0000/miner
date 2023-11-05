// This is not a classic Miner game. To win, you have to place all the flags on the mined tiles. When you set the last flag, if any of the flags are set wrong, you'll lose.
const sett = [
    {cells: 100, bombs: [10, 15, 20], size: 4, time: [300, 600, 1200]},
    {cells: 225, bombs: [23, 34, 45], size: 3.2, time: [600, 1200, 2400]},
    {cells: 400, bombs: [40, 60, 80], size: 2.8, time: [1200, 2400, 4800]}
];

let numCells, numBombs, flags, timeLimit, timer, currTime, brd, lev;
let inGame = false;
let firstClick = true;
let boardArray = new Array(sett[2].cells + 1);

newGame();

function newGame() {
    menuChiose();
    if(!localStorage.getItem("RSS_Miner")) {
        let arr = new Array(9);
        for(let i = 0; i < 9; i++) arr[i] = new Array(10).fill({name:'', time:0});
        localStorage.setItem("RSS_Miner", JSON.stringify(arr));
    }
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
    document.querySelector(".flag").textContent = flags;
    inGame = true;
    firstClick = true;
    currTime = 0;
    if(timer) clearInterval(timer);
    document.querySelector(".timer").textContent = "00:00.0";
}

function menuChiose() {
    document.getElementsByName('board_rb').forEach((x) => {
        if(x.checked) {
            brd = x.classList[1].split("-")[1];
            numCells = sett[brd].cells;
            document.documentElement.style.setProperty('--size', sett[brd].size);
        };
    });
    document.getElementsByName('level_rb').forEach((x) => {
        if(x.checked) {
            lev = x.classList[1].split("-")[1];
            numBombs = flags = sett[brd].bombs[lev];
            timeLimit = sett[brd].time[lev];
        }
    });
}

function showCongrat(txt, colr) {
    if(document.querySelector(".modal").classList.contains("modal_visible") ||
        document.querySelector(".modal_text").classList.contains("modal_text_visible")) {
        document.querySelector(".modal").classList.add("modal_block");
        setTimeout(() => {
            document.querySelector(".modal").classList.remove("modal_visible");
            document.querySelector(".modal_text").classList.remove("modal_text_visible");
        }, 201);
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

function updateTimer() {
    ++currTime;
    document.querySelector(".timer").textContent = getTime(currTime);
    if(currTime >= timeLimit) openBombs(0,"Time is up!!!", "#44e");
}

function getTime(t) {
    let ms = t%10;
    let sec = ((t-t%10)/10)%60;
    sec = sec < 10 ? '0'+sec : ''+sec;
    let min = Math.floor((t/10 - (((t-t%10)/10)%60))/60);
    min = min < 10 ? '0'+min : ''+min;
    return min + ':' + sec + '.' + ms;
}

function openTile(num) {
    if(firstClick) {
        firstClick = false;
        timer = setInterval(updateTimer, 100);
    }
    if(!document.querySelector(`.${num}`).classList.contains("tile_flag")) {
        let cell = +num.split('-')[1];
        if(boardArray[cell]) {
            openBomb(num, "red");
            openBombs(cell,"You LOSE!!!", "#666");
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

function openBombs(cell, msg, col) {
    for(let i = 1; i <= numCells; i++) {
        let tile = document.getElementById(`tile-${i}`).classList;
        if((i !== cell) && boardArray[i] && (!tile.contains("tile_flag")))
            openBomb(`tile-${i}`, "black");
        if((tile.contains("tile_flag")) && !boardArray[i]) tile.add("tile_cross");
    }
    inGame = false;
    clearInterval(timer);
    showCongrat(msg, col);
}

function openAll() {
    for(let i = 1; i <= numCells; i++) openTile(`tile-${i}`);
    inGame = false;
    clearInterval(timer);
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

function mark(cell, className) {
    let rowCol = Math.sqrt(numCells);
    if((cell - 1) % rowCol) document.getElementById(`tile-${cell-1}`).classList.add(className);             //left
    if(cell % rowCol) document.getElementById(`tile-${cell+1}`).classList.add(className);                   //right
    if(cell > rowCol) {                                                                          //**if not 1st row
        document.getElementById(`tile-${cell-rowCol}`).classList.add(className);                            //up
        if((cell - 1) % rowCol) document.getElementById(`tile-${cell-rowCol-1}`).classList.add(className);  //up-left if not 1st col
        if(cell % rowCol) document.getElementById(`tile-${cell-rowCol+1}`).classList.add(className);        //up-right if not last col
    }
    if(cell <= numCells - rowCol) {                                                              //**if not last row
        document.getElementById(`tile-${cell+rowCol}`).classList.add(className);                            // down
        if((cell - 1) % rowCol) document.getElementById(`tile-${cell+rowCol-1}`).classList.add(className);  //down-left if not 1st col
        if(cell % rowCol) document.getElementById(`tile-${cell+rowCol+1}`).classList.add(className);        //down-right if not last col
    }
}

function flagTile(num) {
    let tile = document.querySelector(`.${num}`).classList;
    if(!tile.contains("tile_open")) {
        if(tile.contains("tile_flag")) {
            flags++;
            tile.remove("tile_flag");
            document.querySelector(".flag").textContent = flags;
        } else {
            flags--;
            tile.add("tile_flag");
            document.querySelector(".flag").textContent = flags;
        }
        if(flags === 0) {
            let win = true;
            document.querySelectorAll(".tile_flag").forEach((x) => {
                if(!boardArray[x.classList[1].split('-')[1]]) win = false;
            });
            if(win) openAll(); else openBombs(0, "You LOSE!!!", "#666");
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
    if(event.target.classList.contains("menu__radio")) newGame();
    if(inGame) if(event.target.classList.contains("tile")) openTile(event.target.classList[1]);
    // console.log(event.target.classList);
});
window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if(inGame) if(event.target.classList.contains("tile")) flagTile(event.target.classList[1]);
});
