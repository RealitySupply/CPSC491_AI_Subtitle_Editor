const path = require("path");
const fs = require('fs');
const fsPromises = require('fs').promises;
const express = require("express");
const multer = require("multer");
const shell = require("shelljs");
const util = require("util");
const shellExec = util.promisify(shell.exec);

const app = express();
const PORT = 8080;

// Path to whisper directory and transcripts directory
const whisperModelPath = path.join(__dirname, "whisper.cpp-1.5.1");
const transcriptsDir = path.join(__dirname, "transcripts");

app.use((_, res, next) => {
  res.append("Cross-Origin-Opener-Policy", "same-origin");
  res.append("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + ".wav");
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("audioFile"), async function (req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const jsonFilePath = await transcribeAudioFile(req.file.path);

    // Send the JSON file as a response
    res.sendFile(jsonFilePath, {}, async function (err) {
      if (err) {
        console.log(err);
        res.status(500).send("Error sending the file.");
      } else {
        // Delete the original WAV file and the JSON file from the server after sending
        await fsPromises.unlink(req.file.path);
        await fsPromises.unlink(jsonFilePath);
      }
    });
  } catch (error) {
    console.error("Error in transcription:", error);
    res.status(500).send("Error processing the file.");
  }
});

async function transcribeAudioFile(filePath) {
  const outputFileName = path.parse(filePath).name;
  const outputFilePath = path.join(transcriptsDir, outputFileName);

  try {
    // Run whisper command
    await shellExec(
      `${whisperModelPath}/main -m ${whisperModelPath}/models/ggml-large-v2.bin -f ${filePath} --print-colors --output-json --output-file ${outputFilePath} -l en -t 8`
    );

    // Check if the file exists
    if (fs.existsSync(outputFilePath + ".json")) {
      return outputFilePath + ".json";
    } else {
      throw new Error("JSON file was not created");
    }
  } catch (error) {
    console.error("Error in transcribing audio file:", error);
    throw error;
  }
}

// Serve static files from 'public' directory
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
