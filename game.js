var rows = 20;
var cols = 20;

var board = document.getElementById("board");
var grid = [];
var direction = null;
var tick = null;
var game_end = false;

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
function move() {   // computing the next head for the snake to move  
    var head = snake[0];

    var nextHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };
if(nextHead.x < 0)  {
    gameOver(); return ; } 
if(nextHead.x >= cols)  { 
    gameOver(); return ; }
if(nextHead.y >= rows)  {
    gameOver(); return ; }
if(nextHead.y < 0) {
    gameOver(); return ; }

    snake.unshift(nextHead);
    snake.pop();
  } 


  function gameOver(){ // end the game
    game_end = true;
    clearInterval(tick);
    
  }


  function start() { // start the game
  makeBoard();
  draw();
  tick = setInterval(gameTick, 150);
}

  function gameTick() { // runs move() and draw() every tick
if (game_end === true) return;
    move();
    draw();
  }

  document.addEventListener("keydown", function(event) {
    var key = event.key;
    if (game_end === true) return;
    if (key === "ArrowUp")    direction = { x: 0, y: -1 };
    if (key === "ArrowDown")  direction = { x: 0, y: 1 };
    if (key === "ArrowLeft")  direction = { x: -1, y: 0 };
    if (key === "ArrowRight") direction = { x: 1, y: 0 };

    
  });

start();
