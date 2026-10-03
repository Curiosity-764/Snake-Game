var rows = 20;
var cols = 20;

var board = document.getElementById("board");
var grid = [];

var snake = [
  { x: 5, y: 10 },
  { x: 4, y: 10 },
  { x: 3, y: 10 }
];

function makeBoard() {
  board.innerHTML = "";
  grid = []; 


  for (var row = 0; row < rows; row++) {
    grid[row] = [];
    for (var col = 0; col < cols; col++) {
      var box = document.createElement("div");   // Div Box to draw
      box.className = "cell";
      board.appendChild(box);
      grid[row][col] = box;
    }
  }
}

function draw() {
  for (var row = 0; row < rows; row++) {
    for (var col = 0; col < cols; col++) {
      grid[row][col].className = "cell"; // target the cell to draw
    }
  }

  for (var i = 0; i < snake.length; i++) {
    var part = snake[i];
    grid[part.y][part.x].className = "snake"; // if its the snake cell then re-draw as the sanke colorr 
  }
}

makeBoard();
draw();