#  AI Subtitle Generator and Editor

## Introduction
This project aims to develop a browser-based application that utilizes OpenAI's Whisper model to generate high-quality transcripts and video subtitle files. The goal is to enhance accessibility by making it easier to make and edit captions. Another goal is ensuring privacy by processing data locally (still an in-progress feature), while also offering an option for server-based processing for faster results. Completed for CPSC 491 at CSUF. 

## Features
- Automatic transcription/subtitle generation using OpenAI's Whisper model.
- User-friendly interface for uploading videos and editing subtitles.
- Exporting VTT subtitle files.

## Getting Started

### Prerequisites
- Node.js
- A modern web browser, only tested on Chrome

### Installation
1. Clone the repository:
```
git clone https://github.com/SoundandPicture/CPSC491_AI_Subtitle_Editor
```

3. Navigate to the project directory:
```
cd ai_subtitle
```
3. Install dependencies:
```
npm run download
```
```
npm install
```
4. whisper.cpp setup. Installation instructions avaiable on their [repo](https://github.com/ggerganov/whisper.cpp).

### Running the Application
Start the application by running:
```
npm start
```
The application will be available at `http://localhost:8080`.

## Usage
- **Uploading Videos**: Use the 'Choose File' component to upload your video.
- **Generating Subtitles**: This process will initiate as soon as the video is selected.
- **Editing Subtitles**: Use the Subtitle Editor to make any necessary adjustments.
- **Exporting Videos**: Once editing is complete, use the ExportVTT button to download the subtitle file.

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
For any queries, please contact me at jason@realitysupply.com

## Acknowledgments
- OpenAI's Whisper Model
- whisper.cpp
- ffmpeg.wasm
- peaks.js
