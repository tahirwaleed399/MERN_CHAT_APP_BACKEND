exports.jsonResponce =  function ( res , status , success , data) {

res.status(status).json({success , data });
}