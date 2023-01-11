// Importing libraries
const router = require("express").Router();
const fs = require("fs-extra");
const path = require("path");
const readXlsxFile = require("read-excel-file/node");
const multer = require("multer");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/excel/");
  },
  filename: function (req, file, cb) {
    // if (
    //   path.extname(file.originalname) != "xls" &&
    //   path.extname(file.originalname) != "xlsx"
    // )
    //   cb(new Error("please upload xls or xlsx file extension."));
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

var upload = multer({
  storage: storage,
});

// Routes
router.post("/val-excel", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    console.log(file, "file");
    const filepath = path.join(__dirname, `../uploads/excel/${file.filename}`);

    const validation = {
      name: "string",
      count: "number",
    };

    const labels = Object.keys(validation);
    const formats = Object.values(validation);

    const countries = [""];
    let labelErr = [];
    let formatErr = [];

    readXlsxFile(filepath)
      .then(async (rows) => {
        // console.log(rows[0][0]);
        rows[0].forEach((cell, k) => {
          if (cell != labels[k])
            labelErr.push(
              `Invalid label '${cell}' in cell 0x${k}. Required lalbel: '${labels[k]}'}`
            );
        });
        if (labelErr.length != 0) {
          fs.unlink(filepath, (err) => {
            if (err) throw err;
            console.log(file.filename + " Deleted");
          });
          return res
            .status(400)
            .send({ error: "Bad File Format", validation: labelErr });
        }

        rows.forEach((row, i) => {
          if (i >= 1) {
            row.forEach((cell, k) => {
              type = typeof cell;
              if (type != formats[k])
                formatErr.push(
                  `Invalid format '${type}' of column ${rows[0][k]} in cell ${i}x${k}. Required '${formats[k]}' in ${rows[0][k]}`
                );
            });
          }
        });
        if (formatErr.length != 0) {
          fs.unlink(filepath, (err) => {
            if (err) throw err;
            console.log(file.filename + " Deleted");
          });
          return res
            .status(400)
            .send({ error: "Bad File Format", validation: formatErr });
        }

        return res.status(200).send("File Format Valid");
      })
      .catch((error) => {
        return res
          .status(400)
          .send({ msg: "Invalid Excel File Format", error });
      });
  } catch (err) {
    return res.status(500).send(err);
  }
});

module.exports = router;
