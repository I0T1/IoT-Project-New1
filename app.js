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
    resetInputs();
    setupRealtimeListeners();
};

const resetInputs = () => {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
    lampStatus.textContent = "Loading...";
    motorStatus.textContent = "Loading...";
};

// Login form submission
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showSuccess("Login successful! Redirecting...");
            setTimeout(() => {
                hideMessages();
                loginContainer.style.display = "none";
                controlContainer.style.display = "block";

                // Sync initial device status
                syncInitialStatus();
            }, 1000);
        })
        .catch((error) => {
            handleAuthError(error);
        });
});

const handleAuthError = (error) => {
    const errorCode = error.code;
    let message = "An unexpected error occurred.";
    switch (errorCode) {
        case "auth/user-not-found":
            message = "User not found.";
            break;
        case "auth/wrong-password":
            message = "Incorrect password.";
            break;
        case "auth/invalid-email":
            message = "Invalid email.";
            break;
    }
    showError(message);
};

const showError = (message) => {
    errorMessage.textContent = message;
    setTimeout(() => (errorMessage.textContent = ""), 2000);
};

const showSuccess = (message) => {
    successMessage.textContent = message;
    setTimeout(() => (successMessage.textContent = ""), 2000);
};

const hideMessages = () => {
    errorMessage.textContent = "";
    successMessage.textContent = "";
};

// Toggle lamp
lampButton.addEventListener("click", () => {
    toggleDeviceStatus('/Lamp', lampStatus, (newStatus) => isLampOn = newStatus);
});

// Toggle motor
motorButton.addEventListener("click", () => {
    toggleDeviceStatus('/Ac', motorStatus, (newStatus) => isMotorOn = newStatus);
});

const toggleDeviceStatus = (path, statusElement, updateStateCallback) => {
    const newStatus = !isLampOn;
    updateDeviceStatus(path, newStatus, statusElement);
    updateStateCallback(newStatus);
};

// Update device status in Firebase and UI
const updateDeviceStatus = (path, status, statusElement) => {
    set(ref(db, path), status)
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
    if (confirm("Are you sure you want to log out?")) {
        signOut(auth)
            .then(() => {
                resetInputs();
                controlContainer.style.display = "none";
                loginContainer.style.display = "block";
                showSuccess("You have successfully logged out.");
            })
            .catch((error) => {
                console.error("Logout failed:", error.message);
            });
    }
});

// Real-time listeners for device status
const setupRealtimeListeners = () => {
    setupListener('/Lamp', lampStatus, (status) => isLampOn = status);
    setupListener('/Ac', motorStatus, (status) => isMotorOn = status);
};

const setupListener = (path, statusElement, updateStateCallback) => {
    onValue(ref(db, path), (snapshot) => {
        if (snapshot.exists()) {
            const status = snapshot.val();
            statusElement.textContent = `Status: ${status ? "On" : "Off"}`;
            updateStateCallback(status);
        } else {
            statusElement.textContent = "Status: Unknown";
        }
    });
};

// Sync initial device status
const syncInitialStatus = () => {
    setupRealtimeListeners();
};