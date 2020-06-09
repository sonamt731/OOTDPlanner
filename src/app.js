//function to convert the kelvin temperature to fahrenheit
function converter(temp){
	temp = parseInt(temp);
	const fahrenheitTemp = ((9/5)*(temp - 273.15)) + 32;
	return Math.round(fahrenheitTemp);
}

//Note that my 6 points were mainly used for organizing the design of my site and changing
//decor based on the users input
//one of my three requirements for 6 points 
class Weather{
	constructor(mainTemp, feelsLike, minTemp, maxTemp, mainWeath, moreDetailed){
		//converter the weather from kelvin to fahrenheit 
		this.mainTemp = converter(mainTemp);
		this.feelsLike = converter(feelsLike);
		this.minTemp = converter(minTemp);
		this.maxTemp = converter(maxTemp);
		this.mainWeath = mainWeath;
		this.moreDetailed = moreDetailed;

		//decide what image to store
		if (mainWeath === "Clouds"){
			this.img = "/img/clouds.jpeg";
		}
		else if ((mainWeath) === "Rain" || (mainWeath) === "Drizzle"){
			this.img = "/img/rain.jpeg";
		}

		else{
			this.img = "/img/clear.jpg";
		}
	}
}

function OccasionMatch(occasion){
	if (occasion === "Anniversary"){
		return "💍";
	}
	else if(occasion === "Birthday"){
		return "🎂";
	}
	else if (occasion === "Business"){
		return "💼";
	}
	else if (occasion === "Cultural"){
		return "🌎";
	}
	else if(occasion === "Dinner"){
		return "🍽";
	}
	else if(occasion === "New Years Eve"){
		return "🥂";
	}
	else if(occasion === "Outdoor Event"){
		return "🌳";
	}
	else if(occasion === "Party"){
		return "🎉";
	}
	else if(occasion === "Wedding"){
		return "👰";
	}
	else{
		return "👀";
	}
}

//two of the three requirements of 6 points 
//using to store emoji matching 
class Occasion{
	constructor(occasion, outfit){
		this.occasion = occasion;
		this.outfit = outfit;
		this.emoji = OccasionMatch(occasion);
	}
}

class Book{
	constructor(link, topBottom, shoes, accessories, season,date){
		this.link = link;
		this.topBottom = topBottom;
		this.shoes = shoes;
		this.accessories = accessories;
		this.season = season;
		this.date = date;

		if(season === "fall"){
			this.img = "/img/fall.gif";
		}
		else if(season === "spring"){
			this.img = "/img/spring.gif";
		}

		else if(season === "winter"){
			this.img = "/img/winter.jgp";
		}
		else{
			this.img = "/img/summer.gif";
		}
	}
}

// app.js
require('./db.js');
const session = require('express-session');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require("express-flash");
const bodyParser = require('body-parser');
const app = express();
//const passportLocalMongoose = require('passport-local-mongoose');
const connectEnsureLogin = require('connect-ensure-login');

//schemas
const Look = mongoose.model('Look');
const User = mongoose.model('User');
const Plan = mongoose.model('Plan');
const LocalStrategy = require('passport-local').Strategy;

passport.use(User.createStrategy());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});
	passport.deserializeUser(function(id, done) {
	User.findOne({
		_id: id
		}, '-password -salt', function(err, user) {
		done(err, user);
	});
	});

passport.use(new LocalStrategy(function(username, password, done) {
	User.findOne({
		username: username,
		password: password
	}, function(err, user) {
		// This is how you handle error
		if (err) {return done(err);}
		// When user is not found
		if (!user) {return done(null, false);}
		// When password is not correct
		if (!user.authenticate(password)) {return done(null, false);}
		// When all things are good, we return the user
		return done(null, user);
	});
}));

//getting info from api 
const request = require('request');

const path = require('path');
app.set('views', __dirname + '/../views');
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, '/../public')));
const sessionOptions = { //taken from versoza's slides
	secret: 'secretttt', 
	saveUninitialized: false, 
	resave: false
}; 
app.use(session(sessionOptions));


//setting up body parser 
//app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
// passport.use(new LocalStrategy(User.createStrategy()));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', connectEnsureLogin.ensureLoggedIn(), (req,res) => {
	const result = {};
	//let ses = req.query.season.toLowerCase();
	//filtering 
	if (req.query.hasOwnProperty('season') && req.query.season !==""){
		const season = (req.query.season).toLowerCase();
		result.season = season;
		//console.log(seasonC.img);
	}
	Look.find(result, (err, looks) =>{
		if(err){
			console.log('errrr');
		}
		else{
			const Arr = [];
			for (let i = 0; i < looks.length; i++){
				const look = looks[i];
				const toAdd = new Book(look.link,look.topBottom, look.shoes, look.accessories, look.season,look.date);
				Arr.push(toAdd);
			}
			res.render('lookbook',{looks: Arr}); 
	}
	});
});

app.post('/', (req,res) => {
	res.redirect('/');
});

app.get('/add',connectEnsureLogin.ensureLoggedIn(), (req,res) => {
	res.render('add');
});

app.post('/add', (req, res) => { 
	//add checks
	if (req.body!==undefined){
		new Look({
			topBottom: req.body.topBottom,
			shoes: req.body.shoes,
			accessories: req.body.accessories,
			season: req.body.season,
			date: req.body.date,
			link: req.body.link

		}).save(function(err){
			if(err){
				console.log(err);
			}
			res.redirect('/');
		});
	}
	//add checks
	else{
		res.redirect('/add');
	}
});

app.get('/planner', connectEnsureLogin.ensureLoggedIn(), (req,res) => {
	const weather = {};
	if(req.query.hasOwnProperty('zipcode') && req.query.zipcode!==""){
		const zip = req.query.zipcode;
		let link = 'http://api.openweathermap.org/data/2.5/weather?zip=';
		link += zip;
		link += '&appid=db47a70cb564779923d4eb2febe8a1b3';
		//console.log(link);
		request(link, function (error, response, body) {
			//code to get the API information of weather
			if(response.statusCode >= 200 && response.statusCode < 400){
				const data = JSON.parse(body);
				const main = data.main;

				//using my weather class
				const mainTemp = main.temp;
				const feelsLike = main.feels_like;
				const minTemp = main.temp_min;
				const maxTemp = main.temp_max;
				const mainWeath = data['weather'][0].main;
				const moreDetailed = data['weather'][0].description;
				//filled will be the boolean as to weather to inlcude this data or not
				const weatherC = new Weather(mainTemp, feelsLike, minTemp, maxTemp, mainWeath, moreDetailed);
				//console.log(weatherC.img);
				res.render('planner', {weather: weatherC, filled: true});
			}
		});

	}
	else{
	//would actually be easier to pass in a dict 
		res.render('planner', {weather: weather, filled: false});
	}
});

app.post('/planner', (req,res) => {
	if(req.body!== undefined){
		new Plan({
			occasion: req.body.occasion,
			outfit: req.body.outfit
		}).save(function(err){
			if(err){
				console.log(err);
			}
			res.redirect('/myPlan');
			//console.log('successfully added');
		});
	}
	else{
		res.redirect('/planner');
	}
});

app.get('/myPlan', connectEnsureLogin.ensureLoggedIn(), (req,res)=>{
	const result = {};
	let occasion = "All";
	//filtering 
	if (req.query.hasOwnProperty('occasion') && req.query.occasion !==""){
		occasion = (req.query.occasion);
		result.occasion = occasion;
	}
	Plan.find(result, (err, looks) =>{
		//console.log(looks);

		if(err){
			console.log('errrr');
		}
		else{
			const Arr = [];
			for (let i = 0; i < looks.length; i++){
				const plan = looks[i];
				//using the Occassion class which also stores the associated emoji
				const planObj = new Occasion(plan.occasion, plan.outfit);
				//console.log(planObj);
				Arr.push(planObj);
			}

			res.render('myPlan',{looks: Arr, occasion: occasion}); 
		}
	});
});

app.get('/login', (req, res) => {
	res.render('login');
});

app.post('/login', (req, res, next) => {
	passport.authenticate('local',
	(err, user) => {
	if (err) {
		return next(err);
	}

	if (!user) {
		const error = "Invalid entry. Try again.";
		return res.render('login',{error:error});
	}

	req.logIn(user, function(err) {
		if (err) {
			return next(err);
		}
		//console.log(curr.username);
		return res.redirect('/');
	});

	})(req, res, next);
});

app.get('/register', (req, res) =>{
	res.render('register', {});
});

app.post('/register', function(req,res){
	//console.log(req.body.name);
	// console.log(req.body.username);
	// console.log(req.body.password);
	const user = new User({ username: req.body.username, password: req.body.password});
	user.save(function(err) {
	if(err) {
		//console.log(err);
		const error = "Invalid username. That username is taken.";
		res.render('register',{error:error});
	}
	else {
		// console.log('user: ' + user.email + " saved.");
		req.login(user, function(err) {
		if (err) {
			const error = "Invalid username. That username is already taken.";
			console.log(err);
			res.render('register',{error:error});
		}
		return res.redirect('/login');
		});
	}
	});

});

app.get("/logout", function(req, res){    
	req.logout();    
	res.redirect("/");
});


app.listen(process.env.PORT || 3000);

