import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

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

// Initialize states
let isLampOn = false;
let isMotorOn = false;

// Clear inputs on page load
window.onload = () => {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
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
document.getElementById("lamp-button").addEventListener("click", () => {
    isLampOn = !isLampOn;
    lampStatus.textContent = `Status: ${isLampOn ? "On" : "Off"}`;

    // Update lamp status in Firebase
    const lampRef = ref(db, '/Lamp');
    set(lampRef, isLampOn)
        .then(() => console.log("Lamp status updated to:", isLampOn))
        .catch((error) => console.error("Error updating lamp status:", error));
});

// Toggle motor
document.getElementById("motor-button").addEventListener("click", () => {
    isMotorOn = !isMotorOn;
    motorStatus.textContent = `Status: ${isMotorOn ? "On" : "Off"}`;

    // Update motor status in Firebase
    const motorRef = ref(db, '/Ac');
    set(motorRef, isMotorOn)
        .then(() => console.log("Motor status updated to:", isMotorOn))
        .catch((error) => console.error("Error updating motor status:", error));
});

// Logout with confirmation
logoutButton.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        signOut(auth)
            .then(() => {
                // Clear the input fields
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

// Function to get initial values from Firebase and set the UI accordingly
const getInitialDeviceStatus = () => {
    const lampRef = ref(db, '/Lamp');
    get(lampRef).then((snapshot) => {
        if (snapshot.exists()) {
            isLampOn = snapshot.val();
            lampStatus.textContent = `Status: ${isLampOn ? "On" : "Off"}`;
        } else {
            console.log("Lamp status not found in database.");
        }
    });

    const motorRef = ref(db, '/Ac');
    get(motorRef).then((snapshot) => {
        if (snapshot.exists()) {
            isMotorOn = snapshot.val();
            motorStatus.textContent = `Status: ${isMotorOn ? "On" : "Off"}`;
        } else {
            console.log("Motor status not found in database.");
        }
    });
};

// Call this function when the page loads to set the initial states
window.onload = () => {
    getInitialDeviceStatus();
};
