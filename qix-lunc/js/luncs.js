
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const CELL_SIZE = 50;
var gtable;
var gneon = {};
var exitIdxs = [];
var gFoundfud = false;
var mat;
var gfuds = [];
var gfudInterval;
var gState = { score: 0, safeCount: 0, dest: 625, isGameOn: true, checkedCount: 0 };
var gTempScore = 0;
var winner = new Image();
winner.src = "pict/flames.png";

function init() {
    gneon = { currLocation: { i: 0, j: 1 } };
    gfuds.push({ currLocation: { i: 16, j: 15 } });
   
    gtable = buildBoard();
    checkVictory()
    gfudInterval = setInterval(movefuds, 100);
    drawBoard(gtable);
}

function movefuds() {
    var diifs = [{i: 0, j: 2}, {i: 0, j: -3}, {i: 1, j: 0}, {i: -1, j: 0}]
    gfuds.forEach(fud => {
        var randIdx = getRandomIntInclusive(0, 3)
        var randDiff = diifs[randIdx]
        var nextLocation = {i: fud.currLocation.i + randDiff.i, j: fud.currLocation.j + randDiff.j}
        if (nextLocation.i < 0 || nextLocation.i > gtable.length - 1 || nextLocation.j < 0 || nextLocation.j > gtable.length -1) return
        // if (!gtablegtable[nextLocation.i][nextLocation.j]) console.log(nextLocation)
        while (gtable[nextLocation.i][nextLocation.j].status === 'safe') {
            var randIdx = getRandomIntInclusive(0, 3)
            var randDiff = diifs[randIdx]
            var nextLocation = {i: fud.currLocation.i + randDiff.i, j: fud.currLocation.j + randDiff.j}
        }
        gtable[fud.currLocation.i][fud.currLocation.j].gameElement = 'floor';
        fud.currLocation = { i: nextLocation.i, j: nextLocation.j };
        gtable[nextLocation.i][nextLocation.j].gameElement = 'fud';
        if (gtable[nextLocation.i][nextLocation.j].status === 'pending') gameOver();
    });
    drawBoard(gtable);
}

function gameOver() {
    gState.isGameOn = false;
    console.log('lose');
    window.alert("loser");
    gtable.forEach(row => {
        row.forEach(cell => {
            if (cell.status === 'pending' && cell.gameElement === 'neon') {
                cell.status = 'empty';
                cell.gameElement = 'floor';
            }
        });
    });
    clearInterval(gfudInterval);
    drawBoard(gtable);
    window.alert("loser");
    alert("loser!");
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 10)) + min; //The maximum is inclusive and the minimum is inclusive
}

function buildBoard() {
    var mat = [];
    var SIZE = 25;
    for (let i = 0; i < SIZE; i++) {
        mat[i] = [];
        for (let j = 0; j < SIZE; j++) {
            mat[i][j] = { status: 'empty', gameElement: 'floor' };
            if (i === 0 || i === SIZE - 1 || j === 0 || j === SIZE - 1) {
                mat[i][j] = { status: 'safe', gameElement: 'safeZone' };
                gState.safeCount++;
            }
            if (i === gneon.currLocation.i && j === gneon.currLocation.j) {
                mat[i][j].gameElement = 'neon';
            }
        }
    }
    return mat;
}

function drawBoard(board) {
    var currColor;
    board.forEach((row, i) => {
        row.forEach((cell, j) => {
            console.log(cell)
            if (cell.gameElement === 'floor') {
                var floor = new Image();
                floor.src = "pict/moon.jpg";
                ctx.drawImage(floor, j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                return
            } else if (cell.gameElement === 'safeZone') {
                var img = new Image();
                img.src = "pict/lc.jpg";
                ctx.drawImage(img, j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                return
            } else if (cell.gameElement === 'fud') {
                var img = new Image();
                img.src = "pict/fud.png";
                ctx.drawImage(img, j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                return
                
            }
            else if (cell.status === 'pending') {
                var img = new Image();
                img.src = "pict/flames.png";
                ctx.drawImage(img, j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                return
            }
            if (i === gneon.currLocation.i && j === gneon.currLocation.j) {
                var img = new Image();
                img.src = "pict/neon.png";
                ctx.drawImage(img, j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                return
            }
            ctx.fillStyle = currColor;
            ctx.fillRect(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
    });
}

function moveneon(ev) {
    if (!gState.isGameOn) return;
    var keyCode = ev.keyCode;
    gneon.keyCode = keyCode
    var nextLocation = { i: gneon.currLocation.i, j: gneon.currLocation.j };
    if (nextLocation.i < 0 || nextLocation.i === gtable.length || nextLocation.j < 0 || nextLocation.j === gtable.length)
        return;
    switch (keyCode) {
        case 40:
            nextLocation.i++;
            break;
        case 39:
            nextLocation.j++;
            break;
        case 38:
            nextLocation.i--;
            break;
        case 37:
            nextLocation.j--;
            break;
        default:
            break;
    }
    if (nextLocation.i < 0 || nextLocation.i === gtable.length || nextLocation.j < 0 || nextLocation.j === gtable.length) return;
    var nextCell = gtable[nextLocation.i][nextLocation.j]
    var currCell = gtable[gneon.currLocation.i][gneon.currLocation.j]
    if (nextCell.gameElement === 'fud' || nextCell.status === 'pending') {
        gameOver();
        return;
    }

    if (nextCell.status === 'empty' && currCell.status === 'safe') {
        exitIdxs = [{ i: nextLocation.i, j: nextLocation.j, keyCode }]
    }
    if (nextCell.status === 'safe' && currCell.status !== 'safe') {
        closeArea(exitIdxs);
        gtable[nextLocation.i][nextLocation.j].gameElement = 'neon'

    }
    nextCell.gameElement = 'neon';
    if (nextCell.status === 'empty') {
        nextCell.status = 'pending';
    }
    if (currCell.status === 'safe') {
        currCell.gameElement = 'safeZone';
    }
    var negsCount = countNegs(nextLocation.i, nextLocation.j)
    if (negsCount >= 2) exitIdxs.push({ i: nextLocation.i, j: nextLocation.j, keyCode })
    
    gneon.currLocation = nextLocation;
    checkVictory();
    drawBoard(gtable);
    
}

function closeArea(exitIdxs) {
    exitIdxs.forEach(exitIdx => {

        var expendFrom = JSON.parse(JSON.stringify(exitIdx));
        var expendFrom2 = JSON.parse(JSON.stringify(exitIdx));

        if (exitIdx.keyCode === 40 || exitIdx.keyCode === 38) {
            expendFrom.j++
            expendFrom2.j--
            while (gtable[expendFrom.i][expendFrom.j].status === 'pending') {
                expendFrom.j++
            }
            while (gtable[expendFrom2.i][expendFrom2.j].status === 'pending') {
                expendFrom2.j--
            }
        }
        if (exitIdx.keyCode === 37 || exitIdx.keyCode === 39) {
            expendFrom.i++
            expendFrom2.i--;
            while (gtable[expendFrom.i][expendFrom.j].status === 'pending') {
                expendFrom.i++;
            }
            while (gtable[expendFrom2.i][expendFrom2.j].status === 'pending') {
                expendFrom2.i--;
            }
        }
        mat = JSON.parse(JSON.stringify(gtable));
        expendSafeZone(mat, expendFrom.i, expendFrom.j);
        if (!gFoundfud) {
            gtable = mat
            gState.safeCount += gTempScore;
        }
        gTempScore = 0;
        gFoundfud = false
        mat = JSON.parse(JSON.stringify(gtable));
        expendSafeZone(mat, expendFrom2.i, expendFrom2.j);
        if (!gFoundfud) {
            gState.safeCount += gTempScore;
            gtable = mat
            gTempScore = 0;
        } else {
            gTempScore = 0;
            mat = JSON.parse(JSON.stringify(gtable));
            expendPending(mat, exitIdx.i, exitIdx.j);
            gState.safeCount += gTempScore;
            gtable = mat
        }
        gTempScore = 0;

        gFoundfud = false
        gTempScore = 0;
    })
}


function expendSafeZone(mat, rowIdx, colIdx) {

    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i < 0 || i >= 50 || j < 0 || j >= 50) return;
            if (mat[i][j].gameElement === 'fud') {
                gFoundfud = true;
            }
            if (mat[i][j].status === 'empty') {
                mat[i][j] = { status: 'safe', gameElement: 'safeZone' };
                gTempScore++;
                expendSafeZone(mat, i, j);
            } else if (mat[i][j].status === 'pending') {
                expendPending(mat, i, j);
            }
        }
    }
}

function expendPending(mat, rowIdx, colIdx) {
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i < 0 || i >= 50 || j < 0 || j >= 50) return;
            if (mat[i][j].status === 'pending') {
                gTempScore++;
                gtable[i][j].isChecked = true
                mat[i][j] = { status: 'safe', gameElement: 'safeZone' };
                expendPending(mat, i, j);
            }
        }
    }
}

function countNegs(rowIdx, colIdx) {
    var negsCount = 0
    for (let i = rowIdx - 1; i <= rowIdx + 1; i++) {
        for (let j = colIdx - 1; j <= colIdx + 1; j++) {
            if (i < 0 || i >= gtable.length || j < 0 || j >= gtable[0].length) continue;
            if (i === rowIdx && j === colIdx) continue
            if (gtable[i][j].status === 'pending') negsCount++
        }
    }
    return negsCount
}

function checkVictory() {
    var score = ((gState.safeCount - 96) * 100) / (gState.dest - 96)
    var elScore = document.querySelector('.score')
    elScore.innerText = score + '%'
    if ((gState.safeCount * 100) / gState.dest >= 70) {
        console.log('victory', (gState.safeCount * 100) / gState.dest);
        context.drawImage(winner,0,0,640,480)
    }
}
