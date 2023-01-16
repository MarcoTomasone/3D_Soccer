export class Ball {
    constructor(canvas, cardsMarkerPositionList, removeObject) {
        this.canvas = canvas;
        this.position =     {x : 0, y : 0, z : 0  }; // x, y, z 
        this.rotation =    {x : 0, y : 0, z : 0  }; // x, y, z
        this.facing = 1;
        this.acceleration = {x : 0, y : 0, z : 0  }; //x, y, z
        this.speed =        {x : 0, y : 0, z : 0  }; //x, y, z
        this.steering = 0;
        //The friction value is a value in the range [0,1]. The friction controls the percentage of speed preserved 
        //Smaller value results in bigger friction, larger value results in smaller friction
        this.frictionX = 0.70;   
        this.frictionY = 0.70; 
        this.frictionZ = 0.5; 
        this.cardsGathered = 0;
        this.maxAcceleration  = 0.07;
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
        
        if(this.keyPressed.w ) {
            ballSpeed.x += this.maxAcceleration;
            this.rotation.x = 0;
        }
        if(this.keyPressed.s ){ 
            ballSpeed.x -= this.maxAcceleration;
            this.rotation.x = 0;
        }
        if(this.keyPressed.a ){
            ballSpeed.y += this.maxAcceleration;
        }
        if(this.keyPressed.d ){
            ballSpeed.y -= this.maxAcceleration;
        }
        
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
        if(this.position.x + speedX < 19 && this.position.x + speedX > -19.5)
        this.position.x += speedX;
        if(this.position.y + speedY < 9.5 && this.position.y + speedY > -9.5)
        this.position.y += speedY;
        //Cards Gathering
        for(const element of this.cardsMarkerPositionList){
            if (this.position.x+speedX <= element.x + 0.5  && 
                    this.position.x+speedX >= element.x-0.5  &&
                        this.position.y+speedY <= element.y + 0.5 &&
                            this.position.y+speedY >= element.y -0.5 && 
                                element.visibility == true && 
                                    element.name.startsWith("yellowCard")) {
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
                            element.name == "markerCone"){   
                                const textcanvas = document.getElementById("upperCanvas");
                                const ctx = textcanvas.getContext("2d");
                                const game_over = new Image();
                                game_over.src = "../resources/gameOver.png";
                                game_over.addEventListener('load', function() {});
                                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                                ctx.drawImage(game_over, 0, 0, textcanvas.clientWidth, textcanvas.clientHeight);     
                                ctx.font = '40pt Verdana Pro Black'; //TODO: change font
                                ctx.fillStyle = 'white';
                                ctx.fillText("You have to improve yor dribbling!", 300,50);
                                ctx.font = '30pt Verdana Pro Black';
                                ctx.fillText("Click to play again", 480,100);
                                toStop = true;
                                textcanvas.addEventListener('click', function() {
                                    location.reload();
                                });
                                
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