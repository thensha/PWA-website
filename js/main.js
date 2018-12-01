// 获取canvas绘图界面
// 此文件中所有canvas被命名为canvas1，防止与background.js中的命名冲突

const canvas1 = document.getElementById('canvas');
const ctx1 = canvas1.getContext('2d');
// 引入图片，设置监听事件：当图片载入完成时打乱顺序
const img = new Image();
img.src = './img/img.jpg';
img.addEventListener('load', drawItems, false);
// 获取画布宽度
const boardWidth = document.getElementById('canvas').width;
// 获取难度值
var levelValue = document.getElementById('level').value;
// 计算单块拼图的大小
var itemSize = boardWidth / levelValue;
// 设置
const clickItem = new Object();
clickItem.x = 0;
clickItem.y = 0;
const emptyItem = new Object();
emptyItem.x = 0;
emptyItem.y = 0;
// 是否完成拼图
var finished = false;


// 实现随机排列块
var boardParts = new Object();
initBoard();
function initBoard() {
    totalItems = levelValue * levelValue;
    boardParts = new Array(totalItems);
    for (let i = 0; i < totalItems; i++) {
        boardParts[i] = i;
    }
    disorder(); //随机排序
}

function sortNumber(a, b) {
    return Math.random() > 0.5 ? -1 : 1
}

function disorder() {
    boardParts.sort(sortNumber);
    emptyItem.x = 0;
    emptyItem.y = 0;
    finished = false;
}


//绘制块
function drawItems() {
    ctx1.clearRect(0, 0, boardWidth, boardWidth);
    for (let i = 0; i < levelValue; i++) {
        for (let j = 0; j < levelValue; j++) {
            let n = boardParts[i * levelValue + j];
            // 计算出编号n的块在原图的位置坐标（行列号）
            let x = parseInt(n / levelValue); //取整
            let y = n % levelValue;
            // console.log(x + ':' + Math.floor(n / levelValue) + ':' + y);
            if (!(i == emptyItem.x && j == emptyItem.y && finished == false)) { //不是空白拼图的位置且游戏未结束
                ctx1.drawImage(img, x * itemSize, y * itemSize, itemSize, itemSize, i * itemSize, j * itemSize, itemSize, itemSize);
            }
        }
    }
}


//事件定义

// 调整难度
const level = document.getElementById('level');
level.onchange = function () {
    levelValue = this.value;
    itemSize = boardWidth / levelValue; //重新计算块宽度
    initBoard();
    drawItems();
}
//鼠标点击事件
canvas1.onmousemove = function (e) {
    clickItem.x = Math.floor((e.pageX - this.offsetLeft) / itemSize);
    clickItem.y = Math.floor((e.pageY - this.offsetTop) / itemSize);
}
canvas1.onclick = function () {
    if (computeDistance(clickItem.x, clickItem.y, emptyItem.x, emptyItem.y) == 1) {
        exchangeItem(emptyItem, clickItem);
        drawItems();
    }
    if (finished) {
        setTimeout(() => {
            alert('Great!', 100)
        });
    }
}

function computeDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}


// 移动事件
function exchangeItem(emptyItem, clickItem) {
    if (!finished) {
        // 交换两个图片
        let a;
        a=boardParts[emptyItem.x*levelValue+emptyItem.y];
        boardParts[emptyItem.x * levelValue + emptyItem.y] = boardParts[clickItem.x * levelValue + clickItem.y];
        boardParts[clickItem.x * levelValue + clickItem.y]=a;
        emptyItem.x = clickItem.x;
        emptyItem.y = clickItem.y;
        checkFinished();
    }
}

function checkFinished(){
    let flag=true;
    for(let i=0;i<levelValue*levelValue;i++){
        if(boardParts[i]!=i){
            flag=false;
        }
    }
    finished=flag;
}