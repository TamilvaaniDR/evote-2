/**
 * Script to create a test voter for debugging
 * Run this to create a test voter that can be used for testing
 */

const testVoter = {
  voterId: "TEST001",
  name: "Test User",
  rollno: "2023001",
  dept: "Computer Science",
  year: "2023",
  email: "test@university.edu",
  phone: "+1234567890",
  eligible: true,
  assignedElections: [] // Will be assigned to elections later
};

console.log("=== Test Voter Data ===");
console.log("Use this voter data to test the system:");
console.log(JSON.stringify(testVoter, null, 2));

console.log("\n=== Testing Instructions ===");
console.log("1. Add this voter to your database using the admin interface");
console.log("2. Assign the voter to an election");
console.log("3. Try logging in with any of these identifiers:");
console.log(`   - Voter ID: ${testVoter.voterId}`);
console.log(`   - Email: ${testVoter.email}`);
console.log(`   - Phone: ${testVoter.phone}`);
console.log("4. Check the backend console for debug messages");
console.log("5. Use the dev OTP shown in the console to verify");

console.log("\n=== Expected Behavior ===");
console.log("✅ Voter should be found in database");
console.log("✅ OTP should be generated and displayed in console");
console.log("✅ OTP verification should work with the displayed OTP");
console.log("✅ Voter should be able to see assigned elections");

console.log("\n=== Troubleshooting ===");
console.log("If voter is not found:");
console.log("- Check if voter exists in database");
console.log("- Check if voter.eligible = true");
console.log("- Check if voter is assigned to any elections");

console.log("If OTP verification fails:");
console.log("- Check if OTP is being generated correctly");
console.log("- Check if OTP is being stored in memory");
console.log("- Check if OTP is being retrieved correctly");
console.log("- Check if OTP has expired (5 minutes)");

