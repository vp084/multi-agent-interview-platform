import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.resolve("./uploads");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath)
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const filefilter = (req, file, cb) => {
    if (file.mimetype.startsWith("application/pdf")) {
        cb(null, true)
    } else {
        cb(new Error("Invalid file type"), false)
    }
}


export const upload = multer({
    storage,
    fileFilter: filefilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});