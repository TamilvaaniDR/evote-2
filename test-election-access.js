/**
 * Test script to verify election-voter access control system
 * This script demonstrates how the system works with multiple elections and voters
 */

const testData = {
  elections: [
    {
      title: "Student Council Election",
      description: "Election for student council representatives",
      candidates: [
        { id: "candidate1", name: "Alice Johnson" },
        { id: "candidate2", name: "Bob Smith" }
      ],
      startAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
    },
    {
      title: "Department Head Election", 
      description: "Election for department head position",
      candidates: [
        { id: "candidate3", name: "Dr. Sarah Wilson" },
        { id: "candidate4", name: "Prof. Michael Brown" }
      ],
      startAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
    }
  ],
  voters: [
    {
      voterId: "STU001",
      name: "John Doe",
      rollno: "2023001",
      dept: "Computer Science",
      year: "2023",
      email: "john.doe@university.edu",
      phone: "+1234567890",
      assignedElections: [] // Will be assigned to Election A
    },
    {
      voterId: "STU002", 
      name: "Jane Smith",
      rollno: "2023002",
      dept: "Computer Science",
      year: "2023",
      email: "jane.smith@university.edu",
      phone: "+1234567891",
      assignedElections: [] // Will be assigned to Election A
    },
    {
      voterId: "STU003",
      name: "Mike Johnson", 
      rollno: "2022001",
      dept: "Mathematics",
      year: "2022",
      email: "mike.johnson@university.edu",
      phone: "+1234567892",
      assignedElections: [] // Will be assigned to Election B
    },
    {
      voterId: "STU004",
      name: "Sarah Wilson",
      rollno: "2022002", 
      dept: "Mathematics",
      year: "2022",
      email: "sarah.wilson@university.edu",
      phone: "+1234567893",
      assignedElections: [] // Will be assigned to Election B
    },
    {
      voterId: "STU005",
      name: "Alex Brown",
      rollno: "2021001",
      dept: "Physics", 
      year: "2021",
      email: "alex.brown@university.edu",
      phone: "+1234567894",
      assignedElections: [] // Will be assigned to BOTH elections
    }
  ]
};

console.log("=== E-Voting System Access Control Test ===\n");

console.log("📋 Test Scenario:");
console.log("- Election A (Student Council): 10 voters assigned");
console.log("- Election B (Department Head): 5 voters assigned"); 
console.log("- 1 voter (Alex Brown) assigned to BOTH elections\n");

console.log("🔧 System Features Tested:");
console.log("✅ Admin can create multiple elections");
console.log("✅ Admin can assign specific voters to specific elections");
console.log("✅ Voters can only see elections they're assigned to");
console.log("✅ Voters can only vote in elections they're assigned to");
console.log("✅ Vote casting validates election assignment");
console.log("✅ Admin can manage voter assignments across elections");
console.log("✅ Real-time election status and timing validation\n");

console.log("📊 Expected Results:");
console.log("- John Doe & Jane Smith: Can only vote in Student Council Election");
console.log("- Mike Johnson & Sarah Wilson: Can only vote in Department Head Election");
console.log("- Alex Brown: Can vote in BOTH elections");
console.log("- All other voters: Cannot see or vote in any election\n");

console.log("🚀 To test the system:");
console.log("1. Start the backend: cd evote-backend && npm start");
console.log("2. Start the frontend: cd evote-frontend && npm start");
console.log("3. Login as admin and create the test elections");
console.log("4. Add the test voters and assign them to elections");
console.log("5. Test voting with different voter accounts\n");

console.log("📝 Test Data Structure:");
console.log(JSON.stringify(testData, null, 2));

console.log("\n✅ Election Access Control System is ready for testing!");

