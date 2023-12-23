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
    const file = req.file;
    const encryptedFile = encryptVideo(file.buffer, key, iv);
    const filename =
      crypto.randomBytes(16).toString("hex") + path.extname(file.originalname);
    const fileUpload = bucket.file(filename);
    await fileUpload.save(encryptedFile);
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
    res.setHeader("Content-Type", "video/*");
    const file = bucket.file(filename);
    const readStream = file.createReadStream();
    readStream.pipe(res);
  })
);

module.exports = router;
