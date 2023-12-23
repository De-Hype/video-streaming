const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const globalErrorHandler = require("./utils/errors/errorController");
const AppError = require("./utils/errors/AppError");
const videoRouter = require("./routes/videos");
require("dotenv").config();

const app = express();

// Handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Exception, shutting down");
  process.exit(1);
});

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use("/api", videoRouter);

app.all("*", (req, res, next) => {
  next(
    new AppError(
      `Can not find ${req.originalUrl} with ${req.method} on this server`,
      501
    )
  );
});
app.use(globalErrorHandler);

const Port = process.env.PORT || 7070;
const server = app.listen(Port, () =>
  console.log(`Server runing on localhost ${Port}`)
);

//Handling unHandled Rejections
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  console.log("Unhandled Rejection, shutting down");
  server.close(() => {
    process.exit(1);
  });
});
