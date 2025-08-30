adminMiddleware=(req,res,next)=>{

   try {
     if(req.user.role!=="admin"){
      res.status(404).json({message:'unauthorized'})
   }
   } catch (error) {
    res.status(404).json({message:'unauthorized'})
    
   }
   
}
module.exports=adminMiddleware