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

window.sendManualLocation = function () {
  const vehicleNo = document.getElementById("vehicleNumber").value.trim();
  const lat = parseFloat(document.getElementById("latitude").value);
  const lng = parseFloat(document.getElementById("longitude").value);
  const status = document.getElementById("statusMessage");

  if (!vehicleNo || isNaN(lat) || isNaN(lng)) {
    alert("Please enter valid vehicle number, latitude, and longitude.");
    return;
  }

  const key = vehicleNo.replace(/\s+/g, "_");
  const locationRef = ref(database, `busLocation/${key}`);

  set(locationRef, {
    latitude: lat,
    longitude: lng,
    timestamp: Date.now()
  })
    .then(() => {
      status.textContent = "✅ Location updated successfully.";
    })
    .catch((err) => {
      console.error("Error:", err);
      status.textContent = "❌ Failed to update location.";
    });
};
