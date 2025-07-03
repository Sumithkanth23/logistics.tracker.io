import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "AIzaSyCaNsjn5XPnr7P6ufN10T1Ej10mNFAcBP4",
  authDomain: "tracking-application-d2060.firebaseapp.com",
  projectId: "tracking-application-d2060",
  storageBucket: "tracking-application-d2060.appspot.com",
  messagingSenderId: "401177639432",
  appId: "1:401177639432:web:1b6f9a914aa4d53efcefbd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

window.login = function () {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const errorDisplay = document.getElementById("loginError");

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      window.location.href = "tracking.html";
    })
    .catch(error => {
      errorDisplay.textContent = "Login failed: " + error.message;
    });
};
