'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {
  
  let solver = new SudokuSolver();

  app.route('/api/check')
    .post((req, res) => {
      
      const { puzzle, coordinate, value } = req.body;
      console.log(req.body)
      
      if (!puzzle || !coordinate || !value) {
        res.json({ error: "Required field(s) missing" });
        return;
      }
      let validation = solver.validate(puzzle);
      if (validation !== "Valid") {
        res.json({ error: validation });
        return;
      }
      let coordinateArray = coordinate.split("");
      const row = coordinateArray[0];
      const column = coordinateArray[1];
      // console.log(row, column);
      if (
        coordinate.length !== 2 ||
        !/[a-i]/i.test(row) ||
        !/[1-9]/i.test(column)
      ) {
        console.log("///"+row,column);
        res.json({ error: "Invalid coordinate" });
        return;
      }
      
      if (!/[1-9]/i.test(value) || value > 9 || value < 1) {
        res.json({ error: "Invalid value" });
        return;
      }
      
      let index = (solver.letterToNumber(row) - 1) * 9 + (column - 1);
      if (puzzle[index] == value) {
        res.json({ valid: true });
        return;
      }

      let validCol = solver.checkColPlacement(puzzle, row, column, value);
      let validReg = solver.checkRegionPlacement(puzzle, row, column, value);
      let validRow = solver.checkRowPlacement(puzzle, row, column, value);
      let conflicts = [];

      if (validCol && validReg && validRow) {
        res.json({ valid: true });
      } else {
        if (!validRow) {
          conflicts.push("row");
        }
        if (!validCol) {
          conflicts.push("column");
        }
        if (!validReg) {
          conflicts.push("region");
        }
        res.json({ valid: false, conflict: conflicts });
      }
      console.log( coordinate, value );
    });
    
  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;
      if (solver.validate(puzzle) !== "Valid") {
        res.json({ error: solver.validate(puzzle) });
        return;
      }
      const solvedString = solver.completeSudoku(puzzle);
      if (!solvedString) {
        res.json({ error: "Puzzle cannot be solved" });
      } else {
        res.json({ solution: solvedString });
      }
    });
};
