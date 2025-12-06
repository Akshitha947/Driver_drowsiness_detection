# Driver Drowsiness Detection – Web App

A lightweight browser-based application that detects driver drowsiness in real time using JavaScript, MediaPipe Face Mesh, and Eye Aspect Ratio (EAR). The system continuously tracks the user’s eye movements through the webcam and triggers alerts when signs of fatigue or eye closure are detected.

# Features

* Real-time face and eye tracking using MediaPipe
* Calculates Eye Aspect Ratio (EAR) to detect drowsiness
* Visual indicators for eye status
* Audio alert when drowsiness is detected
* Fully runs in the browser — no backend required

# Tech Stack

HTML, CSS, JavaScript
MediaPipe Face Mesh for eye landmark detection
Webcam API for live video input

# How It Works

User allows webcam access.
MediaPipe Face Mesh tracks facial landmarks.
The Eye Aspect Ratio (EAR) is calculated on every frame.
If EAR drops below a threshold for a continuous duration, the system triggers an alert sound.
