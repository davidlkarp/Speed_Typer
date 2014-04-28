module.exports = function Route(app){
	var users = new Array();
	var word_bank = ['test', 'javascript', 'terminal', 'zebra', 'microwave', 'your mom', 'beta tester', 'black belt', 'ninja', 'samurai', 'ruby on rails', 'russia', 'california', 'washington', 'czechoslovakia', 'horse']
	var bigCount = 0;

	app.get('/', function(req, res){
		res.render('index');
	});

	app.io.route('got_a_new_user', function(req) 
	{
		users.push( { name:req.data[0].value, id: req.socket.id, score: 0, roundScore: 0 } );
		req.io.emit('logged_in', { name:req.data[0].value, id: req.socket.id } );
		app.io.broadcast('new_user', { name: req.data[0].value } );
		console.log('emitted new_user');
	});

	app.io.route('new_message', function(req) 
	{
		for(var i=0; i<users.length; i++){
			if(users[i].id == req.socket.id){
				var POSTER = users[i].name
			}
		}
		app.io.broadcast('update', { message: req.data[0].value, name: POSTER } );
		console.log("message sent" + req.data[0].value + POSTER);
	});

	app.io.route('disconnect', function(req)
	{
		for(var i=0; i<users.length; i++){
			if(users[i].id == req.socket.id){
			var POSTER = users[i].name
			}
		}
		app.io.broadcast('disconnected', { name: POSTER } );
		console.log('Disconnected ' + req.socket.id );
	});

	(function Timer()
	{	
		setInterval(function()
		{
			//countdown interval
			setTimeout(function(){
				count = 20;
				bigCount = count;
				myinterval = setInterval(function()
				{
					count -= 1;
					bigCount = count;
					if (count > 0){
						app.io.broadcast('countdown', { count: count } );
						console.log('countdown ' + count );
					} else {
						clearInterval(myinterval);
					};
				}, 1000);
			}, 10000)
		}, 30000);

		//word change interval
		setInterval(function(){
			WORD = word_bank[(Math.floor(Math.random()*word_bank.length))];
			app.io.broadcast('new_word', { word: WORD } );
			console.log('new word broadcast ');
		}, 30000);

		//score update every second
		setInterval(function(){
			app.io.broadcast('scoreUpdate', { allScores: users } );
		}, 1000);
	
			setInterval(function(){
				for(var i=0; i<users.length; i++){
					users[i].roundScore = 0;
				};
			}, 30000);	

	}());

	app.io.route('answerAttempt', function(req){
		if (req.data[0].value == WORD && bigCount == 0){
			req.io.emit('answerValidation', { verdict: "Correct" } );
				for(var i=0; i<users.length; i++){
					if(users[i].id == req.socket.id){
					users[i].score += 1;
					users[i].roundScore += 1;
					req.io.emit('myScoreUpdate', { score: users[i].score, roundScore: users[i].roundScore } );
					};// not right
				};
		} else {
			req.io.emit('answerValidation', { verdict: "Incorrect" } );
		};
	});



	
}
