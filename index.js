import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js';

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
const auth = getAuth(app);
const database = getDatabase(app);

// Authentication check
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById('tracking-ui').style.display = 'block';
    document.getElementById('user-name').textContent = user.displayName || 'User';
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-phone').textContent = user.phoneNumber || 'N/A';
    initMapbox();
  } else {
    document.getElementById('not-logged-in').style.display = 'block';
  }
});

// Profile toggle
document.getElementById('profileBtn').addEventListener('click', () => {
  const menu = document.getElementById('profileMenu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  auth.signOut().then(() => {
    window.location.href = 'login.html';
  });
});

// Map + Tracking
function initMapbox() {
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

  const marker = new mapboxgl.Marker({
    element: createBusMarker('https://img.icons8.com/ios/452/bus.png')
  }).setLngLat([0, 0]).addTo(map);

  function createBusMarker(iconUrl) {
    const div = document.createElement('div');
    div.style.width = '40px';
    div.style.height = '40px';
    div.style.backgroundImage = `url(${iconUrl})`;
    div.style.backgroundSize = 'contain';
    return div;
  }

  document.getElementById('fetchLocationButton').addEventListener('click', () => {
    const vehicleNumber = document.getElementById('vehicleNumber').value.trim();
    if (!vehicleNumber) return alert("Enter vehicle number");

    const locationRef = ref(database, `busLocation/${vehicleNumber}`);
    onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.latitude && data?.longitude) {
        const { latitude, longitude } = data;
        marker.setLngLat([longitude, latitude]);
        map.setCenter([longitude, latitude]);
        directions.setOrigin([longitude, latitude]);
        directions.setDestination([77.07614, 11.04151]);
        fetchETA([longitude, latitude], [77.07614, 11.04151]);
        document.getElementById("message").textContent = "";
      } else {
        document.getElementById("message").textContent = "Vehicle location not available.";
        document.getElementById("eta").textContent = "";
      }
    });
  });

  function fetchETA(origin, destination) {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?access_token=${mapboxgl.accessToken}&steps=false`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const mins = Math.round(data.routes[0].duration / 60);
        document.getElementById('eta').textContent = `ETA: ${mins} min`;
      })
      .catch(() => {
        document.getElementById('eta').textContent = "Unable to calculate ETA";
      });
  }
}
