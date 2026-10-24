// Em  khá là thích tiếng anh nên code em làm và github em cx để tiếng anh ạ. em cx đang học tiếng anh nên thầy thông cảm giúp em. Cảm ơn thầy!
var cols = 20;  // x 
var rows = 20; // y 

var board = document.getElementById("board");      // grid[x][y] = grid[row][col] = [div,......div19] 
var menuScreen = document.getElementById("menu");
var gameScreen = document.getElementById("game");
var level = document.getElementById("level");
var scoring = document.getElementById("score");
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


var movingWalls = [];

// draw map layout
function blockOfCells(x, y, w, h) { // x : start at x , y : ends at y, w : width of the rectangle , h : height of the rectangle
    var cells = [];   // example blockOfCells(2, 3, 3, 2)
    for (var row = 0; row < h; row++) {    // outer loop : height since row < h then row < 2 meaning 2 loops in the outer layer
        for (var col = 0; col < w; col++) {    // inner loop : width since col < w then col < 3 meaning 3 loops in the inner layer
            cells.push({ x: x + col, y: y + row });   // pushes the cells in . final result : * * *         col = inner layer = 3
            //                                      * * *          row = 2 as outerlayer =2
        }  // one note to mention : x : x+col means that if col++ its gonna walk through the width and increase the x by 1 each time the loop comes through. same with y
        // x was never modified since i wrote it as x : x+col not x = x+col
    }
    return cells;
}

// Level layouts
var LEVEL_2 = [
    ...blockOfCells(0, 0, 5, 1),  // "..."" = spread = join array
    ...blockOfCells(15, 0, 5, 1),
    ...blockOfCells(19, 0, 1, 5),
    ...blockOfCells(0, 0, 1, 5),
    ...blockOfCells(0, 19, 5, 1),
    ...blockOfCells(0, 15, 1, 5),
    ...blockOfCells(15, 19, 5, 1),
    ...blockOfCells(5, 5, 10, 3),
    ...blockOfCells(19, 15, 1, 5),
    ...blockOfCells(5, 12, 10, 3)]
    ;

var LEVEL_3 = [
    ...blockOfCells(3, 0, 3, 8),
    ...blockOfCells(12, 6, 8, 3),
    ...blockOfCells(0, 14, 8, 3),
    ...blockOfCells(14, 14, 3, 6)]
    ;

var LEVEL_4 = [...blockOfCells(8, 0, 4, 20)];

var LEVEL_5 = [
    ...blockOfCells(2, 1, 2, 2),
    ...blockOfCells(16, 1, 2, 2),
    ...blockOfCells(2, 16, 2, 2),
    ...blockOfCells(16, 16, 2, 2),

    ...blockOfCells(9, 2, 2, 6),
    ...blockOfCells(9, 12, 2, 6)
];



var LEVEL_6 = [

    ...blockOfCells(2, 2, 5, 1),
    ...blockOfCells(9, 2, 1, 2),  
    ...blockOfCells(13, 2, 5, 1),
    ...blockOfCells(21, 2, 5, 1),
    ...blockOfCells(28, 2, 5, 1),
    ...blockOfCells(40, 2, 5, 1),

 
    ...blockOfCells(38, 3, 1, 2), 
    ...blockOfCells(10, 6, 4, 1),
    ...blockOfCells(18, 6, 1, 3),
    ...blockOfCells(23, 6, 1, 3),
    ...blockOfCells(28, 6, 1, 3),
    ...blockOfCells(36, 6, 1, 3),

    ...blockOfCells(17, 10, 7, 1), 
    ...blockOfCells(26, 10, 7, 1),
    ...blockOfCells(17, 11, 1, 3), 
    ...blockOfCells(33, 11, 1, 3), 
    ...blockOfCells(17, 15, 1, 4), 
    ...blockOfCells(33, 15, 1, 4),
    ...blockOfCells(17, 18, 7, 1), 
    ...blockOfCells(26, 18, 7, 1),

    ...blockOfCells(2, 13, 5, 1),
    ...blockOfCells(8, 12, 1, 3),
    ...blockOfCells(12, 13, 1, 2),
    ...blockOfCells(38, 13, 5, 1),
    ...blockOfCells(36, 12, 1, 3),

    ...blockOfCells(18, 22, 1, 2),
    ...blockOfCells(22, 22, 1, 2),
    ...blockOfCells(26, 22, 1, 2),
    ...blockOfCells(34, 22, 3, 1),

    ...blockOfCells(2, 27, 4, 1),
    ...blockOfCells(12, 27, 4, 1),
    ...blockOfCells(21, 27, 4, 1),
    ...blockOfCells(30, 27, 4, 1),
    ...blockOfCells(40, 27, 4, 1),

    ...blockOfCells(8, 24, 1, 2),
    ...blockOfCells(37, 25, 1, 3)
];



// Each moving wall has its own direction, speed, and boundaries . 1 = right, -1 = left


function setupMovingWalls() {

    movingWalls = [];

    if (currentLevel !== 5) return;


    movingWalls.push({
        cells: blockOfCells(0, 4, 8, 1),
        axis: "y",
        direction: 1,
        minPos: 0,
        maxPos: 12,
        speed: 2,

    });

    // 4. Build the second wall directly
    movingWalls.push({
        cells: blockOfCells(12, 14, 8, 1),
        axis: "y",
        direction: -1,
        minPos: 0,
        maxPos: 12,
        speed: 3,

    });
}

function updateMovingWalls() {
    for (var w = 0; w < movingWalls.length; w++) {
        var wall = movingWalls[w];

        wall.timer++;

        if (wall.timer < wall.speed) continue;

        wall.timer = 0;

        var axis = wall.axis;
        var currentMin = wall.cells[0][axis];
        var currentMax = wall.cells[0][axis];

        // Find the current boundaries of the wall
        for (var c = 1; c < wall.cells.length; c++) {
            var value = wall.cells[c][axis];

            if (value < currentMin) currentMin = value;
            if (value > currentMax) currentMax = value;
        }

        // Check if the next movement crossed a boundary
        var nextMin = currentMin + wall.direction;
        var nextMax = currentMax + wall.direction;

        if (nextMin < wall.minPos || nextMax > wall.maxPos + 7) {
            wall.direction *= -1; // *-1 for reverse
            continue;
        }

        // Check whether the wall would move into the snake
        var hitsSnakeOnNextMove = false;

        for (var c = 0; c < wall.cells.length; c++) {
            var nextX = wall.cells[c].x;
            var nextY = wall.cells[c].y;

            if (axis === "x") {
                nextX += wall.direction;
            } else {
                nextY += wall.direction;
            }

            if (hitsSnake({ x: nextX, y: nextY })) {
                hitsSnakeOnNextMove = true;
                break;
            }
        }


        if (hitsSnakeOnNextMove) {
            gameOver();
            return;
        }

        // Move this wall independently
        for (var c = 0; c < wall.cells.length; c++) {
            wall.cells[c][axis] += wall.direction;
        }
    }
}

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
    level.textContent = currentLevel;
    scoring.textContent = score;
}

function makeBoard() {
    board.innerHTML = "";
    grid = [];

    
    board.style.gridTemplateColumns = "repeat(" + cols + ", 24px)";
    board.style.gridTemplateRows = "repeat(" + rows + ", 24px)";

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

    // moving walls
    for (var w = 0; w < movingWalls.length; w++) {
        var wall = movingWalls[w];

        for (var c = 0; c < wall.cells.length; c++) {
            var cell = wall.cells[c];
            grid[cell.y][cell.x].className = "obstacle";
        }
    }

    for (var i = 0; i < snake.length; i++) {
        var part = snake[i];

        if (i === 0) {
            var headClass = "snake-head";

            if (direction.x === 1) headClass += " right";
            if (direction.x === -1) headClass += " left";
            if (direction.y === -1) headClass += " up";
            if (direction.y === 1) headClass += " down";

            grid[part.y][part.x].className = headClass;
        } else {
            grid[part.y][part.x].className = "snake";
        }
    }

    // fog
    if (currentLevel === 6) {
        var head = snake[0];
        var visionRadius = 5; // How many cells you can see in each direction

        for (var row = 0; row < rows; row++) {
            for (var col = 0; col < cols; col++) {
                
                // Calculate distance from the head to this cell
                var distanceX = Math.abs(col - head.x);
                var distanceY = Math.abs(row - head.y);
                
                // If the cell is outside the vision radius, cover it in fog
                if (distanceX > visionRadius || distanceY > visionRadius) {
                    grid[row][col].className = "fog"; 
                }
            }
        }
    }
}
function hitsSnake(position) { // check if the snake eat itself
    for (var i = 0; i < snake.length; i++) {
        var part = snake[i];

        if (part.x === position.x && part.y === position.y) {
            return true;
        }
    }

    return false;
}

function hitWall(position) {
    for (var i = 0; i < currentObstacles.length; i++) {
        var ob = currentObstacles[i];

        if (ob.x === position.x && ob.y === position.y) {
            return true;
        }
    }

    for (var w = 0; w < movingWalls.length; w++) {
        var wall = movingWalls[w];

        for (var c = 0; c < wall.cells.length; c++) {
            var cell = wall.cells[c];

            if (cell.x === position.x && cell.y === position.y) {
                return true;
            }
        }
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
    var maxAttempts = 400;

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
    food = findEmptyCell();
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
// Add to the snake to make the new position : head {x:4,y:10} {x:5,y:10} {x:6,y:10} {x:7,y:10} tail (none), same with up, down , right. Also u need to pop the tail out wich is {x:8,y:10}

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
        if (nextHead.x < 0) {
            gameOver();
            return;
        }

        if (nextHead.x >= cols) {
            gameOver();
            return;
        }

        if (nextHead.y >= rows) {
            gameOver();
            return;
        }

        if (nextHead.y < 0) {
            gameOver();
            return;
        }
    } else {
        if (nextHead.x < 0) {
            nextHead.x = cols - 1;
        }

        if (nextHead.x >= cols) {
            nextHead.x = 0;
        }

        if (nextHead.y >= rows) {
            nextHead.y = 0;
        }

        if (nextHead.y < 0) {
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

    // Check food only when food exists
    if (food !== null && nextHead.x === food.x && nextHead.y === food.y) {
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

    if (tick !== null) {
        clearInterval(tick);
        tick = null;
    }

    finalScore.textContent = score;
    gameOverScreen.classList.remove("hidden");
}

function gameTick() {
    if (game_end === true) return;

    updatePoison();
    updateMovingWalls();

    move();

    if (game_end === true) return;

    draw();
    updateHud();
}

function loadLevel(n) {
    currentLevel = n;
 
    // reset
    cols = 20;
    rows = 20;
    currentObstacles = [];
    poisonConfig = false;
    warpEdges = false;
    poison = null;
    poisonStatus = "waiting";
    poisonTimer = 0;
    food = null;

    gameOverScreen.classList.add("hidden");

    // So , the levels inherit from the lower levels. So lvl 1 is the base game. so if n>=2 then games have walls. Similar if n>=4 meaning that it inherits the poison food
    // but have a mechanic that u can warp to the other side

    if (n >= 2) {
        currentObstacles = LEVEL_2;
    }

    if (n >= 3) {
        poisonConfig = { waitTicks: 60, stayTicks: 53 };
        currentObstacles = LEVEL_3;
    }

    if (n >= 4) {
        warpEdges = true;
        currentObstacles = LEVEL_4;
    }

    if (n >= 5) {
        currentObstacles = LEVEL_5;
    }

    
    if (n >= 6) {
        cols = 45;
        rows = 30;
        currentObstacles = LEVEL_6;
        warpEdges=true;
    }




    if (tick !== null) {
        clearInterval(tick);
        tick = null;
    }

    // reset snake and state
    if (n >= 6) {
        snake = [
            { x: 40, y: 25 },
            { x: 39, y: 25 },
            { x: 38, y: 25 }
        ];
    } else if (n >= 5) {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
    } else {
        snake = [
            { x: 5, y: 10 },
            { x: 4, y: 10 },
            { x: 3, y: 10 }
        ];
    }


    direction = { x: 1, y: 0 };

    next_direction = null;   // Previous value : direction = null
    // fix : direction = {x:1,y:0} , Fixes the problem where u can eat urself if loaded in and go backwards
    game_end = false;
    score = 0;

    // build and start
    makeBoard();

    // Set up moving walls before spawning food
    setupMovingWalls();

    spawnFood();
    draw();
    updateHud();
    showGame();

    tick = setInterval(gameTick, 150);
}

// level buttons
var levelButtons = document.querySelectorAll(".level-btn");

for (var i = 0; i < levelButtons.length; i++) {
    levelButtons[i].addEventListener("click", function (event) {
        var levelNumber = parseInt(event.target.dataset.level, 10);
        loadLevel(levelNumber);
    });
}

// retry button
document.getElementById("retry-btn").addEventListener("click", function () {
    loadLevel(currentLevel);
});

// return to menu
document.getElementById("to-menu-btn").addEventListener("click", function () {
    showMenu();
});
document.getElementById("menu-btn").addEventListener("click", function () {
    showMenu();
});
document.addEventListener("keydown", function (event) {
    if (game_end === true) return;
    if (gameScreen.classList.contains("hidden")) return;

    var key = event.key;
    var new_direction = null;

    if (key === "ArrowUp") new_direction = { x: 0, y: -1 };
    if (key === "ArrowDown") new_direction = { x: 0, y: 1 };
    if (key === "ArrowLeft") new_direction = { x: -1, y: 0 };
    if (key === "ArrowRight") new_direction = { x: 1, y: 0 };

    if (new_direction === null) return;

    if (direction !== null) {
        if (
            new_direction.x === -direction.x &&
            new_direction.y === -direction.y
        ) {
            return; // fixed the backwards traversal
        }

        // bug : sometimes eat the other key and its not registered , well. its registered if pressed not too fast so . considered it as nothing impactful!
    }

    next_direction = new_direction;
});

showMenu();
