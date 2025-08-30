const jwt = require("jsonwebtoken")

const authMidlleware=(req,res,next)=>{
    let token = req.headers.authorization

    if(token){
        token = token.split(" ")[1]
        try {
            const decodedtoken = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decodedtoken
             next()
        } catch (error) {
            res.status(401).json({message:'unauthorized'})
            
        }
    }else{
            res.status(401).json({message:'unauthorized'})

    }
   
}
module.exports=authMidlleware