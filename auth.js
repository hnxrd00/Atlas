// Supabase Configuration
const SUPABASE_URL = 'https://kdepevrkbejbprlzkcij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZXBldnJrYmVqYnBybHprY2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc0MDUsImV4cCI6MjA4NjMyMzQwNX0.4w-ljvKLvqojNj63_pjwPmNqaaYayRD1JYBN_abO20s';

// Check if Supabase is available
if (!window.supabase) {
    console.error('❌ Supabase library not loaded! Make sure Supabase CDN is in <head>.');
} else {
    console.log('✅ Supabase library loaded');
}

// Initialize Supabase client using window.supabase from CDN
let sb;
try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');
} catch (e) {
    console.error('❌ Failed to initialize Supabase:', e);
}

// Global reference to the Supabase client
window.supabaseClient = sb;

// Initialize form elements - will be set when DOM is ready
let signupForm, loginForm, googleSignUpBtn, googleSignInBtn, authMessage;

function initializeFormElements() {
    signupForm = document.getElementById('signupForm');
    loginForm = document.getElementById('loginForm');
    googleSignUpBtn = document.getElementById('googleSignUp');
    googleSignInBtn = document.getElementById('googleSignIn');
    authMessage = document.getElementById('authMessage');
    
    console.log('✅ Form elements check:', {
        signupForm: !!signupForm,
        loginForm: !!loginForm,
        googleSignUpBtn: !!googleSignUpBtn,
        googleSignInBtn: !!googleSignInBtn,
        authMessage: !!authMessage
    });
}

// Show message utility
function showMessage(text, type = 'error') {
    if (authMessage) {
        // allow simple HTML in messages (safe for our own UI content)
        authMessage.innerHTML = text;
        authMessage.className = `auth-message ${type}`;
        authMessage.style.display = 'block';
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 7000);
    } else {
        console.log(`[${type.toUpperCase()}] ${text}`);
    }
}

// ===== EMAIL/PASSWORD SIGNUP =====
function setupSignupForm() {
    if (!signupForm) return;

    console.log('✅ Signup form listener attached');
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fullname = document.getElementById('fullname')?.value.trim() || '';
        const email = document.getElementById('email')?.value.trim() || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';

        // Validation
        if (!fullname) {
            showMessage('Please enter your full name', 'error');
            return;
        }

        if (!email) {
            showMessage('Please enter your email', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        const submitBtn = signupForm.querySelector('.form-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
        }

        try {
            console.log('📧 Signing up user:', email);
            const { data: authData, error: authError } = await sb.auth.signUp({
                email: email,
                password: password,
            });

            if (authError) {
                console.error('❌ Signup error:', authError.message);
                showMessage(authError.message || 'Signup failed', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Create Account';
                }
                return;
            }

            console.log('✅ User account created:', authData.user?.id);

            // Create user profile
            if (authData.user) {
                const { error: profileError } = await sb
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        full_name: fullname,
                        email: email,
                        created_at: new Date().toISOString(),
                    }]);

                if (profileError) {
                    console.warn('⚠️ Profile creation warning:', profileError);
                }
            }

            showMessage('✓ Account created! Redirecting to login...', 'success');
            signupForm.reset();
            setTimeout(() => {
                window.location.href = 'get-started.html';
            }, 2000);
        } catch (error) {
            console.error('❌ Signup exception:', error);
            showMessage('Error: ' + error.message, 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        }
    });
}

// ===== EMAIL/PASSWORD LOGIN =====
function setupLoginForm() {
    if (!loginForm) return;

    console.log('✅ Login form listener attached');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value.trim() || '';
        const password = document.getElementById('password')?.value || '';

        if (!email) {
            showMessage('Please enter your email', 'error');
            return;
        }

        if (!password) {
            showMessage('Please enter your password', 'error');
            return;
        }

        const submitBtn = loginForm.querySelector('.form-submit');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing In...';
        }

        try {
            console.log('🔓 Logging in user:', email);
            const { data, error } = await sb.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('❌ Login error:', error.message);

                // Special handling for unconfirmed email
                const msgLower = (error.message || '').toLowerCase();
                if (msgLower.includes('confirm') || msgLower.includes('not confirmed') || msgLower.includes('email not confirmed')) {
                    // Show friendly HTML message with next steps
                    showMessage(
                        `Your email address is not confirmed. Check your inbox for the verification link. ` +
                        `If you can't find it, either request a new confirmation from your email provider or disable the email confirmation requirement in your Supabase project (for testing only).`,
                        'error'
                    );

                    console.warn('User attempted login but email is not confirmed. Next steps:');
                    console.warn('- Check your email inbox and spam folder for the confirmation link.');
                    console.warn('- In Supabase dashboard: Authentication → Settings → Email → disable "Confirm email" for testing.');
                    console.warn('- Alternatively (admin only) you can mark the user confirmed via SQL in Supabase SQL Editor:');
                    console.warn("  UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'user@example.com';");

                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Sign In';
                    }
                    return;
                }

                showMessage(error.message || 'Login failed', 'error');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Sign In';
                }
                return;
            }

            console.log('✅ Login successful');
            showMessage('✓ Logged in! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } catch (error) {
            console.error('❌ Login exception:', error);
            showMessage('Error: ' + error.message, 'error');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign In';
            }
        }
    });
}

// ===== GOOGLE SIGN UP =====
function setupGoogleSignUp() {
    if (!googleSignUpBtn) return;

    console.log('✅ Google signup button listener attached');
    googleSignUpBtn.addEventListener('click', async () => {
        console.log('🔐 Google sign-up clicked');
        googleSignUpBtn.disabled = true;
        googleSignUpBtn.textContent = 'Signing up...';

        try {
            const { error } = await sb.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/signup.html`,
                },
            });

            if (error) {
                console.error('❌ Google OAuth error:', error.message);
                showMessage(error.message || 'Google sign-up failed', 'error');
                googleSignUpBtn.disabled = false;
                googleSignUpBtn.textContent = 'Sign up with Google';
            }
        } catch (error) {
            console.error('❌ Google signup exception:', error);
            showMessage('Error: ' + error.message, 'error');
            googleSignUpBtn.disabled = false;
            googleSignUpBtn.textContent = 'Sign up with Google';
        }
    });
}

// ===== GOOGLE SIGN IN =====
function setupGoogleSignIn() {
    if (!googleSignInBtn) return;

    console.log('✅ Google signin button listener attached');
    googleSignInBtn.addEventListener('click', async () => {
        console.log('🔐 Google sign-in clicked');
        googleSignInBtn.disabled = true;
        googleSignInBtn.textContent = 'Signing in...';

        try {
            const { error } = await sb.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard.html`,
                },
            });

            if (error) {
                console.error('❌ Google OAuth error:', error.message);
                showMessage(error.message || 'Google sign-in failed', 'error');
                googleSignInBtn.disabled = false;
                googleSignInBtn.textContent = 'Sign in with Google';
            }
        } catch (error) {
            console.error('❌ Google signin exception:', error);
            showMessage('Error: ' + error.message, 'error');
            googleSignInBtn.disabled = false;
            googleSignInBtn.textContent = 'Sign in with Google';
        }
    });
}

// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 DOM loaded - initializing auth...');
    
    if (!sb) {
        console.error('❌ Supabase not initialized!');
        return;
    }

    // Initialize all form elements
    initializeFormElements();

    // Setup all event listeners
    setupSignupForm();
    setupLoginForm();
    setupGoogleSignUp();
    setupGoogleSignIn();

    // Check if user already logged in
    try {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
            console.log('✅ User logged in:', user.email);
            if (window.location.pathname.includes('signup.html')) {
                window.location.href = 'dashboard.html';
            }
        }
    } catch (error) {
        console.error('⚠️ Auth check error:', error);
    }

    console.log('🎉 Auth ready!');
});
