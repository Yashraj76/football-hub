// ============================================
// ADMIN AUTH PAGE — Firebase Auth
// ============================================

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebase/config.js';

let currentUser = null;

export function initAuthListener(callback) {
  if (!auth) return;
  onAuthStateChanged(auth, user => {
    currentUser = user;
    if (callback) callback(user);
  });
}

export function getCurrentUser() {
  return currentUser || (auth && auth.currentUser);
}

export async function adminLogout() {
  if (auth) {
    await signOut(auth);
    window.location.hash = '#/';
  }
}

export function renderAdminAuth(container) {
  if (currentUser) {
    window.location.hash = '#/admin';
    return;
  }

  let isSignUpMode = false;

  function renderForm() {
    container.innerHTML = `
      <div style="min-height: 85vh; display: flex; align-items: center; justify-content: center; padding: var(--space-6);">
        <div class="card gradient-border animate-fade-in-up" style="width: 100%; max-width: 440px; padding: var(--space-8);">
          <div style="text-align: center; margin-bottom: var(--space-6);">
            <div style="font-size: 3rem; margin-bottom: var(--space-2);">🛡️</div>
            <h2 style="font-size: var(--text-2xl); font-weight: var(--weight-extrabold);">${isSignUpMode ? 'Create Admin Account' : 'Admin Portal'}</h2>
            <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: var(--space-1);">
              ${isSignUpMode ? 'Register credentials to manage FootballHub' : 'Sign in with your admin credentials to manage teams, players, and matches'}
            </p>
          </div>

          <form id="auth-form" style="display: flex; flex-direction: column; gap: var(--space-4);">
            <div id="auth-error" style="display: none; padding: var(--space-3); border-radius: var(--radius-md); background: rgba(255, 71, 87, 0.15); border: 1px solid var(--accent-red); color: var(--accent-red); font-size: var(--text-sm);"></div>

            <div>
              <label style="display: block; font-size: var(--text-sm); font-weight: var(--weight-medium); margin-bottom: var(--space-1); color: var(--text-secondary);">Admin Email</label>
              <input type="email" id="email" class="input" placeholder="admin@footballhub.com" required style="width: 100%;" />
            </div>

            <div>
              <label style="display: block; font-size: var(--text-sm); font-weight: var(--weight-medium); margin-bottom: var(--space-1); color: var(--text-secondary);">Password</label>
              <input type="password" id="password" class="input" placeholder="••••••••" required minlength="6" style="width: 100%;" />
            </div>

            <button type="submit" class="btn btn-primary btn-lg" id="submit-btn" style="margin-top: var(--space-2); width: 100%;">
              ${isSignUpMode ? 'Register & Enter Dashboard' : 'Sign In to Admin Hub'}
            </button>

            <div style="display: flex; align-items: center; margin: var(--space-3) 0;">
              <div style="flex: 1; height: 1px; background: var(--border-primary);"></div>
              <span style="padding: 0 var(--space-3); font-size: var(--text-xs); color: var(--text-tertiary); text-transform: uppercase;">Or</span>
              <div style="flex: 1; height: 1px; background: var(--border-primary);"></div>
            </div>

            <button type="button" class="btn btn-secondary" id="google-btn" style="width: 100%; display: flex; align-items: center; justify-content: center; gap: var(--space-2);">
              <span>🌐</span> Sign in with Google
            </button>
          </form>

          <div style="text-align: center; margin-top: var(--space-6); font-size: var(--text-sm); color: var(--text-tertiary);">
            ${isSignUpMode ? 'Already have an account?' : "Don't have an admin account?"}
            <button type="button" id="toggle-mode-btn" style="background: none; border: none; color: var(--accent-green); font-weight: var(--weight-semibold); cursor: pointer; margin-left: var(--space-1);">
              ${isSignUpMode ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>
      </div>
    `;

    const form = container.querySelector('#auth-form');
    const emailInput = container.querySelector('#email');
    const passwordInput = container.querySelector('#password');
    const errorBox = container.querySelector('#auth-error');
    const submitBtn = container.querySelector('#submit-btn');
    const googleBtn = container.querySelector('#google-btn');
    const toggleBtn = container.querySelector('#toggle-mode-btn');

    toggleBtn.addEventListener('click', () => {
      isSignUpMode = !isSignUpMode;
      renderForm();
    });

    googleBtn.addEventListener('click', async () => {
      try {
        errorBox.style.display = 'none';
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        window.location.hash = '#/admin';
      } catch (err) {
        errorBox.textContent = err.message;
        errorBox.style.display = 'block';
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();

      errorBox.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';

      try {
        if (isSignUpMode) {
          await createUserWithEmailAndPassword(auth, email, password);
        } else {
          await signInWithEmailAndPassword(auth, email, password);
        }
        window.location.hash = '#/admin';
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignUpMode ? 'Register & Enter Dashboard' : 'Sign In to Admin Hub';
        
        let msg = err.message;
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = 'Invalid email or password. If you are new, click "Create Account" below.';
        } else if (err.code === 'auth/email-already-in-use') {
          msg = 'An account with this email already exists. Please sign in instead.';
        }
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
      }
    });
  }

  renderForm();
}
