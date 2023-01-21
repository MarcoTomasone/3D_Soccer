export class Ball {
    
    constructor(canvas, cardsMarkerPositionList, removeObject) {
        this.canvas = canvas;
        this.position =     {x : 0, y : 0, z : 0  }; // x, y, z 
        this.rotation =    {x : 0, y : 0, z : 0  }; // x, y, z
        this.speed =        {x : 0, y : 0, z : 0  }; //x, y, z

        //The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
        //Smaller value results in bigger friction, larger value results in smaller friction
        this.frictionX = 0.70;   
        this.frictionY = 0.70; 
        this.frictionZ = 0.5; //Not important 
        this.maxSpeed = 0.5;
        this.maxAcceleration  = 0.07;
        //Number of cards gathered and list of objects positions
        this.cardsGathered = 0;
        this.cardsMarkerPositionList = cardsMarkerPositionList;

        //Dict to track which key is being pressed
        this.keyPressed = { w: false, a: false, s: false, d: false}
        //Function binded whit the SceneHandler environment to eliminate the object from the scene
        this.removeObject = removeObject;
    }

    //Do a physics step, independent from the rendering. 
    //We can Read but never Write the structure controlled by moveBall()
    moveBall(){
        //Speed in ball space
        var ballSpeed = {x : 0, y : 0, z : 0}; //x, y, z
        //From speed world frame to speed car frame
        var cosf = Math.cos(Math.PI/180.0);
        var sinf = Math.sin(Math.PI/180.0);
        ballSpeed.x = +cosf*this.speed.x - sinf*this.speed.y;
        //ballSpeed.y = this.speed.y;
        ballSpeed.y = +sinf*this.speed.x + cosf*this.speed.y;
        
        if(this.keyPressed.w ) {
            if( ballSpeed.x + this.maxAcceleration <= this.maxSpeed)
                ballSpeed.x += this.maxAcceleration;
            this.rotation.x = 0; //Reset rotation otherwise the ball rotates badly
        }
        if(this.keyPressed.s ){ 
            if( ballSpeed.x - this.maxAcceleration >= -this.maxSpeed)
                ballSpeed.x -= this.maxAcceleration;
            this.rotation.x = 0;
        }
        if(this.keyPressed.a ){
            if( ballSpeed.y + this.maxAcceleration <= this.maxSpeed)
                ballSpeed.y += this.maxAcceleration;
        }
        if(this.keyPressed.d ){
            if( ballSpeed.y - this.maxAcceleration >= -this.maxSpeed)
            ballSpeed.y -= this.maxAcceleration;
        }
        
        //Friction handling
        ballSpeed.x *= this.frictionX;
        ballSpeed.y *= this.frictionY;
        
        //Back to speed coordinate world
        this.speed.x = +cosf*ballSpeed.x + sinf*ballSpeed.y;
        this.speed.y = -sinf*ballSpeed.x + cosf*ballSpeed.y;
        
        
        this.collisionCheckerUpdate(this.speed.x, this.speed.y)
        
        //Rotation handling
        if(this.speed.x != 0)
            this.rotation.y += this.speed.x;
        else 
            this.rotation.y = 0;

        if(this.speed.y != 0)
            this.rotation.x += -this.speed.y ;
        else 
            this.rotation.x = 0;    
    }


    getXPosition(){
        return this.position.x;
    }

    getYPosition(){
        return this.position.y;
    }

    getXRotation(){
        return this.rotation.x;
    }
    getYRotation(){
        return this.rotation.y;
    }
    getZRotation(){
        return this.rotation.z;
    }
    
    async collisionCheckerUpdate(speedX, speedY){
        //Check not exceeding borders
        if(this.position.x + speedX < 19 && this.position.x + speedX > -19.5)
            this.position.x += speedX;
        if(this.position.y + speedY < 9.5 && this.position.y + speedY > -9.5)
            this.position.y += speedY;
        //Cards Gathering
        for(const element of this.cardsMarkerPositionList){
            if (element.name.startsWith("yellowCard") && element.visibility == true &&
                this.position.x <= element.x + 0.5  && 
                    this.position.x >= element.x-0.5  &&
                        this.position.y <= element.y + 0.5 &&
                            this.position.y >= element.y -0.5) {
                this.removeObject(element.name);
                //remove element from cardsMarkerPositionList
                this.cardsMarkerPositionList.indexOf(element);
                this.cardsMarkerPositionList.splice(this.cardsMarkerPositionList.indexOf(element), 1);
                this.cardsGathered += 1;
                console.log(this.cardsGathered)

                //If i gathered all the cards, show all the hidden markers
                if(this.cardsGathered == 3) {
                    console.log(this.cardsGathered)
                    for(const element of this.cardsMarkerPositionList)
                        element.visibility = true;}

            } else if (element.visibility == true && element.name.startsWith("markerCone") &&
                    this.position.x <= element.x + 0.7  && 
                    this.position.x >= element.x -0.7  &&
                    this.position.y <= element.y + 0.7 &&
                    this.position.y >= element.y -0.7){   
                                toStop = true;
                                cone = true;    
                                console.log("cono")     
                                console.log(element);
                                console.log("palla");
                                console.log(this.position);  
                                console.log(this.cardsMarkerPositionList)
                                
            }        
        }
    }


    static setBallControls(canvas, ball){
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            var Joy1 = new JoyStick('joystick-div', {}, function(stickData) {
                switch(stickData.cardinalDirection) {
                    case "S":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.s = true;
                        break;
                    case "N":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.w = true;
                        break;
                    case "E":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.d = true;
                        break;
                    case "W":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.a = true;
                        break;
                    case "NE":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.w = true;
                        ball.keyPressed.d = true;
                        break;
                    case "NW":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.w = true;
                        ball.keyPressed.a = true;
                        break;
                    case "SE":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.s = true;
                        ball.keyPressed.d = true;
                        break;
                    case "SW":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        ball.keyPressed.s = true;
                        ball.keyPressed.a = true;
                        break;
                    case "C":
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        break;
                    default:
                        ball.keyPressed = {w: false, s: false, a: false, d: false};
                        break;
                }
            });  
        }
        else{
            document.getElementById("joystick-div").style.visibility = 'hidden';
            window.addEventListener("keydown", function (event) {
                switch (event.key) {
                    case "w":
                        ball.keyPressed.w = true;
                        break;

                    case "s":
                        ball.keyPressed.s = true;
                        break;

                    case "a":
                        ball.keyPressed.a = true;
                        break;
    
                    case "d":
                        ball.keyPressed.d = true;
                        break; 
                }
            });

            window.addEventListener("keyup", function (event) {
                switch (event.key) {
                    case "w":
                        ball.keyPressed.w = false;
                        break;

                    case "s":
                        ball.keyPressed.s = false;
                        break;

                    case "a":
                        ball.keyPressed.a = false;
                        break;
    
                    case "d":
                        ball.keyPressed.d = false;
                        break; 
                }
            });
        }
    }
}