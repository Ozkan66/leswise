// Test script to call the create-test-worksheet API
// Run this after logging in as a teacher in the browser

async function createTestWorksheet() {
  // Get the session token from the browser's localStorage
  const sessionData = localStorage.getItem('sb-oadqoodbydvrwwlgdbox-auth-token');
  if (!sessionData) {
    console.error('No session found. Please log in first.');
    return;
  }

  const session = JSON.parse(sessionData);
  const accessToken = session.access_token;

  if (!accessToken) {
    console.error('No access token found. Please log in first.');
    return;
  }

  try {
    const response = await fetch('/api/create-test-worksheet', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Test worksheet created successfully!');
      console.log('Worksheet ID:', result.worksheet.id);
      console.log('Elements created:', result.elements.length);
      if (result.share) {
        console.log('Shared with student successfully');
      }
      console.log('Message:', result.message);
      
      // Refresh the page to show the new worksheet
      window.location.reload();
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Call the function
createTestWorksheet();
