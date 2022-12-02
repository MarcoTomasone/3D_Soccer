export class Ball {
    constructor(canvas){
        this.position =     {x : 0, y : 0, z : 0  };  // x, y, z 
        this.acceleration = {x : 0, y : 0, z : 0  }; //x, y, z
        this.speed =        {x : 0, y : 0, z : 0  }; //x, y, z

        //The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
        //Smaller value results in bigger friction, larger value results in smaller friction
        this.frictionX = 0.8;   
        this.frictionY = 1.0; 
        this.frictionZ = 0.99; 
        
        this.maxAcceleration  = 0.005;


        this.velSterzo = 3.2;         // A
        this.velRitornoSterzo = 0.84; // B, sterzo massimo = A*B / (1-B)
        console.log(this.frictionX)

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
                    ball.position.x = ball.position.x + 0.1*ball.frictionX;
					break;

                case "s":
                    ball.position.x = ball.position.x - 0.1*ball.frictionX;
                    break;

                case "a":
                    ball.position.y = ball.position.y + 0.1*ball.frictionY;
                    break;
   
                case "d":
                    ball.position.y = ball.position.y - 0.1*ball.frictionY;
                    break; 
			}
		});


    }
}