import java.lang.Math;
import java.util.Collections;
import java.util.ArrayList;
import java.lang.System;

public class Board {
	private Integer n; // The base of the Sudoku board.
	private Integer[][] board; // The generated Sudoku board solution.
	private boolean[][] mask; // The generated board mask.
	
	private static double getLimit(Integer aN) {
		if (aN <= 4) { return 100 * aN; } // linear for smaller numbers
		else { return 100 * Math.pow(1.75, aN); } // for larger, exponential limit
	}
	
	/*
    Convert a board to masked board given a mask. 
	`maskedBoard[i][j]` will be set to `null` for all `i` and `j` such that `aMask[i][j]`
    Arguments:
        `Integer[][] aBoard`: Double integer array with board information.
        `boolean[][] aMask`: Double boolean array with mask information.
    Returns:
        `Integer[][]`: The masked board.
    */
	private static Integer[][] maskBoard(Integer[][] aBoard, boolean[][] aMask) {
		Integer[][] maskedBoard = new Integer[aBoard.length][aBoard.length];
		for (int i = 0; i < aBoard.length; i++) {
			for (int j = 0; j < aBoard[i].length; j++) {
				if (aMask[i][j]) { maskedBoard[i][j] = null; }
				else { maskedBoard[i][j] = aBoard[i][j]; }
			}
		}
		return maskedBoard;
	}
	
	/*
    Mask a board in place.
    Arguments:
        `Integer[][] aBoard`: Board to mask in place.
        `boolean[][] aMask`: Reference mask for masking.
    Returns:
        `void`
    */
	private static void maskBoardInPlace(Integer[][] aBoard, boolean[][] aMask) {
		for (int i = 0; i < aBoard.length; i++) {
			for (int j = 0; j < aBoard[i].length; j++) {
				if (aMask[i][j]) { aBoard[i][j] = null; }
				else { aBoard[i][j] = aBoard[i][j]; }
			}
		}
	}
	
	/*
    Get all of the possible numbers for a given cell.
    Arguments:
        `Integer[][] aBoard`: Double integer array with board information.
        `int x`: The x coordinate of the cell.
        `int y`: The y coordinate of the cell.
        `Integer aN`: The base of the Sudoku board.
    Returns:
        `ArrayList<Integer>`: An `ArrayList` of possible cell values.
	*/
    private static ArrayList<Integer> makePossible(Integer[][] aBoard, int x, int y, Integer aN) {
		ArrayList<Integer> out = new ArrayList<Integer>();
		for (int i = 1; i <= aBoard.length; i++) { out.add(i); }
		
		// check line
		for (int i = 0; i < aBoard.length; i++) {
			Integer item = aBoard[x][i];
			if (item != null && out.contains(Integer.valueOf(item))) { out.remove(Integer.valueOf(item)); }
		}
		// check column
		for (int i = 0; i < aBoard.length; i++) {
			Integer item = aBoard[i][y];
			if (item != null && out.contains(Integer.valueOf(item))) { out.remove(Integer.valueOf(item)); }
		}
		// check box
		int xb = ((int) x / aN) * aN; // x beginning
		int yb = ((int) y / aN) * aN; // y beginning
		for (int i = 0; i < aN; i++) {
			for (int j = 0; j < aN; j++) {
				Integer item = aBoard[xb+i][yb+j];
				if (item != null && out.contains(Integer.valueOf(item))) { out.remove(Integer.valueOf(item)); }
			}
		}
		
		return out;
	}
	
	/*
    Tell whether placement is valid.
    Arguments:
        `Integer[][] aBoard`: Double integer array with board information.
        `int x`: The x coordinate of the cell.
        `int y`: The y coordinate of the cell.
        `Integer aN`: The base of the Sudoku board.
    Returns:
        `boolean`: `true` if placement is valid, otherwise `false`.
	*/
    private static boolean isValidPlacement(Integer[][] aBoard, int x, int y, Integer aN) {
		Integer value = aBoard[y][x];
		if (value == null) { return false; }
		for (int i = 0; i < aBoard.length; i++) {
			if (aBoard[i][x] != null && i != y) { 
				if (value.equals(aBoard[i][x])) { return false; }
			}
			if (aBoard[y][i] != null && i != x) {
				if (value.equals(aBoard[y][i])) { return false; }
			}
		}
		int xb = ((int) x / aN) * aN; // column beginning
		int yb = ((int) y / aN) * aN; // row beginning 
		for (int i = 0; i < aN; i++) {
			for (int j = 0; j < aN; j++) {
				if ((j+yb == y && i+xb == x) || aBoard[j+yb][i+xb] == null) { continue; }
				if (value.equals(aBoard[j+yb][i+xb])) { return false; }
			}
		}
		return true;
	}
	
	/*
    Fill in Sudoku board using backtracking.
    Call with `row=0` and `col=0` to generate a full Sudoku board.
        NOTE: Operates in-place.
    Arguments:
        `Integer[][] aBoard`: Double integer array with board information.
        `int x`: The x coordinate of the cell.
        `int y`: The y coordinate of the cell.
        `Integer aN`: The base of the Sudoku board.
        `long start`: The starting time from epoch in milliseconds.
        `long limit`: The time limit from the starting point in milliseconds.
    Returns:
        `int`: Return code, according to the following values:
            `0`: Incorrect value reached. This should never return from a complete call.
            `1`: Successful board compilation achieved.
            `-1`: Time limit exceeded.
    */
	private static int fillIn(Integer[][] aBoard, int row, int col, Integer aN, long start, long limit) {
		if (System.currentTimeMillis() - start >= limit) { return -1; }
		if (row == aBoard.length-1 && col == aBoard.length) { return 1; }
		else if (col == aBoard.length) { return fillIn(aBoard, row+1, 0, aN, start, limit); }
		
		ArrayList<Integer> numbers = Board.makePossible(aBoard, row, col, aN);
		if (numbers.size() == 0) { return 0; }
		Collections.shuffle(numbers);
		
		for (int i = 0; i < numbers.size(); i++) {
			Integer temp = numbers.get(i);
			aBoard[row][col] = temp;
			if (fillIn(aBoard, row, col+1, aN, start, limit) == 1) { break; }
			else if (i == numbers.size()-1) { aBoard[row][col] = null; return 0; }
			else { aBoard[row][col] = null; }
		}
		
		if (System.currentTimeMillis() - start >= limit) { return -1; }
		return 1;
	}
	
	/*
    Return how many times a board can be solved (stops after 2).
    A complete call with start with `row=0`, `col=0`, and `count=0`.
    Arguments:
        `Integer[][] maskedBoard`: Masked board, with masked values being `null`.
        `int row`: The current row value. Should start at 0.
        `int col`: The current column value. Should start at 0.
        `int count`: The current count of solutions. Should start at 0.
        `boolean[][] mask`: Current board mask.
        `long limit`: The time limit in milliseconds.
        `long start`: The time from epoch in milliseconds.
        `Integer aN`: The base of the Sudoku board.
    Returns:
        `int`: The number of solutions. Stops counting after 2.
	*/
    private static int solveCount(Integer[][] maskedBoard, int row, int col, int count, boolean[][] mask, long limit, long start, Integer aN) {
		if (System.currentTimeMillis() - start >= limit) { return -1; }
		if (row == maskedBoard.length) { Board.maskBoardInPlace(maskedBoard, mask); return 1; }
		else if (col == maskedBoard.length) { count += Board.solveCount(maskedBoard, row+1, 0, count, mask, limit, start, aN); return count; }
		else if (maskedBoard[row][col] != null) { count += Board.solveCount(maskedBoard, row, col+1, count, mask, limit, start, aN); return count; }
		
		ArrayList<Integer> numbers = Board.makePossible(maskedBoard, row, col, aN);
		if (numbers.size() == 0) { return 0; }
		Collections.shuffle(numbers);
		
		for (int i = 0; i < numbers.size() && count < 2; i++) {
			Integer temp = numbers.get(i);
			maskedBoard[row][col] = temp;
			count += Board.solveCount(maskedBoard, row+1, col, count, mask, limit, start, aN);
		}
		
		if (System.currentTimeMillis() - start >= limit) { return -1; }
		return count;
	}
	
    /*
    Generate a board at random from an entered base.
    Arguments:
        `Integer enteredN`: The Sudoku board base.
    Returns:
        `Board`: The generated `Board` object.
    */
	public Board(Integer enteredN) {
		n = enteredN;
		int response = -1;
		while (response == -1) {
			makeBoard();
			response = makeMask();
		}
	}
    
	/*
    Make a board at random.
    Acts in-place on `this`.
    Arguments:
        `void`
    Returns:
        `void`
	*/
    private void makeBoard() {
		long limit = (long) Board.getLimit(n);
		int response = -1;
		int count = 1;
		while (response == -1 || response == 0) {
			board = new Integer[n*n][n*n];
			for (int i = 0; i < board.length; i++) {
				for (int j = 0; j < board.length; j++) { board[i][j] = null; }
			}
			long time = System.currentTimeMillis();
			response = fillIn(board, 0, 0, n, time, limit);
			count++;
		}
	}
	
	/*
    Make a board mask at random.
    Acts in-place on `this`.
    Arguments:
        `void`
    Returns:
        `int`: Return code, according to the following values:
            `1`: Successful board compilation achieved.
            `-1`: Time limit exceeded.
    */
	private int makeMask() {
		long limit = (long) (5 * Board.getLimit(n));
		long time = System.currentTimeMillis();
		
		mask = new boolean[n*n][n*n];
		for (int i = 0; i < mask.length; i++) {
			for (int j = 0; j < mask.length; j++) { mask[i][j] = false; }
		}
		
		ArrayList<Integer> places = new ArrayList<Integer>();
		for (int i = 0; i < mask.length * mask.length; i++) { places.add(i); }
		Collections.shuffle(places);
		
		for (Integer place : places) {
			int x = place % (mask.length);
			int y = place / (mask.length);
			mask[x][y] = true;
			int count = Board.solveCount(getMaskedBoard(), 0, 0, 0, mask, limit, time, n);
			if (count == -1) { return -1; }
			if (count > 1) { mask[x][y] = false; }
		}
		
		return 1;
	}
	
	public Integer getN() { return n; } // Getter for instance variable `n`
	public Integer[][] getBoard() { return board; } // Getter for instance variable `board`
	public boolean[][] getMask() { return mask; } // Getter for instance variable `mask`
	public Integer[][] getMaskedBoard() { return Board.maskBoard(board, mask); } // Create a masked board
}