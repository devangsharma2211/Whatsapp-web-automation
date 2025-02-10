const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const Student = require('../models/'); // Import your schema

mongoose.connect('mongodb+srv://guptaronak596:Ren@cluster0.sdgrp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const students = [];

fs.createReadStream('students.csv')
  .pipe(csv())
  .on('data', (row) => {
      students.push({ mobileNo: row.mobileNo });
  })
  .on('end', async () => {
      try {
          await Student.insertMany(students);
          console.log('CSV data uploaded successfully');
          mongoose.connection.close();
      } catch (error) {
          console.error('Error uploading data:', error);
      }
