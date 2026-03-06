import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js"

import {
getAuth,
GoogleAuthProvider,
signInWithPopup,
signOut,
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js"

import {
getFirestore,
collection,
addDoc,
query,
orderBy,
onSnapshot,
deleteDoc,
doc,
serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"



const firebaseConfig = {

apiKey: "TU_API_KEY",
authDomain: "TU_DOMINIO",
projectId: "TU_PROJECT_ID"

}

const app = initializeApp(firebaseConfig)

const auth = getAuth()
const db = getFirestore()

const provider = new GoogleAuthProvider()



// LOGIN GOOGLE
window.loginGoogle = async function(){

await signInWithPopup(auth,provider)

}



// LOGOUT
window.logout = async function(){

await signOut(auth)

}



// ESTADO LOGIN
onAuthStateChanged(auth,user=>{

if(user){

document.getElementById("loginScreen").style.display="none"
document.getElementById("appScreen").style.display="block"

document.getElementById("userInfo").innerHTML = `
<img src="${user.photoURL}" class="avatar">
${user.displayName}
`

loadPosts()

}else{

document.getElementById("loginScreen").style.display="block"
document.getElementById("appScreen").style.display="none"

}

})



// CREAR POST
window.createPost = async function(){

let contenido = document.getElementById("postContent").value
let user = auth.currentUser

await addDoc(collection(db,"posts"),{

contenido:contenido,
userId:user.uid,
autorNombre:user.displayName,
autorFoto:user.photoURL,
fecha:serverTimestamp()

})

document.getElementById("postContent").value=""

}



// CARGAR POSTS
function loadPosts(){

const q = query(collection(db,"posts"),orderBy("fecha","desc"))

onSnapshot(q,snapshot=>{

let html=""

snapshot.forEach(docSnap=>{

let post = docSnap.data()

html+=`

<div class="post">

<div class="postHeader">

<img src="${post.autorFoto}" class="avatar">

<div>

<div class="postAuthor">${post.autorNombre}</div>

</div>

</div>

<div class="postContent">

${post.contenido}

</div>

<div class="postActions">

<button onclick="deletePost('${docSnap.id}')">Eliminar</button>

</div>

</div>

`

})

document.getElementById("postsContainer").innerHTML=html

})

}



// ELIMINAR
window.deletePost = async function(id){

await deleteDoc(doc(db,"posts",id))

}