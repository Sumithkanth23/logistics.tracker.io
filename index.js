// Firebase & Mapbox Integration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

// Firebase Config
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
const auth = getAuth(app);

// 🔐 Authentication check
onAuthStateChanged(auth, (user) => {
  if (!user) {
    document.body.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column;">
        <h2>You are not logged in</h2>
        <p>Please log in to access tracking features.</p>
        <a href="login.html">
          <button style="padding: 10px 20px; font-size: 16px;">Go to Login</button>
        </a>
      </div>
    `;
  }
});

// Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1Ijoic3VtaXRoa2FudGgwNyIsImEiOiJjbTNoaHRiMjUwYW0yMmpzOGF2bzl6NzhyIn0.ZKv6URC1WfYRAA91qfp5NA';

// Initialize Map
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [77.0716, 10.8874], // Initial center
  zoom: 14
});

// Directions plugin
const directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'metric',
  profile: 'mapbox/driving',
  controls: { instructions: false }
});
map.addControl(directions, 'top-left');

// Bus Marker
const marker = new mapboxgl.Marker({
  element: createBusMarkerElement('https://img.icons8.com/ios/452/bus.png')
})
.setLngLat([0, 0])
.addTo(map);

// Create custom bus marker
function createBusMarkerElement(iconUrl) {
  const busElement = document.createElement('div');
  busElement.style.width = '40px';
  busElement.style.height = '40px';
  busElement.style.backgroundImage = `url(${iconUrl})`;
  busElement.style.backgroundSize = 'contain';
  busElement.style.backgroundPosition = 'center';
  busElement.style.backgroundRepeat = 'no-repeat';
  return busElement;
}

// Fetch location logic
document.getElementById('fetchLocationButton').addEventListener('click', () => {
  const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
  const messageEl = document.getElementById('message');
  const etaEl = document.getElementById('eta');

  if (!vehicleNumber) {
    alert("Please enter a vehicle number.");
    return;
  }

  const locationRef = ref(database, `busLocation/${vehicleNumber}`);

  onValue(locationRef, (snapshot) => {
    const data = snapshot.val();

    if (data && data.latitude && data.longitude) {
      const { latitude, longitude } = data;

      marker.setLngLat([longitude, latitude]);
      map.setCenter([longitude, latitude]);

      directions.setOrigin([longitude, latitude]);
      directions.setDestination([77.07614, 11.04151]); // SIET endpoint
      fetchETA([longitude, latitude], [77.07614, 11.04151]);
      messageEl.textContent = '';
    } else {
      messageEl.textContent = "Vehicle location not available.";
      etaEl.textContent = '';
    }
  });
});

// Fetch ETA from Mapbox API
function fetchETA(origin, destination) {
  const etaEl = document.getElementById('eta');
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${mapboxgl.accessToken}&alternatives=false&geometries=geojson&steps=false`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const duration = data.routes[0].duration;
      const minutes = Math.round(duration / 60);
      etaEl.textContent = `ETA: ${minutes} minute(s)`;
    })
    .catch(err => {
      console.error('ETA error:', err);
      etaEl.textContent = 'Unable to calculate ETA';
    });
}
