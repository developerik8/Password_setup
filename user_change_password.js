// Replace with your actual Supabase project URL and public anon key
const supabase = supabase.createClient('https://vpjzxhfrqyspcbgmwqjd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwanp4aGZycXlzcGNiZ213cWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDQ5NzIsImV4cCI6MjA2NjY4MDk3Mn0.x9dnZg6gvSUWVfuL4-CB6dKUY6sESE1xyM_v9Wmv4Tc');

// Parse access_token and type from URL
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const type = urlParams.get('type');

// DEBUG: Print URL params
console.log('URL Params:', window.location.search);
console.log('accessToken:', accessToken, 'type:', type);

if (type === 'recovery' && accessToken) {
  // Set the session with the recovery token
  supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: accessToken, // Supabase requires both
  });
  // DEBUG: Session set
  console.log('Supabase session set with recovery token.');
}

const emailRow = document.getElementById ? document.getElementById('email-row') : null;

document.addEventListener('DOMContentLoaded', function () {
  // Show email input if no token
  if (!accessToken && emailRow) {
    emailRow.style.display = 'flex';
    document.getElementById('email').setAttribute('required', 'required');
  }
  document.getElementById('change-password-form').onsubmit = async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    messageDiv.className = 'message';

    if (accessToken && type === 'recovery') {
      // Update password using the session set above
      const { data, error } = await supabase.auth.updateUser({ password: newPassword });
      // DEBUG: Print response from updateUser
      console.log('updateUser response:', { data, error });
      if (error) {
        messageDiv.textContent = error.message;
        messageDiv.className = 'message error';
        // DEBUG: Print error
        console.error('Password update error:', error);
      } else {
        // Optionally notify backend for admin log
        try {
          // The email is obtained from the Supabase user object after successful password update
          const user = data.user || (await supabase.auth.getUser()).data.user;
          console.log('User object for backend log:', user);
          if (user && user.email) {
            await fetch('https://edunest-admin-api.onrender.com/reset-password-by-email', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: user.email, newPassword })
            });
            // DEBUG: Backend notified
            console.log('Backend notified for password reset:', user.email);
          }
        } catch (err) {
          console.error('Backend notification error:', err);
        }
        // Show a better feedback page/modal
        document.body.innerHTML = `
          <div class="container">
            <div class="header">
              <div class="header-icon">✅</div>
              <div class="title">Password Updated!</div>
              <div class="subtitle">Your password has been changed successfully.<br>You can now log in with your new password.</div>
            </div>
            <div class="footer">&copy; 2024 EduNest. All rights reserved.</div>
          </div>
        `;
        // DEBUG: Success feedback shown
        console.log('Password updated successfully! Feedback page shown.');
      }
    } else {
      // Manual email + password flow
      const email = document.getElementById('email').value;
      if (!email) {
        messageDiv.textContent = 'Please enter your email.';
        messageDiv.className = 'message error';
        return;
      }
      try {
        const response = await fetch('https://edunest-admin-api.onrender.com/manual-password-reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword })
        });
        const result = await response.json();
        if (result.success) {
          document.body.innerHTML = `
            <div class="container">
              <div class="header">
                <div class="header-icon">✅</div>
                <div class="title">Password Updated!</div>
                <div class="subtitle">The password for <b>${email}</b> has been changed successfully.<br>You can now log in with your new password.</div>
              </div>
              <div class="footer">&copy; 2024 EduNest. All rights reserved.</div>
            </div>
          `;
          console.log('Manual password reset successful for:', email);
        } else {
          messageDiv.textContent = result.message || 'Failed to reset password.';
          messageDiv.className = 'message error';
          console.error('Manual password reset error:', result);
        }
      } catch (err) {
        messageDiv.textContent = 'Error contacting server.';
        messageDiv.className = 'message error';
        console.error('Manual password reset fetch error:', err);
      }
    }
  };
}); 