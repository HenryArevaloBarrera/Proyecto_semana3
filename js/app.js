// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('EduConnect iniciado');
    
    // Inicializar tema
    if (typeof window.loadTheme === 'function') {
        window.loadTheme();
    }
    
    // Inicializar idioma
    if (typeof window.changeLanguage === 'function') {
        window.changeLanguage('es');
    }
    
    // Cerrar menús al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.language-selector')) {
            const langMenu = document.getElementById('lang-menu');
            if (langMenu) langMenu.classList.remove('show');
        }
    });
});