import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/temp");
    },
    filename: function (req, file, cb) {
        cb(null,Date.now().toString() + "-" + file.originalname);
    },
});

// const fileFilter = (req, file, cb) => {
//     if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
//         cb(null, true);
//     } else {
//         cb(new Error("Only JPEG and PNG images are allowed!"), false);
//     }
// };

const upload = multer({ storage });

export default upload;