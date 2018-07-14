var game;

var PlayerState = {"ready":0,"end":1, "die":2, "idle":3, "boost":4};
var FriendsCharacter = {"none":0, "friends1":1, "friends2":2, "friends3":3, "friends4":4, "friends5":5, "friends6":6};
var ItemType = {"star":1, "fuel":2, "boost":3};

var MAXSTAGE = 4;
var backGradientColor = [[0x000912,0xf6c0b3,0xab6c93],[0x000912,0x9b4990,0x1e1e41],[0x000607,0xc3607e,0x331a33],
							[0x030514,0xd8c0e1,0xb298d4],[0x030514,0xae914e,0x886420]];
var obstacleArray = [['',''],['asteroid-small','asteroid-big'],['space-part1','space-part2'],['space-part1','space-part2'],
						['space-part1','space-part2']];

var backImageGroup;
var frontImageGroup;
var stageCount = 0;
var bgAudio;
var rocket;
var _speed;
var rocket_dir = 0;
var vertical_speed=1;
var last = 0;
var cursors;
var stars;
var score;
var scoreText;

var manager = null;
var left_emitter = null;
var right_emitter = null;

var starSound = [];
var boostSound = [];
var kickSound;
var items = {};

window.onload = function(){
	game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'gameDiv');
	game.state.add("Play", play, true);//play 수행
}

var play = function(){}
play.prototype = {
	preload:function(){
		//TODO: 로딩페이지를 만든다.
		//TODO: 리소스 압 할 것.
		console.log(window.innerWidth + ' and ' + window.innerHeight);
		game.load.image('backgroundTwinkle', "assets/background-twinkle.png");

		game.load.image('friends_card_1', "assets/friends/ryan.png");
		game.load.image('friends_card_2', "assets/friends/muzi.png");
		game.load.image('friends_card_3', "assets/friends/apeach.png");
		game.load.image('friends_card_4', "assets/friends/green-con.png");
		game.load.image('friends_card_5', "assets/friends/neo&frodo.png");
		game.load.image('friends_card_6', "assets/friends/ryan.png");

		game.load.image('player-ryan', "assets/friends/ryan.png");
		game.load.image('player-muzi', "assets/friends/muzi.png");
		game.load.image('player-apeach', "assets/friends/apeach.png");
		game.load.image('player-con', "assets/friends/green-con.png");
		game.load.image('player-neo&frodo', "assets/friends/neo&frodo.png");
		game.load.image('player-ryan', "assets/friends/ryan.png");

		game.load.image('player', "assets/friends/ryan.png");
		game.load.image('star', "assets/items/star.png");
		game.load.image('fuel_item',"assets/items/fuel.png");
		game.load.image('fuelgauge',"assets/fuelgauge.png");
		game.load.image('fire_emit', "assets/particles/fire_emit.png");
		game.load.image('boost_item',"assets/items/boost.png");
		game.load.image('button',"assets/button.png");

		game.load.image('asteroid-small',"assets/obstacle/asteroid-small.png");
		game.load.image('asteroid-big',"assets/obstacle/asteroid-big.png");
		game.load.image('space-part1',"assets/obstacle/space-part1.png");
		game.load.image('space-part2',"assets/obstacle/space-part2.png");

		game.load.audio('backgroundMusic', "assets/audio/SoundEffects/era-of-space.mp3");
		game.load.audio('star1', "assets/audio/SoundEffects/star_1.mp3");//'assets/audio/SoundEffects/starSound.ogg'
		game.load.audio('star2', "assets/audio/SoundEffects/star_2.mp3");
		game.load.audio('star3', "assets/audio/SoundEffects/star_3.mp3");
		game.load.audio('boost', "assets/audio/SoundEffects/fire-spray.mp3");
		game.load.audio('boost_constant', "assets/audio/SoundEffects/fire-spray-constant.mp3");
		game.load.audio('kick', "assets/audio/SoundEffects/deep-kick.mp3");

		this.calculate();//화면 사이즈기반하여 단위 계산
	},
	create:function(){
		game.time.advancedTiming = true;
   	 	game.time.desiredFps = 60;
		game.physics.startSystem(Phaser.Physics.ARCADE);
		game.stage.backgroundColor = '#000912';
		backImageGroup = game.add.group();
		bgAudio = game.add.audio('backgroundMusic');
		PlayerState = "ready";
		FriendsCharacter = "none";
		this.h_ = 0;
		stageCount = 0;
		this.bgTime = 0;
		this.makeBackGradient();
		this.backgroundTwinkles = [];
		this.starObjs = [];
		this.itemObjs = [];
		this.obstacleObjs = [];
		score = 0;
		
		this.maxH_ = 0;
		this.extraScore = 0;
		this.fuel = 100;
		this.maxfuel = 100;
		this.twinkleTime = 0;
		this.chargeTime = 0;
		this.scoreTime = 0;
		this.starN = 0;
		this.isStar = [0,0,0,0,0,0,0,0,0];

		this.starTime = 0;
		this.fuelItemTime = 2;
		this.boostItemTime = 4;
		this.obstacleTime = 0;
		this.scoreDelay = true;

		this.playButton;
		this.showReadyUI();

		this.playerCollision = false;
		
		starSound[0] = game.add.audio('star1');
		starSound[1] = game.add.audio('star2');
		starSound[2] = game.add.audio('star3');
		boostSound[0] = game.add.audio('boost');
		boostSound[1] = game.add.audio('boost_constant');
		kickSound = game.add.audio('kick');

		this.makeTwinkle();
	},
	startGame:function(){
		if(FriendsCharacter != "none"){
			this.selectPanel.width = 0;
			this.bottomtxt.width = 0;
			this.playButton.width = 0;
			this.cardGroup.width = 0;

			backgroundTwinkles = game.add.group();
			backgroundTwinkles.createMultiple(10, 'backgroundTwinkle');

			PlayerState = "idle";
			this.fuelImage = game.add.sprite(this.xGap, this.yGap*2,"fuelgauge");
			this.fuelImage.width = this.hpWidthMax;
			this.fuelImage.height = window.innerHeight * 0.02;
			this.fuelImage.anchor.set(0,0);
			this.fuelLogo = game.add.sprite(this.hpWidthMax, this.yGap*2, "fuel_item");
			this.fuelLogo.width = this.xGap*2;
			this.fuelLogo.height = this.xGap*2;
			this.fuelLogo.anchor.set(0,0.5);

			this.makeBackGradient();
			this.loadCharacter();

			game.physics.enable(this.rocket, Phaser.Physics.ARCADE);
			this.rocket.body.collideWorldBounds=false;
			this.rocket.body.gravity.y = window.innerHeight/11;
			this.rocket.body.bounce.set(0,0);
			this.rocket.body.drag.x = 10;
			this.rocket.body.drag.y = 30;
			this.rocket.body.mass = 10;
			
			left_emitter = game.add.emitter(0, 0 , 700);//x,y maxParticle
			left_emitter.makeParticles('fire_emit');
			left_emitter.setAlpha(1, .5, 300);
			left_emitter.setScale(window.innerWidth/2300, window.innerWidth/400, window.innerWidth/2300, window.innerWidth/400, 1000, Phaser.Easing.Quintic.Out);
			left_emitter.start(false, 400, 5);//explode, lifespan, frequency, quantity, forceQuantity

			right_emitter = game.add.emitter(0, 0 , 500);//x,y maxParticle
				right_emitter.makeParticles('fire_emit');
			right_emitter.setAlpha(1, .5, 300);
			right_emitter.setScale(window.innerWidth/2300, window.innerWidth/400, window.innerWidth/2300, window.innerWidth/400, 1000, Phaser.Easing.Quintic.Out);
			right_emitter.start(false, 400, 5);//explode, lifespan, frequency, quantity, forceQuantity

			stars = game.add.group();//display objects including Sprites and Images.
			stars.enableBody = true;
			stars.physicsBodyType = Phaser.Physics.ARCADE; // detect collision
			
			stars.setAll('outOfBoundsKill', true);
			stars.setAll('checkWorldBounds', true);

			this.items = game.add.group();
			this.items.enableBody = true;
			this.items.physicsBodyType = Phaser.Physics.ARCADE;
			this.items.createMultiple(30,'fuel_item');//
			this.items.setAll('outOfBoundsKill', true);
			this.items.setAll('checkWorldBounds', true);

			this.obstacles = game.add.group();
			this.obstacles.enableBody = true;
			this.obstacles.physicsBodyType = Phaser.Physics.ARCADE;
			this.obstacles.createMultiple(30,'asteroid-small');//
			this.obstacles.setAll('outOfBoundsKill', true);
			this.obstacles.setAll('checkWorldBounds', true);
			
			scoreText = game.add.text(game.world.centerX, this.yGap, 'Score: ',{font:  this.yGap+'px Arial', fill : '#fff'});
			scoreText.anchor.set(0.5);
			game.input.onDown.add(this.push, this);
		}
	},

	update:function(){
		if(PlayerState == "die"){
			this.gameOver(this.rocket);
		}
		else if(PlayerState == "end"){
			//console.log("END");
		}
		else if(PlayerState == "ready"){
		}
		else{
			if(this.rocket){

				if(this.rocket.y > window.innerHeight){
					PlayerState = "die"
				}
				//player can't come more than center
 				else if(this.rocket.y <= game.world.centerY){
					this.rocket.y = game.world.centerY;
					if(this.rocket.body.velocity.y > 0){
						this.rocket.y = game.world.centerY - game.world.centerY/10000;
					}
				}
				//collision check
				game.physics.arcade.overlap(this.rocket, stars, this.itemHandler, null, this);
				game.physics.arcade.overlap(this.rocket, this.items, this.itemHandler, null, this);
				game.physics.arcade.collide(this.rocket, this.obstacleObjs, this.collisionHandler, null, this);
			}

			/*
			* calculate score
			* 10m : 1score
			* 1star : 2score
			*/
			this.h_ -= this.rocket.body.velocity.y * 0.001;
			if(this.maxH_ < this.h_){
				this.maxH_ = parseInt(this.h_);
			}
			score = this.maxH_ + this.extraScore;

			if(this.rocket.x > window.innerWidth){
				this.rocket.x = 1;
			}
			if(this.rocket.x < 0){
				this.rocket.x = window.innerWidth - 1;
			}
			this.makeBackGradient();
			this.placeStar();
			this.placeItem();
			this.boostCheck();
			//this.charging();
			//obstacle: 120~150
			if( (this.h_%150) >= 120) this.placeObstacle();

			this.fuelImage.width = (this.fuel / this.maxfuel) * this.hpWidthMax;
			scoreText.anchor.setTo(0.5,0.2);
			scoreText.text = '' + score;

			this.rotSin = Math.sin(this.rocket.rotation);
			this.rotCos = Math.cos(this.rocket.rotation);
			var ranSeed = Math.floor(Math.random() * 200) - 100;//0~11

			left_emitter.emitX = this.rocket.x - (this.rocket.height/2 * 0.52);
			left_emitter.emitY = this.rocket.y + (this.rocket.height/2 * 0.85);

			left_emitter.setXSpeed(-(window.innerWidth/4) * 0.52 + ranSeed, -(window.innerWidth) * 0.52);
			left_emitter.setYSpeed((window.innerHeight/4) * 0.85, (window.innerHeight) * 0.85);

			right_emitter.emitX = this.rocket.x - (this.rocket.height/2 * -0.52);
			right_emitter.emitY = this.rocket.y + (this.rocket.height/2 * 0.85);
			
			right_emitter.setXSpeed(-(window.innerWidth/4) * -0.52 + ranSeed, -(window.innerWidth) * -0.52);
			right_emitter.setYSpeed((window.innerHeight/4) * 0.85, (window.innerHeight) * 0.85);
			vertical_speed = 0.1 - this.rocket.body.velocity.y/200;

			if(stars){
				for(var i=0; i < this.starObjs.length; i++){
					this.starObjs[i].body.velocity.y = (1.5 * window.innerHeight * vertical_speed);//all star items set velocity 20~300
				}
			}
			if(this.itemObjs){
				for(var i=0; i < this.itemObjs.length; i++){
					this.itemObjs[i].body.velocity.y = (1.5 * window.innerHeight * vertical_speed);
				}
			}
			if(this.obstacleObjs){
				for(var i=0; i < this.obstacleObjs.length; i++){
					this.obstacleObjs[i].body.velocity.y = (1.5 * window.innerHeight * vertical_speed);
				}
			}
		}
		this.updateTwinkle();
	},

	render:function(){
		//game.debug.soundInfo(bgAudio, 20, 32);
	},

	calculate:function(){
		this.squareSize = (this.game.width * 0.176);
		this.xGap = (this.game.width * 0.0588);
		this.yGap = (this.game.height - 4*this.squareSize) * 0.111;
		this.hpWidthMax = window.innerWidth * 0.8;
	},

	bgmPlay:function(){
		if(bgAudio.isPlaying){
			bgAudio.stop();
		}
		bgAudio.play();
		bgAudio.volume = 0.15;
	},
	loadCharacter:function(){
		/*
		* set Maxfuel
		* set rocketPower
		* set velocity
		* set angularVelocity
		*/
		switch(FriendsCharacter){
			case 'friends1':
			game.load.image('player', "assets/friends/ryan.png");
			this.rocket = game.add.sprite(game.world.centerX, game.world.centerY, 'player-ryan');
			this.rocket.width = window.innerWidth / 8;
			this.rocket.height = window.innerWidth / 5;
			this.rocket.anchor.set(0.5);
			_speed = 1;
			break;
			case 'friends2':
			this.rocket = game.add.sprite(game.world.centerX, game.world.centerY, 'player-muzi');
			this.rocket.width = window.innerWidth / 9;
			this.rocket.height = window.innerWidth / 6;
			this.rocket.anchor.set(0.5);
			_speed = 1;
			break;
			case 'friends3':
			this.rocket = game.add.sprite(game.world.centerX, game.world.centerY, 'player-apeach');
			this.rocket.width = window.innerWidth / 10;
			this.rocket.height = window.innerWidth / 7;
			this.rocket.anchor.set(0.5);
			_speed = 1.05;
			break;
			case 'friends4':
			this.rocket = game.add.sprite(game.world.centerX, game.world.centerY, 'player-con');
			this.rocket.width = window.innerWidth / 15;
			this.rocket.height = window.innerWidth / 11;
			this.rocket.anchor.set(0.5);
			_speed = 1.1;
			break;
			case 'friends5':
			this.rocket = game.add.sprite(game.world.centerX, game.world.centerY, 'player-neo&frodo');
			this.rocket.width = window.innerWidth / 4;
			this.rocket.height = window.innerWidth / 6;
			this.rocket.anchor.set(0.5);
			_speed = 0.9;
			break;
			case 'friends6':
			this.rocket = game.add.sprite(game.world.centerX, game.world.centerY, 'player-ryan');
			this.rocket.width = window.innerWidth / 8;
			this.rocket.height = window.innerWidth / 6;
			this.rocket.anchor.set(0.5);
			break;
		}
	},

	makeBackGradient:function(){
		if(this.h_ >= this.bgTime){
			this.backGradient = game.add.bitmapData(window.innerWidth, window.innerHeight);
			this.backGradient_y = 0;
			this.backGradient_y_delta = window.innerHeight/200;
			for (var i = 0; i < 170; i++)
	    	{
	        	var c = Phaser.Color.interpolateColor(backGradientColor[stageCount][0], backGradientColor[stageCount][1], 170, i);
	        	this.backGradient.rect(0, this.backGradient_y, window.innerWidth, this.backGradient_y + this.backGradient_y_delta, Phaser.Color.getWebRGB(c));
	        	this.backGradient_y += this.backGradient_y_delta;
	    	}
	    	for(var i = 0; i < 30; i++){
	    		var c = Phaser.Color.interpolateColor(backGradientColor[stageCount][1], backGradientColor[stageCount][2], 30, i);
	        	this.backGradient.rect(0, this.backGradient_y, window.innerWidth, this.backGradient_y + this.backGradient_y_delta, Phaser.Color.getWebRGB(c));
	        	this.backGradient_y += this.backGradient_y_delta;
	    	}
	    	var backGradientSprite = game.add.sprite(0, 0, this.backGradient);
	    	backImageGroup.add(backGradientSprite);
	    	game.world.sendToBack(backImageGroup);
			this.bgTime = this.h_ + 155;
			if(stageCount < MAXSTAGE){
				stageCount++;
				this.bgmPlay();
			}
		}
	},

	//make background twinkle
	makeTwinkle:function(){
		for(var i=0; i< 8; i++){
			var ranTime = 1 + Math.floor(Math.random() * 3);
			var ranX = Math.floor(Math.random() * 19);//0~11
			var ranY = Math.floor(Math.random() * 39);//0~11
			var backgroundTwinkle = game.add.emitter((ranX+1) * (window.innerWidth/20), (ranY+1) * (window.innerHeight/40), 1);
			backgroundTwinkle.makeParticles('backgroundTwinkle');
			backgroundTwinkle.setAlpha(1, 0, 2000);
			backgroundTwinkle.setScale(window.innerWidth/1000, window.innerWidth/400, window.innerWidth/1000, window.innerWidth/400, 6000, Phaser.Easing.Quintic.Out);//minX, maxX, minY, maxY, rate, ease, yoyo
			backgroundTwinkle.start(false, ranTime * 1000, 10);//explode, lifespan, frequency, quantity, forceQuantity
			backgroundTwinkle.maxParticleSpeed.setTo(0, 0);
			backgroundTwinkle.minParticleSpeed.setTo(0, 0);
			backgroundTwinkle.gravity = 0;
			this.backgroundTwinkles.push(backgroundTwinkle);
		}

	},

	updateTwinkle:function(){
		if(game.time.now > this.twinkleTime){
			for(var i=0; i < this.backgroundTwinkles.length; i++){
				var ranX = Math.floor(Math.random() * 19);//0~11
				var ranY = Math.floor(Math.random() * 20);//0~11
				this.backgroundTwinkles[i].emitX = (ranX+1) * (window.innerWidth/20);
				this.backgroundTwinkles[i].emitY = (ranY+1) * (window.innerHeight/40);
				this.twinkleTime = game.time.now + (3000);
			}
		}
	},

	//not using
	charging:function(){
		if(game.time.now > this.chargeTime){
			if(this.fuel < 100 && this.fuel > 0){
				this.fuel++;
			}
			this.chargeTime = game.time.now + 500;
		}
	},

	placeStar:function(){
		if(this.h_ > this.starTime){
			this.isStar = [0,0,0,0,0,0,0,0,0,0];
			this.starN = (this.starN+1)%3
			for(var i=0; i<this.starN+1; i++){
				var ran = Math.floor(Math.random() * 9);//0~8
				if(this.isStar[ran] == 0)
				{
					this.isStar[ran]++;
					var star = stars.create((ran+1)*(window.innerWidth/9), -(window.innerHeight/20), 'star');
					star.lifespan = 10000;
					this.starObjs.push(star);
					
					if(star){
						star.width = window.innerWidth/9;
						star.height = window.innerWidth/9;
						this.starTime = this.h_+1;
					}
				}
			}
		}
	},

	placeItem:function(){
		if(this.h_ > this.fuelItemTime){
			for(var i=0; i<1; i++){
				var ran = Math.floor(Math.random() * 9);//0~8
				var item = this.items.create((ran+2)*(window.innerWidth/12), -(window.innerHeight/20), 'fuel_item');
				item.lifespan = 10000;
				this.itemObjs.push(item);
				if(item){
					item.width = window.innerWidth/8;
					item.height = window.innerWidth/8;
					this.fuelItemTime = this.h_ + 9;
				}
			}
		}

		if(this.h_ > this.boostItemTime){
			var ran = Math.floor(Math.random() * 4);//0~11 //2,4,6,8
			var item = this.items.create((2*ran+3)*(window.innerWidth/12), -(window.innerHeight/20), 'boost_item');
			item.lifespan = 10000;
			this.itemObjs.push(item);
			if(item){
				item.width = window.innerWidth/10;
				item.height = window.innerWidth/7;
				this.boostItemTime = this.h_ + 62;
			}
		}
	},

	placeObstacle:function(){
		if(this.h_ > this.obstacleTime){
			var ran = Math.floor(Math.random() * 9);//0~11
			var ranType = Math.floor(Math.random() * 2);//0~1
			
			var tempObstacle = this.obstacles.create((ran+1)*(window.innerWidth/12), -(window.innerHeight/20), obstacleArray[stageCount][ranType]);
			tempObstacle.lifespan = 15000;
			this.obstacleObjs.push(tempObstacle);
			if(tempObstacle){
				tempObstacle.width = (window.innerWidth*(ranType+1))/8;
				tempObstacle.height = (window.innerHeight)/8;
				tempObstacle.rotation = 0;
				game.physics.enable(tempObstacle, Phaser.Physics.ARCADE);
				tempObstacle.body.collideWorldBounds = false;
				tempObstacle.body.bounce.setTo(1,1);
				this.obstacleTime = this.h_+ 2;
			}
		}
	},

	push:function(){
		if(game.input.x >= game.world.centerX){
			this.pushRight();
		}
		else{
			this.pushLeft();
		}
	},
	pushLeft:function(){
		if(this.fuel > 0 && PlayerState == "idle"){
			boostSound[0].play();
			rocket_dir = 0.7;

			this.rocket.body.velocity.x = rocket_dir * _speed * (window.innerWidth * 0.33);
			this.rocket.body.velocity.y = -(window.innerHeight * 0.08) * _speed * this.rotCos;
	        	right_emitter.on = false;
			left_emitter.on = true;
			this.game.time.events.add(300, function () {
	            right_emitter.on = false;
	            left_emitter.on = false;
	        }, this);
	        if(this.fuel < 10){
	        	this.fuel = 0;
	        }
	        else{
	        	this.fuel -= 10;
	        }
	        
		}
		else{

		}//no fuel
		
	},

	pushRight:function(){
		if(this.fuel > 0 && PlayerState == "idle"){
			boostSound[0].play();
			rocket_dir = -0.7;

			this.rocket.body.velocity.x = rocket_dir * _speed * (window.innerWidth * 0.33);
			this.rocket.body.velocity.y = -(window.innerHeight * 0.08) * _speed * this.rotCos;
	        	left_emitter.on = false;
			right_emitter.on = true;
			this.game.time.events.add(300, function () {
	            right_emitter.on = false;
	            left_emitter.on = false;
	        }, this);
	        if(this.fuel < 10){
	        	this.fuel = 0;
	        }
	        else{
	        	this.fuel -= 10;
	        }
		}
		else{

		}//no fuel
	},


	boostCheck:function(){
		if(game.time.now < this.boostTime){
			if(!boostSound[1].isPlaying) boostSound[1].play();
			PlayerState = "boost";
			this.rocket.rotation = 0;
			this.rocket.body.velocity.x = 0;
			this.rocket.y += (game.world.centerY - this.rocket.y)/1000;
			this.rocket.body.velocity.y = -(window.innerHeight * 0.2);
			left_emitter.on = true;
			right_emitter.on = true;
			this.game.time.events.add(990, function () {
				PlayerState = "idle";
	        }, this);
		}else{
		
		}
	},

	collisionHandler:function(rocket, obstacle){
		if(!kickSound.isPlaying) kickSound.play();
		// if(PlayerState != "boost"){
		// 	if(this.fuel>=10){
		// 		this.fuel -= 10;
		// 	}
		// 	else{
		// 		this.fuel = 0;
		// 	}
		// }
		this.timer = game.time.create(false);
		//200후에 삭제
		this.timer.loop(200, function(){
			obstacle.kill();
		}, this);
		this.timer.start();
	},

	itemHandler:function(rocket, Item){
		if(Item.key == 'fuel_item'){
			this.fuel += 40;
			if(this.fuel > 100) this.fuel = 100;
			Item.kill();
		}
		else if(Item.key == 'boost_item'){
			this.boostTime = game.time.now + 1000;
			if(this.fuel >= 70){
				this.fuel = 100;
			}else{
				this.fuel += 30;
			}
			Item.kill();
		}
		else if(Item.key == 'star'){
			this.extraScore += 2;
			var ran = Math.floor(Math.random() * 3);
			starSound[ran].play();
			Item.kill();
		}
	},

	gameOver:function(rocket){
		rocket.kill();
		PlayerState = "end";
		left_emitter.on = false;
		vertical_speed = 0;
		console.log("gameover");
		this.showEndUI();
	},

	/*
	*종료 UI를 생성한다.
	*/
	showEndUI:function(){
		this.titlescreen = game.add.sprite(game.world.centerX, game.world.centerY - 
			192, 'button');
		this.titlescreen.anchor.setTo(0.5, 0.5);
		this.scoretxt = game.add.text(this.titlescreen.x, this.titlescreen.y, score, {font: (window.innerHeight/10)+"px Arial", fill:"#fff", align:"center"});
		this.scoretxt.anchor.setTo(0.5);

		//TODO: playButton 이름 수정
		this.playButton = game.add.button(game.world.centerX, game.world.centerY + 192, 'button', this.reStartGame, this, 0, 0, 0);
		this.playButton.width = window.innerWidth * 0.3;
		this.playButton.height = window.innerHeight * 0.1;
		this.playButton.anchor.setTo(0.5);
		this.bottomtxt = game.add.text(this.playButton.x, this.playButton.y, "Back", {font: (window.innerHeight/20)+"px Arial", fill:"#fff", align:"center"});
		this.bottomtxt.anchor.setTo(0.5);
	},

	/*
	*시작 UI를 생성한다.
	*/
	showReadyUI:function(){
		//create card panel
		this.selectPanel = game.add.sprite(this.xGap, this.yGap, 'backgroundTwinkle');
		this.selectPanel.width = window.innerWidth * 0.882;
		this.selectPanel.height = 4*this.squareSize + 4*this.yGap;
		this.selectPanel.anchor.setTo(0, 0);
		//create cards
		this.cardGroup = game.add.group();
		for(var i = 1; i < 7; i++){
			var card = this.cardGroup.create(0, 0, 'friends_card_'+i);
			card.anchor.setTo(0.5);
			card.width = this.squareSize;
			card.height = this.squareSize * 2;
			card.inputEnabled = true;
			card.events.onInputUp.add(this.selectCard);
		}
		//align cards
		this.cardGroup.align(3, 2,  this.squareSize + 2*this.xGap, 2*this.squareSize + 2*this.yGap);//hor-count, ver-count, sellwidth, sellheight
		this.cardGroup.x = 2 * this.xGap;
		this.cardGroup.y = 2 * this.yGap;//this.cardGroup.height * 0.5; //+ this.selectPanel.y;

		//create play button
		this.playButton = game.add.button(game.world.centerX, window.innerHeight * 0.8, 'button', this.startGame, this, 0, 0, 0);
		this.playButton.width = window.innerWidth * 0.3;
		this.playButton.height = window.innerHeight * 0.1;
		this.playButton.anchor.setTo(0.5);
		this.bottomtxt = game.add.text(this.playButton.x, this.playButton.y, "Play", {font: (window.innerHeight/20)+"px Arial", fill:"#fff", align:"center"});
		this.bottomtxt.anchor.setTo(0.5);
	},
	/*
	*카드를 선택했을 시,
	*/
	selectCard:function(card){
		switch(card.key){
			case 'friends_card_1':
			FriendsCharacter = "friends1";
			break;
			case 'friends_card_2':
			FriendsCharacter = "friends2";
			break;
			case 'friends_card_3':
			FriendsCharacter = "friends3";
			break;
			case 'friends_card_4':
			FriendsCharacter = "friends4";
			break;
			case 'friends_card_5':
			FriendsCharacter = "friends5";
			break;
			case 'friends_card_6':
			FriendsCharacter = "friends6";
			break;
		}
	},

	createButton:function(game, string, x, y, w, h, callback){
		var button1 = game.add.button(x,y, 'button', callback, this, 2, 1, 0);
		button1.anchor.setTo(0.5, 0.5);
		button1.width = w;
		button1.height = h;
		var txt = game.add.text(button1.x, button1.y, string, {font:"1px Arial", fill
			:"#fff", align:"center"});
		txt.anchor.setTo(0.5, 0.5);
	},

	reStartGame:function(){
		game.state.start('Play');
	}
}	
