// ===== Supabase Auth (minimal) =====

// 1) Fill in your project details from Supabase → Project Settings → API
const SUPABASE_URL = "https://tcwznubthosvihdrvmlg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjd3pudWJ0aG9zdmloZHJ2bWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTIwNzcsImV4cCI6MjA3MTgyODA3N30.MYVewXJ1LIUjtLv_bdVjzvYqwu87C8gDLxWGrfj48-s";


// 2) Init client
window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Utility: small delay
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 3) Require auth on protected pages (DO NOT call this on /login.html)
window.requireAuth = async function requireAuth() {
  // If we’re on the login page, never redirect
  if (location.pathname.endsWith("/login.html")) return;

  // Try immediately
  let { data: { session } } = await sb.auth.getSession();
  if (session) return session;

  // Give the client a moment to hydrate persisted session
  await sleep(250);
  ({ data: { session } } = await sb.auth.getSession());
  if (session) return session;

  // Still no session → go to login with return URL
  const next = encodeURIComponent(location.pathname + location.search + location.hash);
  location.href = `/login.html?next=${next}`;
};

// 4) Sign out helper
window.signOut = async function() {
  await sb.auth.signOut();
  location.href = "/login.html";
};

// 5) Login page logic (runs only on /login.html)
(function () {
  if (!location.pathname.endsWith("/login.html")) return;

  const form = document.getElementById("auth-form");
  if (!form) return;

  const alertBox = document.getElementById("auth-alert");
  const email = document.getElementById("email");
  const pass = document.getElementById("password");
  const swap = document.getElementById("swap-btn");
  const submitBtn = document.getElementById("submit-btn");
  const reset = document.getElementById("reset-link");
  const params = new URLSearchParams(location.search);
  const next = params.get("next") || "/account.html";

  // If already logged in, skip the form
  sb.auth.getSession().then(({ data: { session } }) => {
    if (session) location.replace(next);
  });

  let mode = "signin";
  function show(kind, msg) {
    alertBox.style.display = "block";
    alertBox.style.padding = ".7rem 1rem";
    alertBox.style.borderRadius = "10px";
    alertBox.style.margin = "0 0 .75rem";
    if (kind === "error") {
      alertBox.style.background = "#fef2f2";
      alertBox.style.border = "1px solid #fecaca";
      alertBox.style.color = "#991b1b";
    } else {
      alertBox.style.background = "#ecfdf5";
      alertBox.style.border = "1px solid #bbf7d0";
      alertBox.style.color = "#065f46";
    }
    alertBox.textContent = msg;
  }
  function clearMsg() { alertBox.style.display = "none"; alertBox.textContent = ""; }

  swap.addEventListener("click", () => {
    mode = mode === "signin" ? "signup" : "signin";
    submitBtn.textContent = mode === "signin" ? "Sign in" : "Sign up";
    swap.textContent = mode === "signin" ? "Create an account" : "I have an account";
    clearMsg();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMsg();
    try {
      const creds = { email: email.value.trim(), password: pass.value };
      if (mode === "signin") {
        const { error } = await sb.auth.signInWithPassword(creds);
        if (error) throw error;
        show("success", "Signed in. Redirecting…");
        location.replace(next);
      } else {
        const { error } = await sb.auth.signUp(creds);
        if (error) throw error;
        show("success", "Check your email to confirm your account.");
      }
    } catch (err) {
      show("error", err.message || "Unable to authenticate.");
    }
  });

  reset.addEventListener("click", async (e) => {
    e.preventDefault();
    clearMsg();
    try {
      const redirectTo = location.origin + '/reset.html';
      const { error } = await sb.auth.resetPasswordForEmail(email.value.trim(), { redirectTo });
      if (error) throw error;
      show("success", "Password reset email sent.");
    } catch (err) {
      show("error", err.message || "Unable to send reset.");
    }
  });
})();
