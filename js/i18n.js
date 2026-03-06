// Sistema de internacionalización
const translations = {
    es: {
        // Generales
        welcome: "Bienvenido a EduConnect",
        authSubtitle: "Comparte conocimiento con tu comunidad académica",
        continueWithGoogle: "Continuar con Google",
        or: "o",
        email: "Correo electrónico",
        password: "Contraseña",
        login: "Iniciar sesión",
        register: "Registrarse",
        logout: "Cerrar sesión",
        success: "Éxito",
        error: "Error",
        loading: "Cargando...",
        
        // Posts
        createPost: "Crear publicación",
        publish: "Publicar",
        image: "Imagen",
        video: "Video",
        file: "Archivo",
        feed: "Feed de publicaciones",
        edit: "Editar",
        delete: "Eliminar",
        like: "Me gusta",
        comment: "Comentar",
        
        // Placeholders
        postPlaceholder: "¿Qué quieres compartir hoy?",
        
        // Mensajes
        noPosts: "No hay publicaciones aún. ¡Sé el primero!",
        confirmDelete: "¿Estás seguro de que quieres eliminar esta publicación?",
        loginSuccess: "Sesión iniciada correctamente",
        logoutSuccess: "Sesión cerrada correctamente",
        
        // Tiempo
        justNow: "justo ahora",
        minutesAgo: "hace {minutes} minutos",
        hoursAgo: "hace {hours} horas",
        yesterday: "ayer",
        daysAgo: "hace {days} días"
    },
    en: {
        // General
        welcome: "Welcome to EduConnect",
        authSubtitle: "Share knowledge with your academic community",
        continueWithGoogle: "Continue with Google",
        or: "or",
        email: "Email",
        password: "Password",
        login: "Login",
        register: "Sign up",
        logout: "Logout",
        success: "Success",
        error: "Error",
        loading: "Loading...",
        
        // Posts
        createPost: "Create post",
        publish: "Publish",
        image: "Image",
        video: "Video",
        file: "File",
        feed: "Posts feed",
        edit: "Edit",
        delete: "Delete",
        like: "Like",
        comment: "Comment",
        
        // Placeholders
        postPlaceholder: "What would you like to share today?",
        
        // Messages
        noPosts: "No posts yet. Be the first!",
        confirmDelete: "Are you sure you want to delete this post?",
        loginSuccess: "Logged in successfully",
        logoutSuccess: "Logged out successfully",
        
        // Time
        justNow: "just now",
        minutesAgo: "{minutes} minutes ago",
        hoursAgo: "{hours} hours ago",
        yesterday: "yesterday",
        daysAgo: "{days} days ago"
    }
};

let currentLanguage = 'es';

// Función para cambiar idioma
window.changeLanguage = function(lang) {
    currentLanguage = lang;
    document.documentElement.lang = lang;
    
    // Actualizar textos en la interfaz
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
    
    // Actualizar placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.placeholder = translations[lang][key];
        }
    });
    
    // Actualizar selector de idioma
    const currentLangSpan = document.getElementById('current-lang');
    if (currentLangSpan) {
        currentLangSpan.textContent = lang === 'es' ? 'Español' : 'English';
    }
    
    // Marcar opción activa
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        }
    });
    
    // Cerrar menú
    const langMenu = document.getElementById('lang-menu');
    if (langMenu) langMenu.classList.remove('show');
};

// Función para obtener texto traducido
window.t = function(key, params = {}) {
    if (!translations[currentLanguage] || !translations[currentLanguage][key]) {
        return key;
    }
    
    let text = translations[currentLanguage][key];
    
    // Reemplazar parámetros
    Object.keys(params).forEach(param => {
        text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
};

// Toggle menú de idioma
window.toggleLanguageMenu = function() {
    const menu = document.getElementById('lang-menu');
    if (menu) menu.classList.toggle('show');
};