class NewErrorHandler extends Error {
    constructor(message , statusCode){
        super(message);
        this.statusCode =  statusCode ;
        this.isOperationalError = true ;
        Error.captureStackTrace(this, this.constructor);1
    }
}

module.exports = NewErrorHandler;