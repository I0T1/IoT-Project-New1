import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDCCJHB2wSYboqaQfNBdpyb-szkByH12s",
    authDomain: "project-iot-22.firebaseapp.com",
    databaseURL: "https://project-iot-22-default-rtdb.firebaseio.com",
    projectId: "project-iot-22",
    storageBucket: "project-iot-22.firebasestorage.app",
    messagingSenderId: "697978289259",
    appId: "1:697978289259:web:55186ff8a1ffd720f3452e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const loginForm = document.getElementById("login-form");
const loginContainer = document.getElementById("login-container");
const controlContainer = document.getElementById("control-container");
const errorMessage = document.getElementById("error-message");
const successMessage = document.getElementById("success-message");
const lampStatus = document.getElementById("lamp-status");
const motorStatus = document.getElementById("motor-status");
const logoutButton = document.getElementById("logout-button");
const lampButton = document.getElementById("lamp-button");
const motorButton = document.getElementById("motor-button");

// Initialize states
let isLampOn = false;
let isMotorOn = false;

// Clear inputs and setup listeners on page load
window.onload = () => {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    lampStatus.textContent = "Loading...";
    motorStatus.textContent = "Loading...";
    setupRealtimeListeners();
};

// Login form submission
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            successMessage.textContent = "Login successful! Redirecting...";
            setTimeout(() => {
                successMessage.textContent = "";
                loginContainer.style.display = "none";
                controlContainer.style.display = "block";

                // Sync initial device status
                syncInitialStatus();
            }, 1000);
        })
        .catch((error) => {
            const errorCode = error.code;
            let message = "An unexpected error occurred.";
            if (errorCode === "auth/user-not-found") message = "User not found.";
            if (errorCode === "auth/wrong-password") message = "Incorrect password.";
            if (errorCode === "auth/invalid-email") message = "Invalid email.";
            errorMessage.textContent = message;
            setTimeout(() => (errorMessage.textContent = ""), 2000);
        });
});

// Toggle lamp
lampButton.addEventListener("click", () => {
    isLampOn = !isLampOn;
    updateDeviceStatus('/Lamp', isLampOn, lampStatus);
});

// Toggle motor
motorButton.addEventListener("click", () => {
    isMotorOn = !isMotorOn;
    updateDeviceStatus('/Ac', isMotorOn, motorStatus);
});

// Update device status in Firebase and UI
const updateDeviceStatus = (path, status, statusElement) => {
    const deviceRef = ref(db, path);
    set(deviceRef, status)
        .then(() => {
            statusElement.textContent = `Status: ${status ? "On" : "Off"}`;
            console.log(`${path} status updated to:`, status);
        })
        .catch((error) => {
            console.error(`Error updating ${path} status:`, error);
        });
};

// Logout with confirmation
logoutButton.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        signOut(auth)
            .then(() => {
                document.getElementById("email").value = "";
                document.getElementById("password").value = "";
                controlContainer.style.display = "none";
                loginContainer.style.display = "block";
                successMessage.textContent = "You have successfully logged out.";
                setTimeout(() => (successMessage.textContent = ""), 2000);
            })
            .catch((error) => {
                console.error("Logout failed:", error.message);
            });
    } else {
        console.log("Logout canceled by user.");
    }
});

// Real-time listeners for device status
const setupRealtimeListeners = () => {
    const lampRef = ref(db, '/Lamp');
    const motorRef = ref(db, '/Ac');

    onValue(lampRef, (snapshot) => {
        if (snapshot.exists()) {
            isLampOn = snapshot.val();
            lampStatus.textContent = `Status: ${isLampOn ? "On" : "Off"}`;
        } else {
            lampStatus.textContent = "Status: Unknown";
            console.warn("Lamp status not found.");
        }
    });

    onValue(motorRef, (snapshot) => {
        if (snapshot.exists()) {
            isMotorOn = snapshot.val();
            motorStatus.textContent = `Status: ${isMotorOn ? "On" : "Off"}`;
        } else {
            motorStatus.textContent = "Status: Unknown";
            console.warn("Motor status not found.");
        }
    });
};

// Sync initial device status
const syncInitialStatus = () => {
    const lampRef = ref(db, '/Lamp');
    const motorRef = ref(db, '/Ac');

    // Sync lamp status
    onValue(lampRef, (snapshot) => {
        if (snapshot.exists()) {
            isLampOn = snapshot.val();
            lampStatus.textContent = `Status: ${isLampOn ? "On" : "Off"}`;
        } else {
            lampStatus.textContent = "Status: Unknown";
        }
    });

    // Sync motor status
    onValue(motorRef, (snapshot) => {
        if (snapshot.exists()) {
            isMotorOn = snapshot.val();
            motorStatus.textContent = `Status: ${isMotorOn ? "On" : "Off"}`;
        } else {
            motorStatus.textContent = "Status: Unknown";
        }
    });
};
