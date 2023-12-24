const catchAsync = require("../utils/errors/catchAsync");
const crypto = require("crypto");
const upload = require("../utils/multer");
const encryptVideo = require("../utils/encryptVideo");
const path = require("path");
const bucket = require("../utils/firebase.config");
const router = require("express").Router();
require("dotenv").config();

const key = Buffer.from(process.env.key, "hex");
const iv = Buffer.from(process.env.iv, "hex");

router.post(
  "/post-video",
  upload.single("video"),
  catchAsync(async (req, res, next) => {
    //This was to store encrypted file or video
    // const file = req.file;
    // const encryptedFile = encryptVideo(file.buffer, key, iv);
    // const filename =
    //   crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
    // const fileUpload = bucket.file(filename);
    // await fileUpload.save(encryptedFile);
    //This is to store raw video after it has been encrypted on the frontend
    const file = req.file;
    const filename =
      crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
    const fileUpload = bucket.file(filename);
    await fileUpload.save(file);

    //Will receive video and its name from the frontend
    //Will generate a unique Id for the video
    //Will store the video as a collection in Firebase
    //
    res.status(200).json({
      success: true,
      message: " Video succesfully uploaded",
      filename,
    });
  })
);

router.get(
  "/get-all",
  catchAsync(async (req, res, next) => {
    const [files] = await bucket.getFiles();
    const fileList = files.map((file) => ({ filename: file.name }));
    res.status(200).json({
      success: true,
      message: " Videos fetched Succesfully",
      videos: fileList,
    });
  })
);

router.get(
  "/fetch-video/:filename",
  catchAsync(async (req, res, next) => {
    const filename = req.params.filename;
    const range = req.headers.range || `bytes=0-499`;

    // res.setHeader("Content-Type", "video/*");
    //Getting Video From Firebase
    const file = bucket.file(filename);
    //Getting MetaData about the video file to determine its size
    const fileStat = await file.getMetadata();
    const fileSize = fileStat[0].size;
    console.log(range);

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      //Calculating the chunk size
      const chunkSize = end - start + 1;
      //Creating a readable stream
      const readStream = file.createReadStream({ start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start} - ${end} / ${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": "video/*",
      });
      readStream.pipe(res);
    } else {
      const readStream = file.createReadStream();
      res.writeHead(206, {
        "Content-Length": fileSize,
        "Content-Type": "video/*",
      });
      readStream.pipe(res);
    }
  })
);

module.exports = router;
