export class Refree {

    constructor(x, y, ) {  
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
        
    }

}