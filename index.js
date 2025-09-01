const express = require("express")
const mongoose = require("mongoose")
// const Item = require('./models/Item')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authMidlleware = require("./middleware/authMiddleware")
const cors = require("cors")
require('dotenv').config();
const passport = require("./middleware/auth")




// create the server
const app = express()

const corsOptions = {
  origin: process.env.FRONTEND_URL, // only allow your Vite dev server
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json())



// registration and login

// registration
//post
app.post("/register", async(req,res)=>{
  try {
    const{useremail,userpassword,username}=req.body

    if(!useremail ||!userpassword || !username){
     return res.status(400).json({message:"missing inforamtion"})
    }
    const user =await User.findOne({email:useremail})
    if(user){
        return res.status(400).json({message:"the email already exist"})
    }

// encrypt password
const encryptpassword = await bcrypt.hash(userpassword,12)

const newLogin = new User({
  name:username,
  email: useremail,
  password: encryptpassword,
  role:"user"
})
await newLogin.save()

res.status(200).json({message:"user have been created succesfully"})

console.log(req.body);
  } catch (error) {
     res.status(500).json(error.message)
  }
})

// login

app.post('/login', async (req,res)=>{

  try {

    const {useremail,userpassword}=req.body

  if(!useremail || !userpassword){
    res.status(400).json({message:"missing information"})

  }
  const user = await User.findOne({email:useremail})

  if(!user){
       return res.status(404).json({message:"wrong email or password"})

  }
  const isvalidpassword = await bcrypt.compare(userpassword,user.password)
  if(!isvalidpassword){
   
        return res.status(404).json({message:"wrong email or password"})
  }

  user.password=undefined

 // Token
  const token = jwt.sign({email:user.email,id:user._id,role:user.role,username:user.name},process.env.JWT_SECRET,{
        expiresIn:"1y"
    })

res.status(200).json({message: " correct info",user:user,token:token})    


    
  } catch (error) {
     res.status(500).json({message:"something went wrong"})
  }
  


})

// get profile

app.get("/profile", authMidlleware, async (req,res)=>{
  try {
    const userId = req.user.id


    const connectedUser = await User.findOne({_id:userId})

    res.status(200).json({message:"User details",user: connectedUser})
  } catch (error) {
    res.status(500).json(error.message)
  }
})

//Post items
app.post("/itemcart",authMidlleware, async(req,res)=>{
  try {
    const {itemsselected}=req.body
  if(!itemsselected){
    res.status(400).json({message: "no items availiable"})

  }
  const user = await User.findById(req.user.id)

  if(!user){
    res.status(404).json({message:"user not found"})

  }
  itemsselected.forEach(newItem => {
      const existing = user.items.find(item => item.id === newItem.id);
      if (existing) {
        existing.quantity += newItem.quantity; // increase quantity if exists
      } else {
        user.items.push({ id: newItem.id, quantity: newItem.quantity });
      }
    });
  await user.save()

 res.status(200).json({message:"items added succefully",items: user.items})
    
  } catch (error) {
    console.error(error)
    res.status(500).json({message:" something went wrong"})
    
  }
  
})

// edit itmes
app.put("/itemcart",authMidlleware,async(req,res)=>{
  try {
   const  {itemsselected}= req.body

   if(!itemsselected){
   return res.status(400).json({message:"No items provided"})
   }
   const user = await User.findById(req.user.id)
    itemsselected.forEach(updatedItem=>{
      const item = user.items.find(i=> i.id=== updatedItem.id)
      if(item){
        item.quantity= updatedItem.quantity;
      }

    });
    
   await user.save();
   res.status(200).json({message:"edited",items: user.items})

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong" });
  }
})

// delete item 
app.delete("/itemcart", authMidlleware, async(req,res)=>{
  try {

    const {itemid}=req.body
    if(!itemid){
      res.status(400).json({message:"item not found"})
    }

    const user = await User.findById(req.user.id)
    if(!user){
       res.status(404).json({message:"user not found"})
    }

    user.items =user.items.filter(item=> item.id!== itemid)
    

    await user.save();

    return res.status(200).json({message:"Item removed successfully",items: user.items})

  } catch (error) {

      console.error(error);
    res.status(500).json({ message: "Something went wrong" });
    
  }
})


// google handle login

// Step 1: Redirect to Google login
app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Google callback
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false,
  failureRedirect: `${process.env.FRONTEND_URL}/auth/failure`
   }),
  (req, res) => {
    // Issue JWT just like /login
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role,username: req.user.name },
      process.env.JWT_SECRET,
      { expiresIn: "1y" }
    );

    // redirect with token in URL (frontend extracts it & stores in localStorage)
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);





const PORT = process.env.PORT || 5500;

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5500 }).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, '0.0.0.0', () => { // <-- Use the PORT variable and listen on '0.0.0.0'
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((err) => {
  console.log(err);
});