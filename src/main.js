import { generateBoard } from './createBoard.js';
import { createTile } from './tiles.js';

let time = 0;
let interval = window.setInterval(setTime, 1000); // have time increment once per 1000 milliseconds (1 second)
let paused = false;
let won = false;
let candidateMode = false;

const id = "container";

// Get possible values for a Sudoku board given its base.
function getPossible(n) {
    return "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0".slice(0, n*n);
}
    
// Create a grid given a Sudoku base, HTML id, current selection location, and default and entered values.
function createGrid(n, id, selectRow, selectCol, defaultVals, enteredVals, candidates) {
    let nsqr = n*n;
    let gridContents = "";
    for (let i = 0; i < defaultVals.length; i += 1) {
        let selected = selectRow * nsqr + selectCol === i;
        let defaultVal = defaultVals[i] !== null;
        let val = defaultVal ? defaultVals[i] : enteredVals[i];
        gridContents += createTile(n, selected, defaultVal, candidates[i], val, i);
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

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
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

function drawBoard(board, enteredVals, n, candidates) {
    won = false;
    let nsqr = n*n;
    let possible = board.possible;
    let row = 0;
    let col = 0;
    let defaultVals = board.defaultVals;
    let winVal = document.getElementById("winstate");
    winVal.innerHTML = "";

    createGrid(n, id, row, col, defaultVals, enteredVals, candidates);
    window.addEventListener("keydown", (event) => {
        // Control arrow key logic
        if (event.key === "ArrowDown") row = row === nsqr - 1 ? row : row + 1;
        else if (event.key === "ArrowUp") row = row === 0 ? row : row - 1;
        else if (event.key === "ArrowRight") col = col === (nsqr) - 1 ? col : col + 1;
        else if (event.key === "ArrowLeft") col = col === 0 ? col : col - 1;
        
        won = isCorrect(enteredVals, board);
        
        // Get input information
        let code = event.code.startsWith("Digit") || event.code.startsWith("Key") ? event.code.slice(event.code.length-1) : "";
        let shift = event.shiftKey ^ candidateMode;
        
        // Check for win state
        if (!won) {
            // Control guess entry logic
            let index = possible.indexOf(code)
            if (index !== -1 && !shift) enteredVals[row * nsqr + col] = code;
            else if (index !== -1) { // control candidate entry
                if (candidates[row * nsqr + col].includes(code)) candidates[row * nsqr + col] = candidates[row * nsqr + col].replaceAt(index, " ");
                else { candidates[row * nsqr + col] = candidates[row * nsqr + col].replaceAt(index, code); }
            }
            else if (event.key === "Backspace") enteredVals[row * nsqr + col] = "";
            localStorage.setItem("enteredVals", JSON.stringify(enteredVals));
            localStorage.setItem("candidates", JSON.stringify(candidates));
            
            won = isCorrect(enteredVals, board); // I realize this appears just a few lines earlier, for some reason you have to check twice or it doesn't work
            if (won) {
                window.clearInterval(interval); // stop timer
                winVal.innerHTML = "Congrats! :)";
            }
        }
        
        createGrid(n, id, row, col, defaultVals, enteredVals, candidates);
    });
}

function makeBoard(n) {
    time = 0;
    won = false;
    let board = generateBoard(n);
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("enteredVals", JSON.stringify(board.enteredVals));
    localStorage.setItem("candidates", JSON.stringify(board.candidates));
    drawBoard(board, board.enteredVals, n, board.candidates);
}

function findDrawBoard(n) {
    let slider = document.getElementById("sideslider");
    let board = JSON.parse(localStorage.getItem("board"));
    if (board === null) { makeBoard(n); }
    else {
        n = board.n;
        slider.value = n;
        time = JSON.parse(localStorage.getItem("time"));
        setTime(); // display the time
        let enteredVals = JSON.parse(localStorage.getItem("enteredVals"));
        let candidates = JSON.parse(localStorage.getItem("candidates"));
        drawBoard(board, enteredVals, n, candidates);
    }
}

function main() {
    let n = 3;
    
    let slider = document.getElementById("sideslider");
    let sliderVal = document.getElementById("basenumber");
    sliderVal.innerHTML = "n";
    slider.oninput = function() {
        sliderVal.innerHTML = this.value;
        n = parseInt(this.value);
    }
    
    let generatorButton = document.getElementById("generator");
    generatorButton.onclick = function() {
        paused = false;
        
        // Reset timer
        time = 0;
        window.clearInterval(interval); // Stop old timer
        interval = window.setInterval(setTime, 1000); // Start new timer
        document.getElementById("timer").innerHTML = "0:00:00";
        
        // Make board
        makeBoard(n);
    }
    
    let pauseButton = document.getElementById("pause");
    pauseButton.onclick = function () {
        paused = !paused;
        if (paused) {
            if (!won) {
                window.clearInterval(interval);
                document.getElementById(id).innerHTML = "";
            }
            this.innerHTML = "Play";
        }
        else {
            if (!won) {
                interval = window.setInterval(setTime, 1000); // start new timer
                setTime();
                findDrawBoard(n);
            }
            this.innerHTML = "Pause";
        }
    }
    
    let candidateSwitch = document.getElementById("candidate");
    candidateSwitch.onclick = function() {
        candidateMode = !candidateMode;
    }
    
    findDrawBoard(n);
}

main();