const catchAsync = require("../utils/errors/catchAsync");
const crypto = require("crypto");
const ffmpeg = require("fluent-ffmpeg");
const upload = require("../utils/multer");
const encryptVideo = require("../utils/encryptVideo");
const path = require("path");
const bucket = require("../utils/firebase.config");
const Modules = require("../models/modules.schema");
const AppError = require("../utils/errors/AppError");
const Courses = require("../models/courses.model");
const fs = require("fs");
const getVideoDurationInSeconds = require("get-video-duration");
const key = Buffer.from(process.env.key, "hex");
const iv = Buffer.from(process.env.iv, "hex");

module.exports.UploadVideo = catchAsync(async (req, res, next) => {
  //This was to store encrypted file or video
  const file = req.file;
  const { module_name, subscriptionRequired } = req.body;
  // const readstream = file.createReadStream()
  // console.log(stream);
  const findLessonByName = await Modules.findOne({ module_name });
  if (findLessonByName) {
    return next(new AppError("Lesson with this name already exist", 403));
  }
  // const data = await getVideoDurationInSeconds.getVideoDurationInSeconds(readstream.pipe())
  // console.log(data)

  // ffmpeg.ffprobe(file.originalname, (err, metadata) => {
  //   if (err) {
  //     console.log(err.message);
  //     return next(new AppError(`${err.message}`, 402));
  //   }
  //   const durationInSeconds = metadata.format.duration;
  //   console.log(`Movie duration is ${durationInSeconds}`);
  // });

  const encryptedFile = encryptVideo(file.buffer, key, iv);
  const filename =
    crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
  const fileUpload = bucket.file(filename);
  await fileUpload.save(encryptedFile);

  const createLessons = await Modules({
    module_name,
    firebase_id: filename,
    // duration: durationInSeconds,
    subscriptionRequired,
  });
  await createLessons.save();

  res.status(200).json({
    success: true,
    message: " Video succesfully uploaded",
    filename,
    createLessons,
  });
});

module.exports.CreateCourses = catchAsync(async (req, res, next) => {
  const { title, creator, thumbnail, description, modulesId } = req.body;
  const findCourseByName = await Courses.findOne({ title });
  if (findCourseByName) {
    return next(new AppError("Course with this name already exist", 403));
  }
  console.log(title, creator, thumbnail, description, modulesId);
  const createCourse = await Courses({
    title,
    creator,
    thumbnail,
    description,
    modules: modulesId,
  });
  await createCourse.save();

  res.status(200).json({
    success: true,
    message: "Course created succesfully",
    createCourse,
  });
});
module.exports.GetCourseDetails = catchAsync(async (req, res, next) => {
  //We will get the id of the course from params.
  const courseId = req.body.courseId;

  const range = req.headers.range;
  // `bytes=0-499`
  //If there is no videoId present, we only fetch the free video, which is the demo video
  const findCourseById = await Courses.findById(courseId);
  if (!findCourseById) {
    return next(new AppError("Course with this ID does not exist", 403));
  }
  // const getLessonDetails = await findCourseById.findById(videoId);
  // if (!getLessonDetails) {
  //   return next(new AppError("Video with this ID does not exist", 403));
  // }
  const innerCourseId = findCourseById.modules;
  const videoId = req.body.videoId || innerCourseId[0];
  
  const findIfVideoExistInsideCourse = innerCourseId.find(
    (id) => id == videoId
  );
  if (findIfVideoExistInsideCourse == undefined || null) {
    return next(new AppError("Course with this ID does not exist", 403));
  }
  
  // const newId = findCourseById;
  const findVideoById = await Modules.findById(findIfVideoExistInsideCourse);
  if (findVideoById.subscriptionRequired==true){
    return next(new AppError("You have not subscribed to this course", 401));
  }
  // res.setHeader("Content-Type", "video/*");
  //Getting Video From Firebase
  const file = bucket.file(findVideoById.firebase_id);
  const [videoBuffer] = await file.download();
  
  // //Getting MetaData about the video file to determine its size
  // const fileStat = await file.getMetadata();
  // const fileSize = fileStat[0].size;
  // console.log(range);
  res.status(202).json({
    status: "ok",
    success: true,
    message: "Course fetched succesfully",
    findCourseById,
    video: videoBuffer.toString('base64'),
  });
  

  // }

  // if (range) {
  //   const parts = range.replace(/bytes=/, "").split("-");
  //   const start = parseInt(parts[0], 10);
  //   const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
  //   //Calculating the chunk size
  //   const chunkSize = end - start + 1;
  //   //Creating a readable stream
  //   const readStream = file.createReadStream({ start, end });
  //   res.writeHead(206, {
  //     "Content-Range": `bytes ${start} - ${end} / ${fileSize}`,
  //     "Accept-Ranges": "bytes",
  //     "Content-Length": chunkSize,
  //     "Content-Type": "video/*",
  //   });
  //   readStream.pipe(res);
  // } else {
  //   const readStream = file.createReadStream();
  //   res.writeHead(206, {
  //     "Content-Length": fileSize,
  //     "Content-Type": "video/*",
  //   });
  //   //   readStream.pipe(res);
  //   res.status(202).json({
  //     status: "ok",
  //     success: true,
  //     message: "Course fetched succesfully",
  //   });
  // }
  //We will find the course on our database with that particular Id
  //We will fetch all the course with that Id from firebase
  //
});

module.exports.GetAllCourses = catchAsync(async (req, res, next) => {
  const AllCourses = await Courses.find();
  res.status(202).json({
    status: "ok",
    success: true,
    message: "Course fetched succesfully",
    AllCourses,
  });
});
