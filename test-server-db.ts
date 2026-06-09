async function checkServer() {
  try {
    const res = await fetch("http://localhost:3000/api/check-firestore");
    if (!res.ok) {
      console.log("Failed to fetch check-firestore, status:", res.status);
      const text = await res.text();
      console.log("Error body:", text);
      return;
    }
    const data = await res.json();
    console.log("Check-firestore response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error connecting to server check-firestore:", err);
  }
  process.exit(0);
}
checkServer();
