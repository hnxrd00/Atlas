// Supabase Configuration
const SUPABASE_URL = 'https://kdepevrkbejbprlzkcij.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZXBldnJrYmVqYnBybHprY2lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc0MDUsImV4cCI6MjA4NjMyMzQwNX0.4w-ljvKLvqojNj63_pjwPmNqaaYayRD1JYBN_abO20s';

// Initialize Supabase client
let sb;
try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized in dashboard');
} catch (e) {
    console.error('❌ Failed to initialize Supabase:', e);
}

// Get DOM elements
const loadingState = document.getElementById('loadingState');
const dashboardContent = document.getElementById('dashboardContent');
const userEmailElement = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// Check if user is authenticated and load dashboard
document.addEventListener('DOMContentLoaded', async () => {
    console.log('📄 Dashboard loading...');
    
    if (!sb) {
        console.error('❌ Supabase not initialized!');
        loadingState.innerHTML = '<p style="color: red;">Error initializing app. Please refresh.</p>';
        return;
    }

    try {
        // Get current user session
        const { data: { user }, error: authError } = await sb.auth.getUser();

        if (authError) {
            console.error('❌ Auth error:', authError);
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'get-started.html';
            }, 500);
            return;
        }

        if (!user) {
            console.log('⚠️ No user logged in, redirecting to login...');
            // User not authenticated, redirect to login
            setTimeout(() => {
                window.location.href = 'get-started.html';
            }, 500);
            return;
        }

        // User is authenticated!
        console.log('✅ User authenticated:', user.email);
        
        // Show dashboard content
        loadingState.style.display = 'none';
        dashboardContent.style.display = 'block';
        
        // Set user email
        userEmailElement.textContent = user.email;

        // Setup logout functionality
        setupLogout();

        console.log('🎉 Dashboard ready!');

    } catch (error) {
        console.error('❌ Dashboard error:', error);
        loadingState.innerHTML = '<p style="color: red;">Error loading dashboard. Redirecting...</p>';
        setTimeout(() => {
            window.location.href = 'get-started.html';
        }, 2000);
    }
});

// Setup logout button
function setupLogout() {
    const logout = async () => {
        try {
            console.log('🔓 Logging out...');
            
            // Disable button during logout
            logoutBtn.disabled = true;
            logoutBtn.textContent = 'Logging out...';

            const { error } = await sb.auth.signOut();
            
            if (error) {
                console.error('❌ Logout error:', error);
                logoutBtn.disabled = false;
                logoutBtn.textContent = 'Logout';
                alert('Error signing out. Please try again.');
                return;
            }

            console.log('✅ Logged out successfully');
            // Redirect to logout page
            window.location.href = 'logout.html';
        } catch (error) {
            console.error('❌ Logout exception:', error);
            logoutBtn.disabled = false;
            logoutBtn.textContent = 'Logout';
            alert('Error signing out. Please try again.');
        }
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}
