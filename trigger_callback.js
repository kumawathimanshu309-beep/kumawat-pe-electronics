async function triggerCallback() {
  try {
    const res = await fetch('http://localhost:3000/auth/google/callback?code=mock_code_for_testing');
    const text = await res.text();
    console.log("Status:", res.status);
    if (res.status === 500) {
      console.log("Got 500 error. HTML snippet:", text.slice(0, 500));
    } else {
      console.log("Response:", text.slice(0, 500));
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

triggerCallback();
