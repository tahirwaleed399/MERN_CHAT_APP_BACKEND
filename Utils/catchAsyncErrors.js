// exports.catchAsyncErrors = fn => {
//     return fn(req,res,next)
// }

exports.catchAsyncErrors = fn=>{
return (req , res, next)=>{
   fn(req,res,next).catch(next);
}
}