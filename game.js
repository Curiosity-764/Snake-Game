var cols = 20; // X
var rows = 20;  // Y


var board = document.getElementById("board");
var grid = [];
var direction = null;
var next_direction = null;
var tick = null;
var game_end = false;

var snake = [
  { x: 5, y: 10 },
  { x: 4, y: 10 },
  { x: 3, y: 10 }
];

var food = null;
var score = 0;

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
  grid[food.y][food.x].className = "food";
  for (var i = 0; i < snake.length; i++) {
    var part = snake[i];
    grid[part.y][part.x].className = "snake"; // if its the snake cell then re-draw as the sanke colorr 
  }
}


function hitsSnake(position) { // function check to see if the snake hit itself
  for (var i = 0; i < snake.length; i++) {
    var part = snake[i];

    if (part.x === position.x && part.y === position.y) {
      return true;
    }
  }

  return false;
}


function spawnFood() { 
  while (true) {
    var position = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };

    if (hitsSnake(position) === false) {
      food = position;
      return;
    }
  }
}


function move() {   // computing the next head for the snake to move  
   if (next_direction === null) return;
   direction = next_direction;
    var head = snake[0];

    var nextHead = {
      x: head.x + direction.x,
      y: head.y + direction.y
    };
if(nextHead.x < 0)  {
    gameOver(); return ; // Check for if snake going out of the grid
   } 
if(nextHead.x >= cols)  {  // Check for if snake going out of the grid
    gameOver(); return ; 
  }
if(nextHead.y >= rows)  { // Check for if snake going out of the grid
    gameOver(); return ;
   }
if(nextHead.y < 0) { // Check for if snake going out of the grid
    gameOver(); return ; 
  }
if(hitsSnake(nextHead)===true){  // check if it hit itself
  gameOver(); return ;
}




    snake.unshift(nextHead);
    if (nextHead.x === food.x && nextHead.y === food.y) {
      score = score + 1;
      spawnFood();
    } else {
      snake.pop();
    }
  } 


  function gameOver(){ // end the game
    game_end = true;
    clearInterval(tick);
    
  }


  function start() { // start the game
  makeBoard();
  spawnFood();
  draw();
  tick = setInterval(gameTick, 150);
}

  function gameTick() { // runs move() and draw() every tick
if (game_end === true) return;
    move();
    draw();
  }

  document.addEventListener("keydown", function(event) {
     if (game_end === true) return;
    var key = event.key;
    var new_direction = null;
    
    if (key === "ArrowUp")    new_direction = { x: 0, y: -1 };
    if (key === "ArrowDown")  new_direction = { x: 0, y: 1 };
    if (key === "ArrowLeft")  new_direction = { x: -1, y: 0 }; 
    if (key === "ArrowRight") new_direction = { x: 1, y: 0 };
    

if (new_direction === null) return;

if (direction!=null) {
    if (new_direction.x === -direction.x && new_direction.y === -direction.y) return ;

}
    next_direction = new_direction;
  });

start();
