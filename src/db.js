//db.js
const mongoose = require('mongoose');
//const bcrypt = require('bcrypt');
const passportLocalMongoose = require('passport-local-mongoose');
//my schema goes here!
const Look = new mongoose.Schema({
  topBottom: {type: String, required: true},
  shoes: {type: String, required: true},
  accessories: {type: String, required: true},
  season: {type: String, required: true},
  date: {type: String, required: true},
  link: {type: String, required: true}

});

const User = new mongoose.Schema({
	//name: {type: String, required: true},
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true}
});

const Plan = new mongoose.Schema({
	occasion: {type: String, required: true},
	outfit: {type: String, required: true}
});

mongoose.model('Look', Look);
//mongoose.model('User', User);
mongoose.model('Plan', Plan);

// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 //configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/finalProj';
}
//have not added user name and password yet - this line below will change 
mongoose.connect(dbconf, {useUnifiedTopology: true, useNewUrlParser: true});

User.plugin(passportLocalMongoose);
const Users = mongoose.model('User',User);

//db.looks.insert({topBottom: "black one shoulder lace dress", shoes: "black strappy heels", accessories: "hoop earings", season: "fall", date: "2020-10-14", link: "https://cdn.shopify.com/s/files/1/1055/6168/products/4RzRVAm_2048x.jpg?v=1584607821"});
//db.looks.insert({topBottom: "silver shiny jacket black jeggings", shoes: "black platform shoes", accessories: "sunglasses round addidas fanny pack hat apple watch", season: "spring", date: "2020-04-16", link: "https://i.pinimg.com/originals/cf/b8/40/cfb840d8889788619a21011dc79425e6.jpg"});


//db.plans.insert({occasion: "New Years Eve", outfit: "purple sequin knee length dress with black strappy heels"});
//db.plans.insert({occasion: "Cultural", outfit: "silver and light pink anarkali with silver heels and long silver earrings"});


//db.plans.insert({occasion: "Business", outfit: "black satin loose midarm dress with bold belt and black pumps"});

//User.path('password');

// Users.register({username:'paul', active: false}, 'paul');
// Users.register({username:'jay', active: false}, 'jay');
// Users.register({username:'roy', active: false}, 'roy');




