const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
    name:String,
    role: String,

    // for google login

    googleId: {type: String,unique: true, sparse: true},
    avatar: String,

    
    items:{
     type:[{
        id:{type:Number},
        quantity:{type:Number,default:1}
     }],
     default:[]
    }
})

module.exports= mongoose.model("User",userSchema)