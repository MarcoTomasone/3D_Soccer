export class Refree {
    //Takes as input the position of the ball
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

    //Move the refree towards the ball
    async moveRefree(xBall, yBall, visibility){
        if(visibility){
            this.x =  xBall - this.x > 0 ? this.x + 0.04 : this.x - 0.04;
            this.y =  yBall - this.y > 0 ? this.y + 0.03 : this.y - 0.03;
            
            //If the refree touches the ball, the game is over
            if(this.x <= xBall + 1 && this.x >= xBall - 1 && this.y <= yBall + 1 && this.y >= yBall - 1)
                toStop = true;  
        }
    }

}