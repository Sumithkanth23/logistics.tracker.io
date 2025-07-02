import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

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

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Mapbox config
mapboxgl.accessToken = 'pk.eyJ1Ijoic3VtaXRoa2FudGgwNyIsImEiOiJjbTNoaHRiMjUwYW0yMmpzOGF2bzl6NzhyIn0.ZKv6URC1WfYRAA91qfp5NA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [77.0716, 10.8874],
  zoom: 14
});

const directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'metric',
  profile: 'mapbox/driving',
  controls: { instructions: false }
});
map.addControl(directions, 'top-left');

let marker = null;

// Handle location fetch
document.getElementById("fetchLocationButton").addEventListener("click", () => {
  const vehicleNo = document.getElementById("vehicleNumber").value.trim();
  const key = vehicleNo.replace(/\s+/g, "_");

  if (!vehicleNo) {
    alert("Please enter a vehicle number.");
    return;
  }

  const refPath = ref(database, `busLocation/${key}`);
  const messageEl = document.getElementById("message");
  const etaEl = document.getElementById("eta");

  onValue(refPath, (snapshot) => {
    const data = snapshot.val();
    if (data && data.latitude && data.longitude) {
      const { latitude, longitude } = data;

      const coords = [longitude, latitude];
      if (!marker) {
        marker = new mapboxgl.Marker().setLngLat(coords).addTo(map);
      } else {
        marker.setLngLat(coords);
      }

      map.setCenter(coords);
      messageEl.textContent = "";
      directions.setOrigin(coords);
      directions.setDestination([77.07614, 11.04151]); // Example: College

      // ETA calculation
      fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};77.07614,11.04151?access_token=${mapboxgl.accessToken}`)
        .then(res => res.json())
        .then(data => {
          const duration = data.routes[0].duration;
          const mins = Math.round(duration / 60);
          etaEl.textContent = `ETA: ${mins} mins`;
        }).catch(() => {
          etaEl.textContent = "ETA: Not available";
        });
    } else {
      messageEl.textContent = "Vehicle not found or no location yet.";
      etaEl.textContent = "";
    }
  });
});

