// ===== VARIABLES GLOBALES DEL MODAL =====
let currentEditingPostId = null;
let currentModalMediaFile = null;
let currentModalMediaType = null;

// ===== FUNCIONES DEL MODAL =====

// Abrir modal para crear post
window.openCreatePostModal = function() {
    currentEditingPostId = null;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> ' + t('createPost');
    document.getElementById('modal-post-content').value = '';
    document.getElementById('modal-author-name').textContent = window.auth.currentUser?.displayName || window.auth.currentUser?.email?.split('@')[0] || '';
    clearModalMedia();
    document.getElementById('post-modal').classList.remove('hidden');
};

// Abrir modal para editar post
window.openEditPostModal = function(postId, content, mediaData) {
    currentEditingPostId = postId;
    document.getElementById('modal-title').innerHTML = '<i class="fas fa-edit"></i> ' + t('edit');
    document.getElementById('modal-post-content').value = content || '';
    document.getElementById('modal-author-name').textContent = window.auth.currentUser?.displayName || window.auth.currentUser?.email?.split('@')[0] || '';
    
    // Si hay media existente, mostrar preview
    if (mediaData) {
        showExistingMediaPreview(mediaData);
    } else {
        clearModalMedia();
    }
    
    document.getElementById('post-modal').classList.remove('hidden');
};

// Cerrar modal
window.closePostModal = function() {
    document.getElementById('post-modal').classList.add('hidden');
    currentEditingPostId = null;
    clearModalMedia();
};

// Guardar post (crear o editar)
window.savePost = async function() {
    const content = document.getElementById('modal-post-content').value;
    const user = window.auth.currentUser;
    
    if (!user) {
        showNotification(t('error'), 'Debes iniciar sesión', 'error');
        return;
    }
    
    if (!content.trim() && !currentModalMediaFile) {
        showNotification(t('error'), 'Escribe algo o adjunta un archivo', 'error');
        return;
    }
    
    try {
        let mediaData = null;
        
        // Si hay nuevo archivo multimedia
        if (currentModalMediaFile) {
            // Subir a Storage
            mediaData = await uploadFileToStorage(currentModalMediaFile, user.uid);
        }
        
        if (currentEditingPostId) {
            // EDITAR post existente
            const updateData = {
                contenido: content,
                editado: true,
                fechaEdicion: window.timestamp
            };
            
            // Si hay nuevo media, actualizarlo
            if (mediaData) {
                // Eliminar media anterior si existe
                const oldPost = await window.db.collection('posts').doc(currentEditingPostId).get();
                const oldData = oldPost.data();
                if (oldData.media && oldData.media.path) {
                    try {
                        const oldFileRef = window.storage.ref(oldData.media.path);
                        await oldFileRef.delete();
                    } catch (e) {
                        console.log('No se pudo eliminar archivo anterior:', e);
                    }
                }
                
                updateData.media = mediaData;
            }
            
            await window.db.collection('posts').doc(currentEditingPostId).update(updateData);
            showNotification(t('success'), 'Publicación actualizada', 'success');
            
        } else {
            // CREAR nuevo post
            const postData = {
                contenido: content,
                userId: user.uid,
                autorNombre: user.displayName || user.email.split('@')[0],
                autorEmail: user.email,
                autorAvatar: user.photoURL || 'https://www.gravatar.com/avatar/?d=mp&s=40',
                fecha: window.timestamp,
                likes: [],
                likesCount: 0,
                editado: false,
                media: mediaData
            };
            
            await window.db.collection('posts').add(postData);
            showNotification(t('success'), 'Publicación creada', 'success');
        }
        
        closePostModal();
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(t('error'), error.message, 'error');
    }
};

// ===== FUNCIONES PARA SUBIR ARCHIVOS =====

// Subir archivo a Storage
async function uploadFileToStorage(file, userId) {
    return new Promise((resolve, reject) => {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const storageRef = window.storage.ref();
        const fileRef = storageRef.child(`posts/${userId}/${fileName}`);
        
        const metadata = {
            contentType: file.type,
            customMetadata: {
                uploadedBy: userId,
                uploadedAt: new Date().toISOString(),
                originalName: file.name
            }
        };
        
        const uploadTask = fileRef.put(file, metadata);
        
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Subiendo: ${progress}%`);
            },
            (error) => {
                reject(error);
            },
            async () => {
                const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                
                resolve({
                    url: downloadURL,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    path: fileRef.fullPath,
                    mediaType: getMediaType(file.type)
                });
            }
        );
    });
}

// Determinar tipo de media
function getMediaType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    return 'file';
}

// ===== FUNCIONES PARA MANEJO DE ARCHIVOS EN MODAL =====

window.triggerModalImageUpload = function() {
    document.getElementById('modal-image-upload').click();
};

window.triggerModalVideoUpload = function() {
    document.getElementById('modal-video-upload').click();
};

window.triggerModalAudioUpload = function() {
    document.getElementById('modal-audio-upload').click();
};

window.handleModalImageUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) { // 10MB
        showNotification('Error', 'La imagen es muy grande. Máximo 10MB', 'error');
        return;
    }
    
    currentModalMediaFile = file;
    currentModalMediaType = 'image';
    
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('modal-preview-content').innerHTML = 
            `<img src="${e.target.result}" alt="Preview">`;
        document.getElementById('modal-media-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
};

window.handleModalVideoUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
        showNotification('Error', 'El video es muy grande. Máximo 50MB', 'error');
        return;
    }
    
    currentModalMediaFile = file;
    currentModalMediaType = 'video';
    
    const url = URL.createObjectURL(file);
    document.getElementById('modal-preview-content').innerHTML = 
        `<video src="${url}" controls></video>`;
    document.getElementById('modal-media-preview').classList.remove('hidden');
};

window.handleModalAudioUpload = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 20 * 1024 * 1024) { // 20MB
        showNotification('Error', 'El audio es muy grande. Máximo 20MB', 'error');
        return;
    }
    
    currentModalMediaFile = file;
    currentModalMediaType = 'audio';
    
    const url = URL.createObjectURL(file);
    document.getElementById('modal-preview-content').innerHTML = `
        <div class="audio-player">
            <i class="fas fa-music"></i>
            <audio src="${url}" controls></audio>
            <span class="audio-info">${file.name}</span>
        </div>
    `;
    document.getElementById('modal-media-preview').classList.remove('hidden');
};

window.clearModalMedia = function() {
    currentModalMediaFile = null;
    currentModalMediaType = null;
    document.getElementById('modal-media-preview').classList.add('hidden');
    document.getElementById('modal-preview-content').innerHTML = '';
    
    // Limpiar inputs
    ['modal-image-upload', 'modal-video-upload', 'modal-audio-upload'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
};

// Mostrar preview de media existente (para edición)
function showExistingMediaPreview(mediaData) {
    if (!mediaData) return;
    
    let html = '';
    if (mediaData.mediaType === 'image') {
        html = `<img src="${mediaData.url}" alt="Preview">`;
    } else if (mediaData.mediaType === 'video') {
        html = `<video src="${mediaData.url}" controls></video>`;
    } else if (mediaData.mediaType === 'audio') {
        html = `
            <div class="audio-player">
                <i class="fas fa-music"></i>
                <audio src="${mediaData.url}" controls></audio>
                <span class="audio-info">${mediaData.name}</span>
            </div>
        `;
    }
    
    if (html) {
        document.getElementById('modal-preview-content').innerHTML = html;
        document.getElementById('modal-media-preview').classList.remove('hidden');
    }
}

// ===== FUNCIONES PARA CARGAR Y MOSTRAR POSTS =====

window.loadPosts = function() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    postsList.innerHTML = `<div class="loading">${t('loading')}</div>`;
    
    window.db.collection('posts')
        .orderBy('fecha', 'desc')
        .onSnapshot(snapshot => {
            if (snapshot.empty) {
                postsList.innerHTML = `<div class="no-posts">${t('noPosts')}</div>`;
                return;
            }
            
            let postsHTML = '';
            snapshot.forEach(doc => {
                const post = doc.data();
                const postId = doc.id;
                const isOwner = window.auth.currentUser && window.auth.currentUser.uid === post.userId;
                
                postsHTML += createPostHTML(post, postId, isOwner);
            });
            
            postsList.innerHTML = postsHTML;
            
        }, error => {
            console.error('Error al cargar posts:', error);
            postsList.innerHTML = `<div class="error">${t('error')}: ${error.message}</div>`;
        });
};

// Crear HTML del post
function createPostHTML(post, postId, isOwner) {
    const fecha = post.fecha ? formatDate(post.fecha.toDate()) : t('justNow');
    const editadoHTML = post.editado ? '<span class="editado-badge"> (editado)</span>' : '';
    const mediaHTML = post.media ? getMediaHTML(post.media) : '';
    
    return `
        <article class="post-card" data-post-id="${postId}">
            <div class="post-header">
                <img class="post-author-avatar" src="${post.autorAvatar || 'https://www.gravatar.com/avatar/?d=mp&s=40'}" alt="Avatar">
                <div class="post-author-info">
                    <span class="post-author-name">${escapeHTML(post.autorNombre)}</span>
                    <span class="post-date">${fecha}${editadoHTML}</span>
                </div>
            </div>
            
            <div class="post-content">
                ${post.contenido ? `<p class="post-text">${escapeHTML(post.contenido)}</p>` : ''}
                ${mediaHTML}
            </div>
            
            <div class="post-footer">
                ${isOwner ? `
                    <div class="post-owner-actions">
                        <button class="post-action edit-btn" onclick="window.editPost('${postId}')">
                            <i class="fas fa-edit"></i>
                            <span>${t('edit')}</span>
                        </button>
                        <button class="post-action delete-btn" onclick="window.deletePost('${postId}')">
                            <i class="fas fa-trash"></i>
                            <span>${t('delete')}</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        </article>
    `;
}

// Obtener HTML para multimedia
function getMediaHTML(media) {
    if (!media) return '';
    
    if (media.mediaType === 'image') {
        return `<div class="post-media"><img src="${media.url}" alt="${escapeHTML(media.name)}" loading="lazy"></div>`;
    } else if (media.mediaType === 'video') {
        return `<div class="post-media"><video src="${media.url}" controls></video></div>`;
    } else if (media.mediaType === 'audio') {
        return `
            <div class="post-media audio-player">
                <i class="fas fa-music"></i>
                <audio src="${media.url}" controls></audio>
                <span class="audio-info">${escapeHTML(media.name)}</span>
            </div>
        `;
    }
    return '';
}

// ===== FUNCIONES CRUD =====

// Editar post
window.editPost = async function(postId) {
    try {
        const postDoc = await window.db.collection('posts').doc(postId).get();
        const post = postDoc.data();
        
        // Verificar que sea el propietario
        if (post.userId !== window.auth.currentUser?.uid) {
            showNotification(t('error'), 'No tienes permiso para editar este post', 'error');
            return;
        }
        
        openEditPostModal(postId, post.contenido, post.media);
        
    } catch (error) {
        console.error('Error al cargar post para editar:', error);
        showNotification(t('error'), error.message, 'error');
    }
};

// Eliminar post
window.deletePost = async function(postId) {
    if (!confirm(t('confirmDelete'))) return;
    
    try {
        const postDoc = await window.db.collection('posts').doc(postId).get();
        const post = postDoc.data();
        
        // Verificar que sea el propietario
        if (post.userId !== window.auth.currentUser?.uid) {
            showNotification(t('error'), 'No tienes permiso para eliminar este post', 'error');
            return;
        }
        
        // Eliminar archivo multimedia si existe
        if (post.media && post.media.path) {
            try {
                const fileRef = window.storage.ref(post.media.path);
                await fileRef.delete();
            } catch (e) {
                console.log('No se pudo eliminar archivo:', e);
            }
        }
        
        // Eliminar el documento
        await window.db.collection('posts').doc(postId).delete();
        
        showNotification(t('success'), 'Publicación eliminada', 'success');
        
    } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification(t('error'), error.message, 'error');
    }
};

// ===== FUNCIONES AUXILIARES =====

// Formatear fecha
function formatDate(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return t('justNow');
    if (diffMins < 60) return t('minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return t('hoursAgo', { hours: diffHours });
    if (diffDays === 1) return t('yesterday');
    if (diffDays < 7) return t('daysAgo', { days: diffDays });
    
    // Si es más de una semana, mostrar fecha formateada
    return date.toLocaleDateString();
}

// Escapar HTML
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Mostrar notificación
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = type === 'error' ? '#ef4444' : '#10b981';
    notification.style.color = 'white';
    notification.style.padding = '1rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.style.animation = 'slideIn 0.3s ease';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Hacer showNotification global
window.showNotification = showNotification;