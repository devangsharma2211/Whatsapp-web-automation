
const connectDB = require('./src/config/db'); 
const venom = require('venom-bot');
const mongoose = require('mongoose');
const csvtojson = require('csvtojson');
require('dotenv').config();
const Student = require('./src/models/phone');



// Function to fetch numbers from MongoDB
async function fetchNumbers() {
    try {
        const contacts = await Contact.find({});
        return contacts.map(contact => contact.phoneNumber);
    } catch (error) {
        console.log("❌ Error fetching contacts:", error);
        return [];
    }
}

venom
  .create({
    session: 'session',
    headless: false,
    useChrome: true,
    debug: false,
    logQR: true,
    browserArgs: ['--incognito'],
    devtools: false,
    autoClose: false,
    puppeteerOptions: {
      protocolTimeout: 60000
    }
  })
  .then(client => start(client))
  .catch(error => console.log("❌ Venom Bot Error:", error));

async function start(client) {
    const students = await fetchNumbers();  // Fetch numbers from MongoDB
    console.log(`📢 Total Contacts: ${students.length}`);

    // Batch processing (avoid API overload)
    const batchSize = 50;  // Adjust based on API limits
    for (let i = 0; i < students.length; i += batchSize) {
        const batch = students.slice(i, i + batchSize);
        console.log(`🚀 Sending batch ${i / batchSize + 1} (${batch.length} contacts)...`);

        // Sending messages in parallel using Promise.all
        await Promise.all(batch.map(number => sendVideo(client, number)));

        console.log(`✅ Batch ${i / batchSize + 1} sent!`);
        await new Promise(resolve => setTimeout(resolve, 3000));  // Wait 3 sec between batches
    }

    console.log("🎉 All messages sent successfully!");
}

// Function to send video
async function sendVideo(client, number) {
    try {
        await client.sendFile(
            number + '@c.us',
            __dirname + '/src/images/1.mp4',
            '1.mp4',
            '📢 Hello students! Here is an important update regarding your classes.'
        );
        console.log(`✅ Video sent to ${number}`);
    } catch (error) {
        console.log(`❌ Failed to send video to ${number}: ${error}`);
    }
}


module.exports = connectDB;