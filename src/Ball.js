export class Ball {
    constructor(canvas){
        this.position =     {x : 0, y : 0, z : 0  }; // x, y, z 
        this.facing = 1;
        this.acceleration = {x : 0, y : 0, z : 0  }; //x, y, z
        this.speed =        {x : 0, y : 0, z : 0  }; //x, y, z
        this.steering = 0;
        //The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
        //Smaller value results in bigger friction, larger value results in smaller friction
        this.frictionX = 0.8;   
        this.frictionY = 0.8; 
        this.frictionZ = 0.99; 
        
        this.maxAcceleration  = 0.005;


        this.velSterzo = 3.2;         // A
        this.velRitornoSterzo = 0.84; // B, sterzo massimo = A*B / (1-B)
        
        //Dict to track which key is being pressed
        this.keyPressed = { w: false, a: false, s: false, d: false}

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
        
        
        //Steering handling
        if(this.keyPressed.a) this.steering += this.velSterzo;
        if(this.keyPressed.d) this.steering -= this.velSterzo;
        this.steering *= this.velRitornoSterzo; //goingBackToLockedSteering
        
        //Friction handling
        ballSpeed.x *= this.frictionX;
        ballSpeed.y *= this.frictionY;
        ballSpeed.z *= this.frictionZ;
        //MISSING ROTAZIONE MOZZO RUOTE
        
        //Back to speed coordinate world
        this.speed.x = +cosf*ballSpeed.x + sinf*ballSpeed.z;
        this.speed.y = ballSpeed.y;
        this.speed.z = -sinf*ballSpeed.x + cosf*ballSpeed.z;
        
        //Update position as position = position + velocity * delta t (delta t constant)
        this.position.x += this.speed.x;
        this.position.y += this.speed.y;
        this.position.z += this.speed.z;
        //console.log(this.position);
        this.collisionChecker();
    }


    getXPosition(){
        return this.position.x;
    }


    getYPosition(){
        return this.position.y;
    }


    collisionChecker(){
        //TODO: Check not exceeding borders, check not colliding whit other obj position
    }


    static setBallControls(canvas, ball){
        window.addEventListener("keydown", function (event) {
			switch (event.key) {
                case "w":
                    ball.keyPressed.w = true;
                    ball.speed.x += 0.1;
                    //ball.position.x = ball.position.x + 0.1*ball.frictionX;
					break;

                case "s":
                    ball.keyPressed.s = true;
                    ball.speed.x -= 0.1;
                    //ball.position.x = ball.position.x - 0.1*ball.frictionX;
                    break;

                case "a":
                    ball.keyPressed.a = false;
                    ball.speed.y += 0.1;
                    //ball.position.y = ball.position.y + 0.1*ball.frictionY;
                    break;
   
                case "d":
                    ball.keyPressed.d = false;
                    ball.speed.y -= 0.1;
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