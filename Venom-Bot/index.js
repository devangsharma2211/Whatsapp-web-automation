const connectDB = require('./src/config/db'); 
const venom = require('venom-bot');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./src/models/phone');
const qrcode = require('qrcode-terminal');
const phone = require('./src/models/phone');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Function to fetch students (Name & Phone Number)
async function fetchStudents() {
    try {
        const contacts = await Student.find({}, 'Name PhoneNumber');
        console.log("📌 Debug: Fetched Contacts =>", contacts);
        return contacts;
    } catch (error) {
        console.log("❌ Error fetching contacts:", error);
        return [];
    }
}

// Anti-ban message variations
function generatePersonalizedMessage(name) {
    const messages = [
        `Hey ${name}, we have an important update for you!`,
        `Hi ${name}, check out this update!`,
        `Hello ${name}, here's something you should know.`,
        `Hey ${name}, don't miss this update!`
    ];
    return messages[Math.floor(Math.random() * messages.length)];
}

// Create Venom-Bot session
venom.create({
    session: 'session',
    headless: false,
    useChrome: true,
    logQR: false,
    autoClose: false,
})
.then(client => {
    console.log("✅ Venom-Bot Started! Scan the QR code if prompted.");
    start(client);
})
.catch(error => console.log("❌ Venom Bot Error:", error));

async function start(client) {
    // Using the correct fetch function: fetchStudents()
    const students = await fetchStudents();
    console.log(`📢 Total Contacts: ${students.length}`);

    if (students.length === 0) {
        console.log("❌ No contacts found in the database.");
        return;
    }

    for (let i = 0; i < students.length; i++) {
        const student = students[i];
        
        console.log(`🚀 Sending message ${i + 1}/${students.length} to ${student.name}`);

        // Send message
        const success = await sendVideo(client, student);
        
        if (!success) {
            console.log(`⏳ Retrying for ${student.name}...`);
            await new Promise(resolve => setTimeout(resolve, 15000)); // Wait 15 sec before retry
            await sendVideo(client, student); // Retry once
        }

        // Introduce **randomized delay** (10 - 30 sec)
        const delay = Math.floor(Math.random() * (30000 - 10000 + 1)) + 10000;
        console.log(`⏳ Waiting for ${delay / 1000} seconds before next message...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    console.log("🎉 All messages sent successfully!");
}

// Function to send personalized message
async function sendVideo(client, student) {
    try {
        // Debug: Log the student object
        console.log("📌 Debug: Student Object =>", student);

        if (!student.PhoneNumber) {
            console.log(`⚠️ Skipping ${student.Name} (No phone number found)`);
            return false;
        }

        // Convert PhoneNumber to string and append '@c.us'
        const phoneNumber = String(student.PhoneNumber) + '@c.us';

        // Debug: Log the phone number
        console.log("📌 Debug: Phone Number =>", phoneNumber);

        // Debug: Log the file path
        const filePath = __dirname + '/src/images/1.mp4';
        console.log("📌 Debug: File Path =>", filePath);

        const personalizedMessage = generatePersonalizedMessage(student.Name);

        // Send the video
        await client.sendFile(
            phoneNumber, // Use the formatted phone number
            filePath,
            '1.mp4',
            personalizedMessage
        );

        console.log(`✅ Video sent to ${student.Name} (${student.PhoneNumber})`);
        return true;
    } catch (error) {
        // Log the actual error message
        console.log(`❌ Failed to send video to ${student.Name}:`, error.text || error.message || error);

        // Skip invalid numbers
        if (error.text === 'The number does not exist') {
            console.log(`⚠️ Skipping ${student.Name} (Invalid or unregistered WhatsApp number)`);
            return false;
        }

        return false;
    }
}
module.exports = connectDB;
