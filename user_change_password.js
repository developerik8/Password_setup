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
  const form = document.getElementById('change-password-form');
  const messageDiv = document.getElementById('message');

  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    messageDiv.textContent = '';
    messageDiv.className = 'message';

    if (newPassword !== confirmPassword) {
      showError('❌ Passwords do not match. Please try again.');
      return;
    }

    showLoading();
    try {
      const response = await fetch('https://edunest-admin-api.onrender.com/manual-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      const result = await response.json();
      if (result.success) {
        showSuccess(email);
      } else {
        showError(`❌ ${result.message || 'Failed to reset password. Please try again.'}`);
      }
    } catch (err) {
      showError('❌ Error contacting server. Please check your connection and try again.');
    }
  };

  function showLoading() {
    messageDiv.innerHTML = '<span class="spinner"></span> Processing...';
    messageDiv.className = 'message loading';
  }

  function showSuccess(email) {
    document.body.innerHTML = `
      <div class="container">
        <div class="header">
          <div class="header-icon" style="background:#eafaf1;color:#28a745;font-size:2.5em;">✅</div>
          <div class="title">Password Updated!</div>
          <div class="subtitle">The password for <b>${email}</b> has been changed successfully.<br><span style='color:#28a745;font-weight:600;'>You can now login to the app with your updated email and password.</span></div>
        </div>
        <a href="/" class="action-btn" style="margin-top:30px;">Go to Login</a>
        <div class="footer">&copy; 2024 EduNest. All rights reserved.</div>
      </div>
    `;
  }

  function showError(message) {
    messageDiv.innerHTML = `<span style="font-size:1.5em;vertical-align:middle;">❌</span> <span style="vertical-align:middle;">${message}</span><br><button id="retry-btn" class="action-btn" style="margin-top:12px;background:#d32f2f;">Retry</button>`;
    messageDiv.className = 'message error';
    document.getElementById('retry-btn').onclick = function() {
      messageDiv.textContent = '';
      messageDiv.className = 'message';
      form.reset();
    };
  }
});

// Add spinner CSS
const style = document.createElement('style');
style.innerHTML = `
.spinner {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 3px solid #e0e7ff;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(style); 