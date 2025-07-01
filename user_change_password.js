// Replace with your actual Supabase project URL and public anon key
const supabase = supabase.createClient('https://vpjzxhfrqyspcbgmwqjd.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwanp4aGZycXlzcGNiZ213cWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDQ5NzIsImV4cCI6MjA2NjY4MDk3Mn0.x9dnZg6gvSUWVfuL4-CB6dKUY6sESE1xyM_v9Wmv4Tc');

// Parse access_token and type from URL
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const type = urlParams.get('type');

if (type === 'recovery' && accessToken) {
  // Set the session with the recovery token
  supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: accessToken, // Supabase requires both
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('change-password-form').onsubmit = async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = '';
    messageDiv.className = 'message';

    // Update password using the session set above
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      messageDiv.textContent = error.message;
      messageDiv.className = 'message error';
    } else {
      // Optionally notify backend for admin log
      try {
        const user = data.user || (await supabase.auth.getUser()).data.user;
        if (user && user.email) {
          await fetch('http://localhost:4000/reset-password-by-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, newPassword })
          });
        }
      } catch (err) {}
      messageDiv.textContent = 'Password updated successfully!';
      messageDiv.className = 'message success';
      document.getElementById('change-password-form').reset();
    }
  };
}); 