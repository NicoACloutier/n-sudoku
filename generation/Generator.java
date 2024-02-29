import java.io.FileOutputStream;
import java.io.IOException;

public class Generator {
    private static int NUM_GENERATED = 2; // number of board to generate for each base
    private static int INITIAL_BASE = 2; // smallest base to generate for
    private static int FINAL_BASE = 5; // largest base to generate for
    private static String CHARS = "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ0"; // potential characters
    private static String OUTPUT_FILE = "../src/board.js"; //board to write results to
    
    /*
    Generate JSON String possible from `Board` object.
    Arguments:
        `Board board`: The Board to create the String for.
    Returns:
        `String`: The JSON representation of the board possible values.
    */
    private static String generatePossible(Board board) {
        String out = "\"possible\":[";
        String possible = Generator.CHARS.substring(0, board.getN()*board.getN());
        for (int i = 0; i < possible.length(); i++) {
            out += "\"" + possible.charAt(i) + "\"";
            if (i != possible.length() - 1) { out += ","; }
        }
        return  out + "],";
    }
    
    /*
    Generate JSON String base from `Board` object.
    Arguments:
        `Board board`: The Board to create the String for.
    Returns:
        `String`: The JSON representation of the board base.
    */
    private static String generateN(Board board) {
        return "\"n\":" + String.valueOf(board.getN()) + ",";
    }
    
    /*
    Generate JSON String board from `Board` object.
    Arguments:
        `Board board`: The Board to create the String for.
    Returns:
        `String`: The JSON representation of the board.
    */
    private static String generateBoard(Board board, String possible) {
        int nsqr = board.getN() * board.getN();
        String out = "\"board\":[";
        for (int i = 0; i < nsqr; i++) {
            for (int j = 0; j < nsqr; j++) {
                Integer val = board.getBoard()[i][j];
                out += "\"" + possible.charAt(val - 1) + "\"";
                if (i != nsqr - 1 || j != nsqr - 1) { out += ","; }
            }
        }
        return out + "],";
    }
    
    /*
    Generate JSON String mask from board.
    Arguments:
        `Board board`: The Board to create the String for.
    Returns:
        `String`: The JSON representation of the board mask.
    */
    private static String generateMask(Board board) {
        int nsqr = board.getN() * board.getN();
        String out = "\"mask\":[";
        for (int i = 0; i < nsqr; i++) {
            for (int j = 0; j < nsqr; j++) {
                out += "\"" + (board.getMask()[i][j] ? "true" : "false") + "\"";
                if (i != nsqr - 1 || j != nsqr - 1) { out += ","; }
            }
        }
        return out + "]";
    }
    
    /*
    Generate a JSON string given a board.
    Arguments:
        `Board board`: The Board to create the String for.
    Returns:
        `String`: The JSON representation of the board.
    */
    private static String generateString(Board board) {
        String possible = Generator.CHARS.substring(0, board.getN()*board.getN());
        String out = "'{\"board\":{";
        out += Generator.generateN(board);
        out += Generator.generateBoard(board, possible);
        out += Generator.generatePossible(board);
        out += Generator.generateMask(board);
        return out + "}}'";
    }
    
    public static void main(String[] args) throws IOException {
        String jsOutput = "";
        for (int i = Generator.INITIAL_BASE; i <= Generator.FINAL_BASE; i++) {
            jsOutput += "export const base_" + String.valueOf(i) + " = [";
            for (int j = 0; j < Generator.NUM_GENERATED; j++) {
                Board board = new Board(i);
                jsOutput += Generator.generateString(board);
                if (i != Generator.NUM_GENERATED - 1) { jsOutput += ", "; }
            }
            jsOutput += "];\n";
        }
        
        FileOutputStream fos = new FileOutputStream(Generator.OUTPUT_FILE);
        byte[] jsBytes = jsOutput.getBytes();
        fos.write(jsBytes);
        fos.close();
    }
}