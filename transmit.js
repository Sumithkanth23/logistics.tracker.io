import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCaNsjn5XPnr7P6ufN10T1Ej10mNFAcBP4",
  authDomain: "tracking-application-d2060.firebaseapp.com",
  databaseURL: "https://tracking-application-d2060-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tracking-application-d2060",
  storageBucket: "tracking-application-d2060.appspot.com",
  messagingSenderId: "401177639432",
  appId: "1:401177639432:web:1b6f9a914aa4d53efcefbd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let intervalId;

window.startSendingVehicleNumber = function () {
  const vehicleNo = document.getElementById("vehicleNumber").value.trim();
  const status = document.getElementById("statusMessage");

  if (!vehicleNo) {
    alert("Please enter a vehicle number.");
    return;
  }

  clearInterval(intervalId);

  intervalId = setInterval(() => {
    const timestamp = Date.now();
    const safePath = vehicleNo.replace(/\s+/g, "_");
    const vehicleRef = ref(database, `vehicles/${safePath}`);

    set(vehicleRef, {
      vehicleNumber: vehicleNo,
      updatedAt: timestamp
    }).then(() => {
      console.log("Vehicle number updated");
    }).catch((error) => {
      console.error("Error updating vehicle number:", error);
    });
  }, 3000);

  document.getElementById("startButton").disabled = true;
  document.getElementById("stopButton").style.display = "inline-block";
  status.textContent = "Sending vehicle number every 3 seconds...";
};

window.stopSending = function () {
  clearInterval(intervalId);
  document.getElementById("startButton").disabled = false;
  document.getElementById("stopButton").style.display = "none";
  document.getElementById("statusMessage").textContent = "Stopped sending.";
};
