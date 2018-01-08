// Dogjumpright sprite for Nadion template game
// (entities extend 'Phaser.Sprite')
//
// Copyright 2013 Joshua C. Shepard
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.



// This sprite jumps from right to left
(function()
{

	"use strict";

	///////////////////////////////////////////////////////////////////
	// Dogjumpright
	///////////////////////////////////////////////////////////////////
	var Dogjumpright_states = [
		{
		    'name': 'idle',
		    'initial': true,
			'events' :
			{
			    'jumpleft' : 'jumpingleft',
                'jumpright': 'jumpingright'
			}
		},
		{
		    'name': 'jumpingleft',		    
			'events' :
			{
				'stop' : 'idle'
			}
		},
        {
            'name': 'jumpingright',
            'events':
			{
			    'stop': 'idle'
			}
        }
	];


	MyGame.Dogjumpright = function( game, name, x, y, width, height, props )
	{
		Nadion.BaseSprite.call( this, game, 'dog', name, x, y, width, height, props );
		//game.physics.enable(this, Phaser.Physics.ARCADE);
		// fields
		this.fsm = new Nadion.StateMachine(Dogjumpright_states, this);
	    // props = tiled property. Checks tiled file for jump-velocity property, if it is null, set it to 600
	    // this.jump_velocity_y = +(props['jump-velocity'] || 600);         
		this.jump_velocity_x = 150;
		this.jump_velocity_y = 500;
		this.time = this.game.time;
		this.idle_time = this.time.now;	    
		this.idle_period = 500; // wait half a second (500 ms)
		this.initial_last_frame = 0;
		this.lastFrame = this.initial_last_frame; // initialize variable to 0 so the Dogjumpright jumps right first

		// sprite fields
		this.body.bounce.y = 0.0;
		this.body.collideWorldBounds = true;
		this.body.gravity.y = 1000;
		this.body.maxVelocity.y = 1000;

	};
	MyGame.Dogjumpright.prototype = Object.create( Nadion.BaseSprite );
	Nadion.__extends( MyGame.Dogjumpright, Nadion.BaseSprite );
	MyGame.Dogjumpright.prototype.constructor = MyGame.Dogjumpright;

	// prototype (methods)
	MyGame.Dogjumpright.prototype.reset = function()
	{
		this.idle_time = this.time.time;
		this.x = this.initial_x;
		this.y = this.initial_y;
		this.body.velocity.x = 0;
		this.body.velocity.y = 0;
		this.lastFrame = this.initial_last_frame; // face the dog in the correct direction
		this.frame = 1;
		//this.fsm.reset(); // don't think we need this here
	};

	// state machine event handlers:
	MyGame.Dogjumpright.prototype.idle = function()
	{
        // If the dog jumped left, face left
	    if (this.lastFrame == 0) {
	        this.frame = 1;
	    }
        // If the dog jumped right, face right
	    else
	        this.frame = 2;

		// reset idle timer
		this.idle_time = this.time.time;
	};
	MyGame.Dogjumpright.prototype.jumpingleft = function()
	{
	    this.frame = 0;
	    this.lastFrame = 0;
		this.body.velocity.y = -this.jump_velocity_y;		
		this.body.blocked.down = false;
		this.body.touching.down = false;
		
	};
	MyGame.Dogjumpright.prototype.jumpingright = function () {
	    this.frame = 3;
	    this.lastFrame = 3;
	    this.body.velocity.y = -this.jump_velocity_y;	    
	    this.body.blocked.down = false;
	    this.body.touching.down = false;
	};

	MyGame.Dogjumpright.prototype.updateObject = function()
	{
		// collide with the tilemap layer
		var game_state = this.game.state.states[this.game.state.current];
		this.game.physics.arcade.collide( this, game_state.main_layer );

		// reset horizontal velocity
		this.body.velocity.x = 0;
		//console.log(game_state.groups[1].children[0].x);
		//this.game.physics.arcade.moveToXY(this, game_state.groups[1].children[0].x, game_state.groups[1].children[0].y , 60);

		var state = this.fsm.getState();
		switch( state )
		{
		    case 'jumpingleft':
		        this.body.velocity.x = -this.jump_velocity_x;			
		    // if the Dogjumpright has touched the ground or has stopped falling
			    if( this.body.touching.down || this.body.blocked.down )
				    this.fsm.consumeEvent( 'stop' );
			break;
		    case 'jumpingright':
		        this.body.velocity.x = this.jump_velocity_x;		    
                // if the Dogjumpright has touched the ground or has stopped falling
		    if (this.body.touching.down || this.body.blocked.down)
		        this.fsm.consumeEvent('stop');
		    break;

		case 'idle':
			// If the it has been idling for the set time, jump
		    if (this.time.elapsedSince(this.idle_time) > this.idle_period) {
                // if the bird jumped left last time
		        if (this.lastFrame == 0)
		            this.fsm.consumeEvent('jumpright');
                    
		        else
		            this.fsm.consumeEvent('jumpleft');                                        
			}
		    // currently no default case
            // default:
		}
	};
})();
