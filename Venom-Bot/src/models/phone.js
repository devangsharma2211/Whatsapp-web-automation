const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    mobileNo: {
        type: String,
        required: true,
        unique: true,
        match: [/^[0-9]{10,15}$/, 'Invalid mobile number']
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
