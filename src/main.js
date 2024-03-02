import { generateBoard } from './createBoard.js';

let started = false;

const id = "container";

// Get possible values for a Sudoku board given its base.
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}

// Construct a box within a Sudoku board based on board state.
function createBox(n, selected, defaultVal, val) {
    let boxClass = selected ? "selectedbox" : (defaultVal ? "defaultbox" : "unselectedbox");
    let innerVal = val === null ? "" : val;
    let size = Math.floor(100 / (n*n));
    let padVal = 0;
    switch (n) {
        case 2: padVal = 30; break;
        case 3: padVal = 25; break;
        case 4: padVal = 15; break;
        case 5: padVal = 6; break;
    }
    return `<div class="${boxClass}" style="padding: ${padVal}%;">${innerVal}</div>\n`;
}
    
// Create a grid given a Sudoku base, HTML id, current selection location, and default and entered values.
function createGrid(n, id, selectRow, selectCol, defaultVals, enteredVals) {
    let nsqr = n*n;
    let gridContents = "";
    for (let i = 0; i < defaultVals.length; i += 1) {
        let selected = selectRow * nsqr + selectCol === i;
        let defaultVal = defaultVals[i] !== null;
        let val = defaultVal ? defaultVals[i] : enteredVals[i];
        gridContents += createBox(n, selected, defaultVal, val);
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

    createGrid(n, id, row, col, defaultVals, enteredVals);
    window.addEventListener("keydown", (event) => {
        // Control arrow key logic
        if (event.key === "ArrowDown") row = row === nsqr - 1 ? row : row + 1;
        else if (event.key === "ArrowUp") row = row === 0 ? row : row - 1;
        else if (event.key === "ArrowRight") col = col === (nsqr) - 1 ? col : col + 1;
        else if (event.key === "ArrowLeft") col = col === 0 ? col : col - 1;
        
        // Control guess entry logic
        else if (possible.includes(event.key.toUpperCase())) enteredVals[row * nsqr + col] = event.key.toUpperCase();
        else if (event.key === "Backspace") enteredVals[row * nsqr + col] = "";
        
        // Check for win state
        if (!won) {
            won = isCorrect(enteredVals, board);
            if (won) { winVal.innerHTML = "Congrats! :)"; }
            else { createGrid(n, id, row, col, defaultVals, enteredVals); }
        }
        else {}
    });
}

function main() {
    let n = 3;
    let generatorButton = document.getElementById("generator");
    
    let slider = document.getElementById("sideslider");
    let sliderVal = document.getElementById("sliderval");
    sliderVal.innerHTML = "Base: " + slider.value;
    slider.oninput = function() {
        sliderVal.innerHTML = "Base: " + this.value;
        n = parseInt(this.value);
    }
    
    generatorButton.onclick = function() {
        makeBoard(n);
    }
    
    makeBoard(n);
}

if (!started) { started = true; main(); }