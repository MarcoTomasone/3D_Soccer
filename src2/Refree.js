export class Refree {

    constructor(x, y) {  
        this.x = x - 8;
        this.y = y;
    }

    getXPosition(){
        return this.x;
    }

    getYPosition(){
        return this.y;
    }

    async moveRefree(xBall, yBall, visibility){
        if(visibility){
            this.x =  xBall - this.x > 0 ? this.x + 0.04 : this.x - 0.04;
            this.y =  yBall - this.y > 0 ? this.y + 0.03 : this.y - 0.03;
            
            if(this.x <= xBall + 1 &&
                this.x >= xBall - 1 &&
                this.y <= yBall + 1 &&
                this.y >= yBall - 1){

                const upperCanvas = document.getElementById("upperCanvas");
                const ctx = upperCanvas.getContext("2d");
                const screenCanvas = document.getElementById("screenCanvas");
                ctx.canvas.width = screenCanvas.clientWidth;
                ctx.canvas.height = screenCanvas.clientHeight;
                ctx.canvas.style.margin = 0 + "px";
                ctx.canvas.style.borderRadius = 0 + "px";
                const game_over = new Image();
                game_over.src = "./resources/gameOver.png";
                await game_over.decode();
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx.drawImage(game_over, 0, 0, upperCanvas.clientWidth, upperCanvas.clientHeight);
                ctx.font = '60pt VT323, sans-serif'; 
                ctx.fillStyle = 'white';
                ctx.fillText("The Refree sent you under the shower!", 75,50);
                ctx.font = '40pt VT323, sans-serif';
                ctx.fillText("Click to play again", 430,100);
                //Reload game on click
                upperCanvas.addEventListener('click', function() {
                    location.reload();
                });
                toStop = true;  
            }
        }
    }

}