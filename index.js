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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Mapbox
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

const busIconUrl = 'https://img.icons8.com/ios/452/bus.png';
const marker = new mapboxgl.Marker({
  element: createBusMarker(busIconUrl)
})
  .setLngLat([0, 0])
  .addTo(map);

function createBusMarker(iconUrl) {
  const el = document.createElement('div');
  el.style.width = '40px';
  el.style.height = '40px';
  el.style.backgroundImage = `url(${iconUrl})`;
  el.style.backgroundSize = 'contain';
  return el;
}

function fetchBusLocation() {
  const vehicleNumber = document.getElementById("vehicleNumber").value.trim();
  const key = vehicleNumber.replace(/\s+/g, '_');

  const messageEl = document.getElementById("message");
  const etaEl = document.getElementById("eta");

  if (!vehicleNumber) {
    alert("Please enter a vehicle number.");
    return;
  }

  const refPath = ref(database, `busLocation/${key}`);
  onValue(refPath, (snapshot) => {
    const data = snapshot.val();

    if (data && data.latitude && data.longitude) {
      const { latitude, longitude } = data;
      marker.setLngLat([longitude, latitude]);
      map.setCenter([longitude, latitude]);
      directions.setOrigin([longitude, latitude]);
      directions.setDestination([77.07614, 11.04151]);
      fetchETA([longitude, latitude], [77.07614, 11.04151]);

      messageEl.textContent = "";
    } else {
      messageEl.textContent = "Vehicle location not found.";
    }
  });
}

function fetchETA(origin, destination) {
  const etaEl = document.getElementById("eta");
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${mapboxgl.accessToken}&alternatives=false&geometries=geojson&steps=false`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const seconds = data.routes[0]?.duration;
      if (seconds) {
        etaEl.textContent = `ETA: ${Math.round(seconds / 60)} minutes`;
      } else {
        etaEl.textContent = "ETA not available";
      }
    })
    .catch(err => {
      console.error("ETA error:", err);
      etaEl.textContent = "ETA error";
    });
}

document.getElementById("fetchLocationButton").addEventListener("click", fetchBusLocation);
