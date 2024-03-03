import { generateBoard } from './createBoard.js';

let started = false;

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
    switch (n) {
        case 2: padVal = 30; break;
        case 3: padVal = 25; break;
        case 4: padVal = 15; break;
        case 5: padVal = 6; break;
    }
    let style = `padding: ${padVal}%;`;
    
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

function makeBoard(n) {
    let won = false;
    let nsqr = n*n;
    let board = generateBoard(n);
    let possible = board.possible;
    let row = 0;
    let col = 0;
    let defaultVals = board.defaultVals;
    let enteredVals = board.enteredVals;
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
            
            won = isCorrect(enteredVals, board);
            if (won) { winVal.innerHTML = "Congrats! :)"; }
        }
        
        createGrid(n, id, row, col, defaultVals, enteredVals);
    });
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
        makeBoard(n);
    }
    
    makeBoard(n);
}

if (!started) { started = true; main(); }