//----------------------- Defining the canvas, ctx, width, height and score Variables
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");

width = canvas.width;
height = canvas.height;
score = 0;
speed = 1;
time = 200;
paused = false;
lost = false;

//----------------------- Dividing the Canvas into Blocks
blockSize = 10;
widthInBlocks = width / blockSize;
heightInBlocks = height / blockSize;

//----------------------- Drawing the Border
drawBorder = () => {
    ctx.fillStyle = "#2b3445";
    ctx.fillRect(0, 0, width, blockSize);
    ctx.fillRect(0, height - blockSize, width, blockSize);
    ctx.fillRect(0, 0, blockSize, height);
    ctx.fillRect(width - blockSize, 0, blockSize, height);
};

//----------------------- Displaying the Score
drawScore = () => {
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = "blanchedalmond";
    ctx.font = "20px Comic Sans";
    ctx.fillText("Score: " + score, blockSize, blockSize);
};

//----------------------- Displaying the Speed
drawSpeed = () => {
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillStyle = "blanchedalmond";
    ctx.font = "20px Comic Sans";
    ctx.fillText("Speed: " + speed, width - 90, blockSize);
};

//----------------------- Adding the Start Over container
startOver = () => {
    if (lost === true) {
        $("#buttonsContainer").hide();
        $("#startContainer").show();
        $("#start").css({
            width: "100%",
            height: "100%"
        })
    }
    else if (lost === false) {
        $("#buttonsContainer").show();
        $("#startContainer").hide();
    
    }
}

//----------------------- Ending the Game
gameOver = () => {
    // clearInterval(intervalId);
    clearTimeout(timeOutId);
    lost = true;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "blanchedalmond";
    ctx.font = "60px Comic Sans";
    ctx.fillText("Game Over", width / 2, height / 2);
};

//----------------------- Building the Block Constructor
class Block {
    constructor (col, row) {
        this.col = col;
        this.row = row;
    };

    drawSquare = (color) => {
        var x = this.col * blockSize;
        var y = this.row * blockSize;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, blockSize, blockSize);
    };

    drawCircle = (color) => {
        var x = this.col * blockSize + blockSize / 2;
        var y = this.row * blockSize + blockSize / 2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, blockSize/2, 0, Math.PI * 2, false);
        ctx.fill();
    };

    equal = (otherBlock) => {
        return this.col === otherBlock.col && this.row === otherBlock.row;
    };
};

//----------------------- Building the Snake Constructor
class Snake {
    constructor () {
        this.segments = [
            new Block(7, 5),
            new Block(6, 5),
            new Block(5, 5)
        ];
        this.direction = "right";
        this.nextDirection = "right";
    };

    draw = () => {
        let colorChanged = false;
        this.segments[0].drawSquare("#ff709b");
        for (let i = 1; i < this.segments.length; i++) {
            if (colorChanged) {
                this.segments[i].drawSquare("#ffbdd1");
            }
            if (!colorChanged) {
                this.segments[i].drawSquare("#ffbdd1");
            }
            colorChanged = !colorChanged;
        };
        // this.segments.map((value) => {
        //     value.drawSquare("blue");
        // });
    };

    move = () => {
        var head = this.segments[0];
        var newHead;

        this.direction = this.nextDirection;

        if (this.direction === "right" && paused === false) {
            newHead = new Block(head.col + 1, head.row);
        }
        else if (this.direction === "right" && paused === true) {
            return;
        }

        if (this.direction === "down" && paused === false) {
            newHead = new Block(head.col, head.row + 1);
        }
        else if (this.direction === "down" && paused === true) {
            return;
        }

        if (this.direction === "left" && paused === false) {
            newHead = new Block(head.col - 1, head.row);
        }
        else if (this.direction === "left" && paused === true) {
            return;
        }

        if (this.direction === "up" && paused === false) {
            newHead = new Block(head.col, head.row - 1);
        }
        else if (this.direction === "up" && paused === true) {
            return;
        }
        
        if (this.checkCollision(newHead)) {
            gameOver();
            return;
        }

        this.segments.unshift(newHead);
        
        if (newHead.equal(apple.position)) {
            score++;
            speed++;
            time -= 10;
            apple.move();
        }
        else {
            this.segments.pop();
        }
    };

    checkCollision = (head) => {
        let leftCollision = (head.col === 0);
        let topCollision = (head.row === 0);
        let rightCollision = (head.col === widthInBlocks - 1);
        let bottomCollision = (head.row === heightInBlocks - 1);

        let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision;

        let selfCollision = false;

        for (let i = 0; i < this.segments.length; i++) {
            if (head.equal(this.segments[i])) {
                selfCollision = true;
            }
        };
        return wallCollision || selfCollision;
    };

    setDirection = (newDirection) => {
        if (this.direction === "up" && newDirection === "down") {
            return;
        }
        else if (this.direction === "right" && newDirection === "left") {
            return;
        }
        else if (this.direction === "down" && newDirection === "up") {
            return;
        }
        else if (this.direction === "left" && newDirection === "right") {
            return;
        }
        this.nextDirection = newDirection;
    };
};

//----------------------- Writing the Apple Constructor
class Apple {
    constructor () {
        this.position = new Block(10, 10);
    };

    draw = () => {
        this.position.drawCircle("limegreen");
    };

    move = () => {
        // let i = snake.segments.length;
        // while (i > 0) {
        //     i--;
        //     if (this.position.equal(snake.segments[i])) {
        //         console.log("hey");
        //         let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
        //         let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
        //         this.position = new Block(randomCol, randomRow);
        //     }
        // };
        for (let i = 0; i < snake.segments.length; i++) {    
            while (this.position.equal(snake.segments[i])) {
                let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1;
                let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1;
                this.position = new Block(randomCol, randomRow);
            }
        }
    };
};

//----------------------- Creating the Snake and the Apple objects
var snake = new Snake();
var apple = new Apple();

// //----------------------- Defining the Interval
// intervalId = setInterval(() => {
//     ctx.clearRect(blockSize, blockSize, width-blockSize, height-blockSize);
//     drawScore();
//     snake.move();
//     snake.draw();
//     apple.draw();
//     drawBorder();
// }, 200);

//----------------------- Defining the timeOut (enables speed control)
repeat = () => {
    ctx.clearRect(blockSize, blockSize, width-blockSize, height-blockSize);
    drawScore();
    drawSpeed();
    snake.move();
    snake.draw();
    apple.draw();
    drawBorder();
    startOver();
    if (lost === false) {
        timeOutId = setTimeout(repeat, time);
    }
};
repeat();

//----------------------- Adding the keydown Event Handler
var directions = {
    37: "left",
    38: "up",
    39: "right",
    40: "down"
};

var keys = {
    187: "increase",
    189: "decrease",
    32: "pause"
};


$("html").keydown((event) => {
    var newDirection = directions[event.keyCode];
    var keyCodes = keys[event.keyCode];
    
    if (newDirection !== undefined) {
        snake.setDirection(newDirection);
    }
    
    if (keyCodes === "increase") {
        speed++;
        time -= 10;
    }

    if (keyCodes === "decrease") {
        speed--;
        time += 10;
    }
   
    if (keyCodes === "pause") {
        if (paused === false) {
            paused = true;
        }
        else if (paused === true) {
            paused = false;
        }
    }
});

//----------------------- Adding the on-screen buttons
$("#left").click(() => {
    snake.setDirection("left");
});
$("#right").click(() => {
    snake.setDirection("right");
});
$("#up").click(() => {
    snake.setDirection("up");
});
$("#down").click(() => {
    snake.setDirection("down");
});
$("#speedUp").click(() => {
    speed++;
    time -= 10;
    if (speed === 1) {
        paused = false;
        speed = 1;
        time = 200;
    }
});
$("#speedDown").click(() => {
    speed--;
    time += 10;
    if (speed < 0) {
        paused = true;
        speed = 0;
        time = 200;
    }
});
$("#pause").click(() => {
    if (paused === false && speed > 0) {
        paused = true;
        $("#pause").text("Continue");
    }
    else if (paused === true && speed > 0) {
        paused = false;
        $("#pause").text("Pause");
    }
});
$("#start").click(() => location.reload());