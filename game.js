
var cols = 20;  // x 
var rows = 20; // y 


var board = document.getElementById("board");      // grid[x][y] = grid[row][col] = [div,......div19] 
var menuScreen = document.getElementById("menu");
var gameScreen = document.getElementById("game");
var hudLevel = document.getElementById("hud-level");
var hudScore = document.getElementById("hud-score");
var gameOverScreen = document.getElementById("gameover");
var finalScore = document.getElementById("final-score");


var grid = [];


var direction = null;  // direction to move
var next_direction = null; // direction check if player presses both key at the same time ( in the notes have example )
var tick = null; // game tick speed
var game_end = false;
var score = 0;

var snake = [
  { x: 5, y: 10 },
  { x: 4, y: 10 },
  { x: 3, y: 10 }
];

var food = null;

var currentLevel = 1;
var currentObstacles = [];  
var poisonConfig = false;
var warpEdges = false;

// poison state (only used when poisonConfig is set)
var poison = null;
var poisonStatus = "waiting";
var poisonTimer = 0;





function showMenu() {
  menuScreen.classList.remove("hidden");  // https://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_element_classname_toggle
  gameScreen.classList.add("hidden");
  if (tick !== null) {
    clearInterval(tick);
    tick = null;
  }
}


function showGame() {
  menuScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}


function updateHud() {
  hudLevel.textContent = currentLevel;
  hudScore.textContent = score;
}


function makeBoard() {
  board.innerHTML = "";
  grid = [];

  for (var row = 0; row < rows; row++) {
    grid[row] = [];
    for (var col = 0; col < cols; col++) {
      var box = document.createElement("div");
      box.className = "cell";
      board.appendChild(box);
      grid[row][col] = box;
    }
  }
}

// wipe all cells, then paint food, poison, obstacles, snake
function draw() {
  for (var row = 0; row < rows; row++) {
    for (var col = 0; col < cols; col++) {
      grid[row][col].className = "cell";
    }
  }

  if (food !== null) {
    grid[food.y][food.x].className = "food";
  }

  if (poison !== null) {
    grid[poison.y][poison.x].className = "poison";
  }

  for (var i = 0; i < currentObstacles.length; i++) {
    var ob = currentObstacles[i];
    grid[ob.y][ob.x].className = "obstacle";
  }

  for (var i = 0; i < snake.length; i++) {
    var part = snake[i];
    grid[part.y][part.x].className = "snake";
  }
}


function hitsSnake(position) { // check if the snake eat itself
  for (var i = 0; i < snake.length; i++) {
    var part = snake[i];
    if (part.x === position.x && part.y === position.y) return true;
  }
  return false;
}


function hitWall(position) { 
  for (var i = 0; i < currentObstacles.length; i++) {
    var ob = currentObstacles[i];
    if (ob.x === position.x && ob.y === position.y) return true;
  }
  return false;
}

// is this cell empty? (not on snake, obstacle, food, poison)
function cellIsFree(x, y) {
  if (hitsSnake({ x: x, y: y }) === true) return false;
  if (hitWall({ x: x, y: y }) === true) return false;
  if (food !== null && food.x === x && food.y === y) return false;
  if (poison !== null && poison.x === x && poison.y === y) return false;
  return true;
}


function findEmptyCell() { // function to spawn food without accidentally spawn on the snake 
  var attempts = 0;
  var maxAttempts = 100;

  while (attempts < maxAttempts) {
    var position = {
      x: Math.floor(Math.random() * cols),
      y: Math.floor(Math.random() * rows)
    };

    if (cellIsFree(position.x, position.y) === true) {
      return position;
    }

    attempts = attempts + 1;
  }

  return null;
}

// place normal food
function spawnFood() {
  var spot = findEmptyCell();
  if (spot !== null) {
    food = spot;
  }
}

function updatePoison() {
  if (poisonConfig === false) return;

  poisonTimer = poisonTimer + 1;

  if (poisonStatus === "waiting") {
    if (poisonTimer >= poisonConfig.waitTicks) {
      var spot = findEmptyCell();
      if (spot !== null) {
        poison = spot; // set the poison food to the spot 
        poisonStatus = "active";
        poisonTimer = 0;
      }
    }
  } else if (poisonStatus === "active") {
    if (poisonTimer >= poisonConfig.stayTicks) {
      poison = null;
      poisonStatus = "waiting";
      poisonTimer = 0;
    }
  }
}

// so the moving trick is pretty simple, example : snake position : (head){x:5,y:10} (body) {x:6,y:10} {x:7,y:10} (tail) {x:8,y:10} . u move by adding the direction . lets say going left -> direction {x:-1;y:0}
// Add to the snake to make the new position : head {x:4,y:10}  {x:5,y:10} {x:6,y:10} {x:7,y:10} tail (none), same with up, down , right. Also u need to pop the tail out wich is {x:8,y:10}

// if the snake eat a food, u activate unshift() which adds the new head. and since u add a new cell, u can keep the tail which is {x:8,y:10}


function move() {
  if (next_direction === null) return;
  direction = next_direction;

  var head = snake[0];
  var nextHead = {
    x: head.x + direction.x,
    y: head.y + direction.y
  };


  if (warpEdges === false) {
    if (nextHead.x < 0)     { 
      gameOver(); return; 

    }
    if (nextHead.x >= cols) { 
      gameOver(); return; 
    }
    if (nextHead.y >= rows) { 
      gameOver(); return; 
    }
    if (nextHead.y < 0)     { 
      gameOver(); return;
     }
  } else {
    if (nextHead.x < 0)     {
       nextHead.x = cols - 1;
       }
    if (nextHead.x >= cols) {
       nextHead.x = 0;
      }
    if (nextHead.y >= rows) {
       nextHead.y = 0; 
      }
    if (nextHead.y < 0)     { 
      nextHead.y = rows - 1;
     }
  }


  if (hitWall(nextHead) === true) {
    gameOver();
    return;
  }

  
  if (hitsSnake(nextHead) === true) {
    gameOver();
    return;
  }

  snake.unshift(nextHead);

 
  if (nextHead.x === food.x && nextHead.y === food.y) {
    score = score + 1;
    spawnFood();
  } else {
    snake.pop();
  }

  // poison: shrink by 1, score down
  if (poison !== null) {
    if (nextHead.x === poison.x && nextHead.y === poison.y) {
      score = score - 3;
      if (score < 0) score = 0;
      poison = null;
      poisonStatus = "waiting";
      poisonTimer = 0;
      snake.pop();
      if (snake.length < 2) {
        gameOver();
        return;
      }
    }
  }
}

function gameOver() {
  game_end = true;
  clearInterval(tick);
  finalScore.textContent = score;
  gameOverScreen.classList.remove("hidden");
}


function gameTick() {
  if (game_end === true) return;
  updatePoison();
  move();
  draw();
  updateHud();
}


function loadLevel(n) {
  currentLevel = n;

  // reset 
  currentObstacles = [];
  poisonConfig = false;
  warpEdges = false;
  poison = null;
  poisonStatus = "waiting";
  poisonTimer = 0;
  gameOverScreen.classList.add("hidden");

// So , the levels inherit from the lower levels. So lvl 1 is the base game. so if n>=2 then games have walls. Similar if n>=4 meaning that it inherits the poison food
// but have a mechanic that u can warp to the other side

  if (n >= 2) {
    currentObstacles = LEVEL_2_OBSTACLES;
  }

 
  if (n >= 3) {
    poisonConfig = { waitTicks: 60, stayTicks: 53 };
  }


  if (n >= 4) {
    warpEdges = true;
    currentObstacles = LEVEL_4_OBSTACLES;
  }

  if (tick !== null) {
    clearInterval(tick);
    tick = null;
  }

  // reset snake and state
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ];
  direction = null;
  next_direction = null;
  game_end = false;
  score = 0;

  // build and start
  makeBoard();
  spawnFood();
  draw();
  updateHud();
  showGame();
  tick = setInterval(gameTick, 150);
}

// level buttons
var levelButtons = document.querySelectorAll(".level-btn");
for (var i = 0; i < levelButtons.length; i++) {
  levelButtons[i].addEventListener("click", function(event) {
    var levelNumber = parseInt(event.target.dataset.level, 10);
    loadLevel(levelNumber);
  });
}


// retry button
document.getElementById("retry-btn").addEventListener("click", function() {
  loadLevel(currentLevel);
});
// return to menu
document.getElementById("to-menu-btn").addEventListener("click", function() {
  showMenu();
});


document.addEventListener("keydown", function(event) {
  if (game_end === true) return;
  if (gameScreen.classList.contains("hidden")) return;

  var key = event.key;
  var new_direction = null;

  if (key === "ArrowUp")    new_direction = { x: 0, y: -1 };
  if (key === "ArrowDown")  new_direction = { x: 0, y: 1 };
  if (key === "ArrowLeft")  new_direction = { x: -1, y: 0 };
  if (key === "ArrowRight") new_direction = { x: 1, y: 0 };

  if (new_direction === null) return;

  if (direction !== null) {
    if (new_direction.x === -direction.x && new_direction.y === -direction.y) return; // fixed the backwards traversal
  }

  next_direction = new_direction;
});

showMenu();
