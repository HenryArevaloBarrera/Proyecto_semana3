// Configuración de Firebase
// REEMPLAZA ESTOS VALORES CON LOS DE TU PROYECTO
const firebaseConfig = {
  apiKey: "AIzaSyDLnnmKI-xeZeqFmbVjSuLZmwAgHUzvnJM",
  authDomain: "mini-red-social-87548.firebaseapp.com",
  projectId: "mini-red-social-87548",
  storageBucket: "mini-red-social-87548.firebasestorage.app",
  messagingSenderId: "385886630604",
  appId: "1:385886630604:web:776cfb0243a0800d3f4869",
  measurementId: "G-X5YEJMLT4V"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Hacer servicios globalmente disponibles
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();
window.timestamp = firebase.firestore.FieldValue.serverTimestamp();

// Configurar persistencia
window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(error => console.error("Error de persistencia:", error));