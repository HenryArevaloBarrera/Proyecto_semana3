// Autenticación con Google
window.signInWithGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });
    
    window.auth.signInWithPopup(provider)
        .then(result => {
            showNotification(t('success'), t('loginSuccess'), 'success');
        })
        .catch(error => {
            console.error('Error en autenticación con Google:', error);
            showNotification(t('error'), error.message, 'error');
        });
};

// Autenticación con email
window.handleEmailAuth = function(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const action = event.submitter.value;
    
    if (action === 'login') {
        window.auth.signInWithEmailAndPassword(email, password)
            .catch(error => {
                showNotification(t('error'), error.message, 'error');
            });
    } else {
        window.auth.createUserWithEmailAndPassword(email, password)
            .catch(error => {
                showNotification(t('error'), error.message, 'error');
            });
    }
};

// Cerrar sesión
window.logout = function() {
    window.auth.signOut()
        .then(() => {
            showNotification(t('success'), t('logoutSuccess'), 'success');
        })
        .catch(error => {
            showNotification(t('error'), error.message, 'error');
        });
};

// Observer de estado de autenticación
window.auth.onAuthStateChanged(user => {
    const authSection = document.getElementById('auth-section');
    const appSection = document.getElementById('app-section');
    
    if (user) {
        // Usuario autenticado
        if (authSection) authSection.style.display = 'none';
        if (appSection) appSection.classList.remove('hidden');
        
        // Actualizar información del usuario
        const userNameEl = document.getElementById('user-name');
        const userEmailEl = document.getElementById('user-email');
        const userAvatarEl = document.getElementById('user-avatar');
        const postAuthorAvatarEl = document.getElementById('post-author-avatar');
        
        if (userNameEl) userNameEl.textContent = user.displayName || user.email.split('@')[0];
        if (userEmailEl) userEmailEl.textContent = user.email;
        if (userAvatarEl) userAvatarEl.src = user.photoURL || 'https://via.placeholder.com/40';
        if (postAuthorAvatarEl) postAuthorAvatarEl.src = user.photoURL || 'https://via.placeholder.com/32';
        
        // Cargar posts
        if (typeof window.loadPosts === 'function') {
            window.loadPosts();
        }
    } else {
        // Usuario no autenticado
        if (authSection) authSection.style.display = 'flex';
        if (appSection) appSection.classList.add('hidden');
    }
});