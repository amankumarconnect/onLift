require('dotenv').config()
const express = require('express')
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoose = require('mongoose');

const multer = require('multer');
const upload = multer({ dest: 'public/img/' });

const app = express()
const port = process.env.PORT||3000;

//middlewares
app.set('view engine', 'ejs');
app.use(express.static('public'))
app.use(express.json()); //convert data into json format
app.use(express.urlencoded({extended:false}));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

//User Model
const LoginSchema = new mongoose.Schema({
  "username": {
    "type": "String",
    "unique": true,
    "required": true
  },
  "weight": {
    "type": "Number",
    "required": true,
    "min": 0
  },
  "password": {
    "type": "String",
    "required": true
  },
  "photo": {
    "type": "String", // Stores a URL or file path to the photo
    "default": null // Optional field, defaults to null if no photo is provided
  },
  "currentFloor": {
    "type": "Number",
    "required": true,
    "default": 0
  },
  "desiredFloor": {
    "type": "Boolean",
    "default": false
  }
});

const collection = mongoose.model('users',LoginSchema)

//Lift Model
const LiftSchema = new mongoose.Schema({
  "currentFloor": {
    "type": "Number",
    "required": true,
    "min": 0,
    "max": 10,
    "default": 0
  },
  "nextFloors": {
    "type": ["Number"], // Array of numbers (0-10 constraint handled elsewhere if needed)
    "default": [] // Default is an empty array
  },
  "order": {
    "type": "Boolean", // true = in order, false = out of order
    "default": true
  },
  "usersInside": {
    "type": ["String"], // Array of usernames
    "default": [] // Default is an empty array
  }
})

const liftCollection = mongoose.model('lift', LiftSchema);

//creating one single lift
async function ensureSingleLift() {
  const liftCount = await liftCollection.countDocuments();
  if (liftCount === 0) {
    const newLift = new liftCollection();
    await newLift.save();
  }
}

//Config Database
const connectDB = async ()=>{
    try {
        mongoose.set('strictQuery', false);
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database Connected: ${conn.connection.host}`);
        await ensureSingleLift();
    } catch (error) {
        console.log(error);
    }
}
connectDB();

//routes
app.get('/', async (req,res) => {
  const lift = await liftCollection.findOne();
  let nextUp = true;
  if(lift.nextFloors.length>0){
    nextUp = ((lift.nextFloors[0] - lift.currentFloor)>=0);
  }
  if(req.session.isLoggedIn){
    const user = await collection.findOne({ username: req.session.username });
    if(req.session.username === "admin"){
      res.render('admin', { 
        liftFloor: lift.currentFloor ,
        nextUp: nextUp
      });
    }
    else{
      res.render('user', { 
        userFloor: user.currentFloor, 
        liftFloor: lift.currentFloor ,
        nextUp: nextUp,
        userApi: user
      });
    }
  }
  else{
    res.render('index');
  }
})

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', upload.single('photo'), async (req,res) => {
  const data = {
    username: req.body.username,
    weight: req.body.weight,
    password: req.body.password,
    photo: req.file? '/img/' + req.file.filename : null
  }

  const existingUser = await collection.findOne({username: data.username});
  if(existingUser){
    res.send("User already exists. Use a different username");
  }
  else{
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(data.password, saltRounds);
    data.password = hashedPassword;

    await collection.insertMany(data);
    res.redirect('/login');
  }
})

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req,res) => {
  try {
    const check = await collection.findOne({username: req.body.username});
    if(!check){
      res.send("Username not found");
    }

		const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
		if(isPasswordMatch){
      req.session.isLoggedIn = true;
      req.session.username = req.body.username;

			res.redirect('/');
		}
		else{
			res.send("Wrong Password!");
		}

  } catch{
    res.send("Wrong Details");
  }
})

app.get('/logout', (req,res) => {
  req.session.destroy();
  res.redirect('/');
})

app.get('/user', (req, res) => {
  res.redirect('/login');
});

app.get('/admin', (req, res) => {
  res.redirect('/login');
});

//api to give data to client
app.get('/api', async (req, res) => {
  const userApi = await collection.findOne({ username: req.session.username });
  const liftApi = await liftCollection.findOne();
  if (!liftApi) {
    return res.status(500).json({ error: "No lift found" });
  }
  const liftUsers = await collection.find({ username: { $in: liftApi.usersInside } });
  res.json({
    userApi: userApi,
    liftApi: liftApi,
    liftUsers: liftUsers
  });
});

//apis to update data in user and lift
app.put('/api/user/:username', async (req, res) => {
  const updatedUser = await collection.findOneAndUpdate(
    { username: req.params.username },
    req.body
  );
  res.json(updatedUser);
});

app.put('/api/lift', async (req, res) => {
  const updatedLift = await liftCollection.findOneAndUpdate({}, req.body);
  res.json(updatedLift);
});

//start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});