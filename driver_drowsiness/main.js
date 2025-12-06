const video = document.getElementById("webcam");
const canvas = document.getElementById("overlay");
const ctx = canvas.getContext("2d");
const statusText = document.getElementById("status");
const startBtn = document.getElementById("startBtn");
const alarm = new Audio('assets/alarm.mp3');
alarm.loop = true;

let calibrating = false, detecting = false, alarmOn = false;
let calibrationData = [], closedFrames = 0;
let EAR_THRESHOLD = 0.25, CONSEC_FRAMES = 15;

const leftEye = [33, 160, 158, 133, 153, 144];
const rightEye = [263, 387, 385, 362, 380, 373];

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function calcEAR(eye) {
  return (dist(eye[1], eye[5]) + dist(eye[2], eye[4])) / (2 * dist(eye[0], eye[3]));
}

startBtn.onclick = () => {
  if (calibrating || detecting) return;
  calibrating = true;
  calibrationData = [];
  statusText.innerText = "Calibrating... Keep eyes open.";
  statusText.style.color = "blue";

  setTimeout(() => {
    calibrating = false;
    if (calibrationData.length > 0) {
      const avg = calibrationData.reduce((a, b) => a + b) / calibrationData.length;
      EAR_THRESHOLD = avg * 0.75;
      detecting = true;
      statusText.innerText = "Calibration done! Detection started.";
      statusText.style.color = "green";
    } else {
      statusText.innerText = "Calibration failed. Try again.";
      statusText.style.color = "red";
    }
  }, 5000);
};

function handleResults(results) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

  if (!results.multiFaceLandmarks?.length) return;
  const lm = results.multiFaceLandmarks[0];
  const left = leftEye.map(i => lm[i]);
  const right = rightEye.map(i => lm[i]);
  const ear = (calcEAR(left) + calcEAR(right)) / 2;

  ctx.fillStyle = "yellow";
  ctx.font = "18px Arial";
  ctx.fillText(`EAR: ${ear.toFixed(3)}`, 10, 30);

  if (calibrating) {
    calibrationData.push(ear);
  } else if (detecting) {
    if (ear < EAR_THRESHOLD) {
      closedFrames++;
      if (closedFrames >= CONSEC_FRAMES && !alarmOn) {
        alarm.play();
        alarmOn = true;
        statusText.innerText = "Status: Drowsy! Wake up!";
        statusText.style.color = "red";
      }
    } else {
      closedFrames = 0;
      if (alarmOn) {
        alarm.pause(); alarm.currentTime = 0; alarmOn = false;
      }
      statusText.innerText = "Status: Awake";
      statusText.style.color = "green";
    }
  }
}

const faceMesh = new FaceMesh({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
});
faceMesh.setOptions({
  maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7
});
faceMesh.onResults(handleResults);

const camera = new Camera(video, {
  onFrame: async () => await faceMesh.send({ image: video }),
  width: 640, height: 480
});
camera.start();

video.onloadedmetadata = () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
};
