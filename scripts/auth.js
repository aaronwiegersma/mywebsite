// ============================
// Supabase Auth helper (v2)
// ============================
// 1) Fill these in from your Supabase project settings → API
// - Project URL (starts with https://xxxxxxxx.supabase.co)
// - anon public key
const SUPABASE_URL = "https://tcwznubthosvihdrvmlg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3pudWJ0aG9zdmloZHJ2bWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTIwNzcsImV4cCI6MjA3MTgyODA3N30.MYVewXJ1LIUjtLv_bdVjzvYqwu87C8gDLxWGrfj48-s";


// 2) Initialize client (global for reuse on other pages)
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// 3) Basic auth UI logic for login.html
(function(){
const form = document.getElementById('auth-form');
if (!form) return; // only run on login.html


const title = document.getElementById('auth-title');
const swap = document.getElementById('swap-mode');
const alertBox = document.getElementById('auth-alert');
const email = document.getElementById('email');
const pass = document.getElementById('password');
const reset = document.getElementById('reset-link');
const gbtn = document.getElementById('google-btn');


let mode = 'signin'; // or 'signup'


function showAlert(kind, msg){
alertBox.className = `alert ${kind}`;
alertBox.textContent = msg;
alertBox.style.display = 'block';
}
function clearAlert(){ alertBox.style.display='none'; alertBox.textContent=''; }


swap?.addEventListener('click',()=>{
mode = mode === 'signin' ? 'signup' : 'signin';
title.textContent = mode === 'signin' ? 'Welcome back' : 'Create your account';
document.querySelector('.btn.primary').textContent = mode === 'signin' ? 'Sign in' : 'Sign up';
swap.textContent = mode === 'signin' ? 'Create one' : 'I have an account';
clearAlert();
});


form.addEventListener('submit', async (e)=>{
e.preventDefault(); clearAlert();
const creds = { email: email.value.trim(), password: pass.value };
try{
if (mode === 'signin'){
const { error } = await sb.auth.signInWithPassword(creds);
if (error) throw error;
showAlert('success','Signed in! Redirecting…');
location.href = '/account.html'; // make this page next
} else {
const { error } = await sb.auth.signUp(creds);
if (error) throw error;
showAlert('success','Check your email to confirm your account.');
}
}catch(err){ showAlert('error', err.message || 'Something went wrong.'); }
});


reset?.addEventListener('click', async (e)=>{
e.preventDefault(); clearAlert();
try{
const redirectTo = location.origin + '/reset.html'; // create later
const { error } = await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo });
if (error) throw error;
showAlert('success','Reset email sent. Check your inbox.');
}catch(err){ showAlert('error', err.message || 'Unable to send reset email.'); }
});


gbtn?.addEventListener('click', async ()=>{
try{
const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + '/account.html' }});
if (error) throw error;
}catch(err){ showAlert('error', err.message || 'Google sign-in failed.'); }
}
