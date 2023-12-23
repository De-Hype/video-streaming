const AppError = require("./AppError");

const handleCastErrorDB =err=>{
    const message = `Invalid ${err.path} : ${err.value}.`;
    return new AppError(message, 400);
}


const SendErrorDev = (err, req, res)=>{
    return res.status(err.statusCode).json({
        status:err.status,
        error:err,
        message:err.message,
        stack:err.stack,
    });
}

const SendErrorProd =(err, req, res)=>{
    if (err.isOperational){
        return res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        });
    }
    return res.status(500).json({
        status:'error',
        message:'something went very wrong',
    });
}

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV === 'development'){
        SendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production'){
        let error = {...err};
        error.message = err.message;

        //We will handle different errors here tho
        SendErrorProd(error, req, res);
    } 
    else{
        // console.log('Error controller')
        return res.status(300).json({
            status:'error',
            message:'Please set up production or  development in your env',
        });
    }
}
