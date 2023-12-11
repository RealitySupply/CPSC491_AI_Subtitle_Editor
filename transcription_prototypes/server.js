const express = require("express");
const fileUpload = require("multer");
const path = require("path");
const fs = require("fs");
const util = require("util");
const shell = require("shelljs");
const shellExec = util.promisify(shell.exec);
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 3000;

// Open a sqlite database in memory
let db = new sqlite3.Database(":memory:", (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Connected to the in-memory SQlite database.");
});

// Create a table for storing file names
db.run(
  "CREATE TABLE file_names (id INTEGER PRIMARY KEY, original_name TEXT)",
  (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Table created.");
  }
);

// Configure file upload
const storage = fileUpload.memoryStorage(); // Stores the file as buffer in memory
const upload = fileUpload({ storage: storage });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "upload.html"));
});

app.post("/upload", upload.single("sampleFile"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const inputBuffer = req.file.buffer;
  const inputFileName = req.file.originalname; // Get the original file name

  fs.writeFileSync(inputFileName, inputBuffer);

  // Insert file name into the database and process the file
  const insertFileName = (fileName) => {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO file_names (original_name) VALUES (?)`,
        [fileName],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  };

  try {
    // Insert the filename and get the ID
    const fileId = await insertFileName(
      path.parse(inputFileName).name + ".wav" + ".vtt"
    );
    console.log(
      "Inserted into db: " + path.parse(inputFileName).name + ".wav" + ".vtt"
    );

    // Path to whisper directory
    const whisperModelPath = path.join(__dirname, "whisper.cpp-1.5");

    await shellExec(
      `ffmpeg -i ${inputFileName} -c:a pcm_s16le -ac 1 -ar 16000 -vn -y ${
        path.parse(inputFileName).name + ".wav"
      }`
    );
    fs.unlinkSync(inputFileName);

    await shellExec(
      `${whisperModelPath}/main -m  ${whisperModelPath}/models/ggml-large.bin -f ${
        path.parse(inputFileName).name + ".wav"
      } -ml 1 --split-on-word --print-colors --output-vtt --output-json --log-score -l en -t 8`
    );

    // Send back a unique identifier (the row ID)
    res.redirect(`/download?id=${fileId}`);
  } catch (error) {
    console.log("Error during processing:", error);
    res.status(500).send("Error during processing");
  } finally {
    // Cleanup: Delete the temporary audio file if it exists
    if (fs.existsSync(path.parse(inputFileName).name + ".wav")) {
      fs.unlinkSync(path.parse(inputFileName).name + ".wav");
    }
  }
});

app.get("/processing", (req, res) => {
  res.sendFile(path.join(__dirname, "processing.html"));
});

// Serve the download page
app.get("/download", (req, res) => {
  //res.sendFile(path.join(__dirname, "download.html"));
  res.redirect(`/download-file?id=${req.query.id}`);
});

app.get("/download-file", (req, res) => {
  const fileId = req.query.id; // Get the ID from the query parameter
  console.log(fileId);

  // Retrieve the original file name from the database
  db.get(
    `SELECT original_name FROM file_names WHERE id = ?`,
    [fileId],
    (err, row) => {
      if (err) {
        return console.error(err.message);
      }
      if (row) {
        console.log(row.original_name);
        const outputFileName = row.original_name;
        const fileExtension = path.parse(row.original_name).ext;
        console.log(fileExtension);
        const nameWithoutExtension = path.parse(
          path.parse(row.original_name).name
        ).name;
        console.log(nameWithoutExtension);
        const downloadFileName =
          nameWithoutExtension + "_subtitles" + fileExtension;
        console.log(downloadFileName);

        // Send the file for download with the original file name
        res.download(outputFileName, downloadFileName, (err) => {
          if (err) {
            console.log("Error:", err);
            res.status(500).send("Error during download");
          }

          // Clean up processed file after it's downloaded
          fs.unlinkSync(outputFileName);
        });
      } else {
        res.status(404).send("File not found.");
      }
    }
  );
});

// Serve the video player
app.get("/local-video", (req, res) => {
  res.sendFile(path.join(__dirname, "local_video.html"));
});

app.get("/subtitle.vtt", (req, res) => {
  res.sendFile(path.join(__dirname, "subtitle.vtt"));
});

app.listen(port, () => {
  console.log("Server started on: " + port);
});

process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});
