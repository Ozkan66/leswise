# Browser Test Instructions

## To create test worksheet and test sharing functionality:

1. Open http://localhost:3001 in your browser
2. Log in as a teacher (ozkanyilmaz66+1@gmail.com)
3. Open Developer Tools (F12) and go to Console
4. Paste this code and press Enter:

```javascript
// Create test worksheet and share it
async function createTestWorksheet() {
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
      
      alert('Test worksheet created and shared! Check the student view.');
    } else {
      console.error('❌ Error:', result.error);
      alert('Error: ' + result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    alert('Network error: ' + error.message);
  }
}

createTestWorksheet();
```

5. After the worksheet is created, log out and log in as a student
6. Go to "Mijn Werkbladen" to see if the shared worksheet appears
7. Try to submit the worksheet to test the functionality

## Alternative: Manual Test

1. Log in as teacher
2. Go to Worksheets page
3. Create a new worksheet manually
4. Go to the worksheet detail page
5. Click on "Share" tab
6. Add a student to share with
7. Log out and log in as student
8. Check "Mijn Werkbladen" page
