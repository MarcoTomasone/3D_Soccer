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

    moveRefree(xBall, yBall){
        this.x =  xBall - this.x > 0 ? this.x + 0.04 : this.x - 0.04;
        this.y =  yBall - this.y > 0 ? this.y + 0.03 : this.y - 0.03;
        
        if(this.x <= xBall + 1 &&
            this.x >= xBall - 1 &&
            this.y <= yBall + 1 &&
            this.y >= yBall - 1){

            const textcanvas = document.getElementById("upperCanvas");
            const ctx = textcanvas.getContext("2d");
            const game_over = new Image();
            game_over.src = "../resources/gameOver.png";
            game_over.addEventListener('load', function() {});
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.drawImage(game_over, 0, 0, textcanvas.clientWidth, textcanvas.clientHeight);
            ctx.font = '40pt Verdana Pro Black'; //TODO: change font
            ctx.fillStyle = 'white';
            ctx.fillText("The Refree sent you under the shower!", 300,50);
            ctx.font = '30pt Verdana Pro Black';
            ctx.fillText("Click to play again", 480,100);
            //Reload game on click
            toStop = true;  
            textcanvas.addEventListener('click', function() {
                location.reload();
            });
        }
    }

}