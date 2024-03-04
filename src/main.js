import { generateBoard } from './createBoard.js';

let time = 0;
let interval = window.setInterval(setTime, 1000); // have time increment once per 1000 milliseconds (1 second)

const id = "container";

// Get possible values for a Sudoku board given its base.
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}

// Construct a box within a Sudoku board based on board state.
function createBox(n, selected, defaultVal, val, i) {
    let nsqr = n*n;
    let boxClass = selected ? "selectedbox" : (defaultVal ? "defaultbox" : "unselectedbox");
    let innerVal = val === null ? "" : val;
    let size = Math.floor(100 / (nsqr));
    let padVal = 0;
    let fontSize = 0;
    switch (n) {
        case 2: padVal = 20; fontSize = 250; break; // set padding and font size for base-2 boards (%)
        case 3: padVal = 15; fontSize = 200; break; // set padding and font size for base-3 boards (%)
        case 4: padVal = 7; fontSize = 160; break; // set padding and font size for base-4 boards (%)
        case 5: padVal = 0; fontSize = 125; break; // set padding and font size for base-5 boards (%)
    }
    let style = `padding: ${padVal}%; font-size: ${fontSize}%;`;
    
    let isTop = (Math.floor(i / nsqr) % n === 0);
    let isLeft = ((i % nsqr) % n === 0);
    let isRight = (((i+1) % nsqr) % n === 0);
    let isBottom = (Math.floor((i+nsqr) / nsqr) % n === 0);
    
    if (isTop) { style += " border-top: 2px solid black;"; }
    if (isLeft) { style += " border-left: 2px solid black;"; }
    if (isRight) { style += " border-right: 2px solid black;"; }
    if (isBottom) { style += " border-bottom: 2px solid black;"; }
    
    return `<div class="${boxClass}" style="${style}">${innerVal}</div>\n`;
}
    
// Create a grid given a Sudoku base, HTML id, current selection location, and default and entered values.
function createGrid(n, id, selectRow, selectCol, defaultVals, enteredVals) {
    let nsqr = n*n;
    let gridContents = "";
    for (let i = 0; i < defaultVals.length; i += 1) {
        let selected = selectRow * nsqr + selectCol === i;
        let defaultVal = defaultVals[i] !== null;
        let val = defaultVal ? defaultVals[i] : enteredVals[i];
        gridContents += createBox(n, selected, defaultVal, val, i);
    }
    document.getElementById(id).style.setProperty("grid-template-columns", `repeat(${n*n}, 1fr)`);
    document.getElementById(id).style.setProperty("grid-template-rows", `repeat(${n*n}, 1fr)`);
    document.getElementById(id).innerHTML = gridContents;
}

function isCorrect(enteredVals, board) {
    for (let i = 0; i < enteredVals.length; i++) {
        if (board.mask[i]) {
            if (enteredVals[i] !== board.board[i]) { return false; }
        }
    }
    return true;
}

function addZero(val) {
    if (val % 10 === val) { return `0${val}`; }
    return `${val}`
}

function setTime() {
    time += 1;
    localStorage.setItem("time", JSON.stringify(time));
    let seconds = Math.floor(time % 60);
    let minutes = Math.floor((time % 3600) / 60);
    let hours = Math.floor(time / 3600);
    document.getElementById("timer").innerHTML = `${hours}:${addZero(minutes)}:${addZero(seconds)}`;
}

function drawBoard(board, enteredVals, n) {
    let won = false;
    let nsqr = n*n;
    let possible = board.possible;
    let row = 0;
    let col = 0;
    let defaultVals = board.defaultVals;
    let winVal = document.getElementById("winstate");
    winVal.innerHTML = "";

    createGrid(n, id, row, col, defaultVals, enteredVals);
    window.addEventListener("keydown", (event) => {
        // Control arrow key logic
        if (event.key === "ArrowDown") row = row === nsqr - 1 ? row : row + 1;
        else if (event.key === "ArrowUp") row = row === 0 ? row : row - 1;
        else if (event.key === "ArrowRight") col = col === (nsqr) - 1 ? col : col + 1;
        else if (event.key === "ArrowLeft") col = col === 0 ? col : col - 1;
        
        // Check for win state
        if (!won) {
            // Control guess entry logic
            if (possible.includes(event.key.toUpperCase())) enteredVals[row * nsqr + col] = event.key.toUpperCase();
            else if (event.key === "Backspace") enteredVals[row * nsqr + col] = "";
            localStorage.setItem("enteredVals", JSON.stringify(enteredVals));
            
            won = isCorrect(enteredVals, board);
            if (won) {
                window.clearInterval(interval); // stop timer
                winVal.innerHTML = "Congrats! :)";
            }
        }
        
        createGrid(n, id, row, col, defaultVals, enteredVals);
    });
}

function makeBoard(n) {
    time = 0;
    let board = generateBoard(n);
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("enteredVals", JSON.stringify(board.enteredVals));
    drawBoard(board, board.enteredVals, n);
}

function main() {
    let n = 3;
    let generatorButton = document.getElementById("generator");
    
    let slider = document.getElementById("sideslider");
    let sliderVal = document.getElementById("basenumber");
    sliderVal.innerHTML = "n";
    slider.oninput = function() {
        sliderVal.innerHTML = this.value;
        n = parseInt(this.value);
    }
    
    generatorButton.onclick = function() {
        // reset timer
        time = 0;
        window.clearInterval(interval); // stop old timer
        interval = window.setInterval(setTime, 1000); // start new timer
        document.getElementById("timer").innerHTML = "0:00:00";
        
        // make board
        makeBoard(n);
    }
    
    let board = JSON.parse(localStorage.getItem("board"));
    if (board === null) { makeBoard(n); }
    else {
        n = board.n;
        time = JSON.parse(localStorage.getItem("time"));
        setTime(); // display the time
        let enteredVals = JSON.parse(localStorage.getItem("enteredVals"));
        drawBoard(board, enteredVals, n);
    }
}

main();