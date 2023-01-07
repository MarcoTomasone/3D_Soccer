export class Ball {
    constructor(canvas, cardsMarkerPositionList, removeObject) {
        this.position =     {x : 0, y : 0, z : 0  }; // x, y, z 
        this.rotation =    {x : 0, y : 0, z : 0  }; // x, y, z
        this.facing = 1;
        this.acceleration = {x : 0, y : 0, z : 0  }; //x, y, z
        this.speed =        {x : 0, y : 0, z : 0  }; //x, y, z
        this.steering = 0;
        //The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
        //Smaller value results in bigger friction, larger value results in smaller friction
        this.frictionX = 0.75;   
        this.frictionY = 0.75; 
        this.frictionZ = 0.5; 
        this.cardsGathered = 0;
        this.maxAcceleration  = 0.5;
        this.cardsMarkerPositionList = cardsMarkerPositionList;

        //Dict to track which key is being pressed
        this.keyPressed = { w: false, a: false, s: false, d: false}
        
        this.removeObject = removeObject;
    }

    //Do a physics step, independent from the rendering. 
    //We can Read but never Write the structure controlled by moveBall()
    moveBall(){
        
        //Speed in ball space
        var ballSpeed = {x : 0, y : 0, z : 0}; //x, y, z
        //From speed world frame to speed car frame
        var cosf = Math.cos(this.facing*Math.PI/180.0);
        var sinf = Math.sin(this.facing*Math.PI/180.0);
        ballSpeed.x = +cosf*this.speed.x - sinf*this.speed.z;
        ballSpeed.y = this.speed.y;
        ballSpeed.z = +sinf*this.speed.x + cosf*this.speed.z;
        
        
        //Friction handling
        ballSpeed.x *= this.frictionX;
        ballSpeed.y *= this.frictionY;
        ballSpeed.z *= this.frictionZ;
        
        //Back to speed coordinate world
        this.speed.x = +cosf*ballSpeed.x + sinf*ballSpeed.z;
        this.speed.y = ballSpeed.y;
        this.speed.z = -sinf*ballSpeed.x + cosf*ballSpeed.z;
        
        
        this.collisionCheckerUpdate(this.speed.x, this.speed.y)
        
        if(this.speed.x != 0)
            this.rotation.y += this.speed.x ;
        else 
            this.rotation.y = 0;
        if(this.speed.y != 0)
            this.rotation.x += -this.speed.y ;
        else 
            this.rotation.x = 0;    
        
        
        //console.log(this.position);
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
    
    collisionCheckerUpdate(speedX, speedY){
        //Check not exceeding borders
        if(this.position.x + speedX < 19.5 && this.position.x + speedX > -19.5)
        this.position.x += speedX;
        if(this.position.y + speedY < 9.5 && this.position.y + speedY > -9.5)
        this.position.y += speedY;
        //Cards Gathering
        for(const element of this.cardsMarkerPositionList){
            console.log(element);
            if (this.position.x+speedX <= element.x + 0.5  && 
                this.position.x+speedX >= element.x-0.5  &&
                    this.position.y+speedY <= element.y + 0.5 &&
                        this.position.y+speedY >= element.y -0.5 && 
                            element.visibility == true && 
                                element.name.startsWith("yellowCard"))    
                    {
                console.log("yellowCard");
                this.removeObject(element.name);
                this.cardsGathered++;
                if(this.cardsGathered == 3)
                    for(const element of this.cardsMarkerPositionList){
                        element.visibility = true;
                    }
            }
            
            if (this.position.x+speedX <= element.x + 0.7  && 
                    this.position.x+speedX >= element.x-0.7  &&
                        this.position.y+speedY <= element.y + 0.7 &&
                            this.position.y+speedY >= element.y -0.7 && 
                            element.visibility == true && 
                            element.name == "markerCone")    
                        {
                    alert("Devi migliorare il dribbling!");
                    
                }        
        }
    }


    static setBallControls(canvas, ball){
        window.addEventListener("keydown", function (event) {
			switch (event.key) {
                case "w":
                    ball.keyPressed.w = true;
                    ball.speed.x += 0.15;
                    ball.speed.y = 0;
                    //ball.position.x = ball.position.x + 0.1*ball.frictionX;
					break;

                case "s":
                    ball.keyPressed.s = true;
                    ball.speed.x -= 0.15;
                    ball.speed.y = 0;
                    //ball.position.x = ball.position.x - 0.1*ball.frictionX;
                    break;

                case "a":
                    ball.keyPressed.a = false;
                    ball.speed.y += 0.15;
                    ball.speed.x = 0;
                    //ball.position.y = ball.position.y + 0.1*ball.frictionY;
                    break;
   
                case "d":
                    ball.keyPressed.d = false;
                    ball.speed.y -= 0.15;
                        ball.speed.x = 0;
                    //ball.position.y = ball.position.y - 0.1*ball.frictionY;
                    break; 
			}
		});

        window.addEventListener("keyup", function (event) {
			switch (event.key) {
                case "w":
                    ball.keyPressed.w = false;
                    //ball.position.x = ball.position.x + 0.1*ball.frictionX;
					break;

                case "s":
                    ball.keyPressed.s = false;
                    //ball.position.x = ball.position.x - 0.1*ball.frictionX;
                    break;

                case "a":
                    ball.keyPressed.a = false;
                    //ball.position.y = ball.position.y + 0.1*ball.frictionY;
                    break;
   
                case "d":
                    ball.keyPressed.d = false;
                    //ball.position.y = ball.position.y - 0.1*ball.frictionY;
                    break; 
			}
		});

    }
}