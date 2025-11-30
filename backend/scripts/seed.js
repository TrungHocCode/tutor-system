
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../models/Student.model');
const Tutor = require('../models/Tutor.model');
const Feedback = require('../models/Feedback.model');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await Student.deleteMany({});
    await Tutor.deleteMany({});
    await Feedback.deleteMany({});
    console.log('🗑️  Cleared all existing data');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
};

const seedTutors = async () => {
  const tutors = [];
  const subjects = [
    'Cấu trúc dữ liệu',
    'Toán rời rạc', 
    'Lập trình hướng đối tượng',
    'Cơ sở dữ liệu',
    'Mạng máy tính',
    'Hệ điều hành',
    'Trí tuệ nhân tạo',
    'Công nghệ phần mềm'
  ];
  const departments = [
    'Khoa Khoa học máy tính',
    'Khoa Công nghệ thông tin', 
    'Khoa Kỹ thuật cơ khí',
    'Khoa Điện-Điện tử',
    'Khoa Toán ứng dụng'
  ];
  const titles = ['TS.', 'ThS.', 'PGS.', 'GS.'];

  // Create tutors distributed across 4 quarters of 2026
  // Q1: 5, Q2: 7, Q3: 6, Q4: 6 = Total 24 tutors
  const quarterDistribution = [5, 7, 6, 6];
  
  for (let quarter = 1; quarter <= 4; quarter++) {
    const count = quarterDistribution[quarter - 1];
    
    for (let i = 0; i < count; i++) {
      // Random month within the quarter
      const month = (quarter - 1) * 3 + Math.floor(Math.random() * 3);
      const day = Math.floor(Math.random() * 28) + 1;
      const title = titles[Math.floor(Math.random() * titles.length)];
      
      tutors.push({
        name: `${title} Nguyễn Văn ${String.fromCharCode(65 + (quarter - 1) * 6 + i)}`,
        email: `tutor.q${quarter}.${i + 1}@hcmut.edu.vn`,
        phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
        subject: subjects[Math.floor(Math.random() * subjects.length)],
        department: departments[Math.floor(Math.random() * departments.length)],
        status: Math.random() > 0.9 ? 'inactive' : 'active', // 10% inactive
        createdAt: new Date(2026, month, day)
      });
    }
  }

  const createdTutors = await Tutor.insertMany(tutors);
  console.log(`✅ Created ${createdTutors.length} tutors (Q1: ${quarterDistribution[0]}, Q2: ${quarterDistribution[1]}, Q3: ${quarterDistribution[2]}, Q4: ${quarterDistribution[3]})`);
  return createdTutors;
};

const seedStudents = async () => {
  const students = [];
  const majors = [
    'Khoa học máy tính', 
    'Công nghệ phần mềm', 
    'Hệ thống thông tin', 
    'Kỹ thuật cơ khí', 
    'Điện tử viễn thông',
    'Công nghệ thông tin',
    'Kỹ thuật phần mềm'
  ];

  // Create students distributed across 4 quarters of 2026
  // Q1: 6, Q2: 4, Q3: 4, Q4: 4 = Total 18 students
  const quarterDistribution = [6, 4, 4, 4];
  
  for (let quarter = 1; quarter <= 4; quarter++) {
    const count = quarterDistribution[quarter - 1];
    
    for (let i = 0; i < count; i++) {
      const month = (quarter - 1) * 3 + Math.floor(Math.random() * 3);
      const day = Math.floor(Math.random() * 28) + 1;
      const year = Math.floor(Math.random() * 4) + 1; // Year 1-4
      
      students.push({
        name: `Sinh viên ${String.fromCharCode(65 + (quarter - 1) * 10 + i)}`,
        email: `student.q${quarter}.${i + 1}@hcmut.edu.vn`,
        studentId: `2026${quarter}${String(i + 1).padStart(4, '0')}`,
        phone: `09${Math.floor(Math.random() * 90000000 + 10000000)}`,
        major: majors[Math.floor(Math.random() * majors.length)],
        year: year,
        status: Math.random() > 0.95 ? 'inactive' : 'active', // 5% inactive
        createdAt: new Date(2026, month, day)
      });
    }
  }

  const createdStudents = await Student.insertMany(students);
  console.log(`✅ Created ${createdStudents.length} students (Q1: ${quarterDistribution[0]}, Q2: ${quarterDistribution[1]}, Q3: ${quarterDistribution[2]}, Q4: ${quarterDistribution[3]})`);
  return createdStudents;
};

const seedFeedbacks = async (students, tutors) => {
  const feedbacks = [];
  
  // Create 800 good feedbacks and 200 bad feedbacks for 2026
  const goodCount = 800;
  const badCount = 200;
  
  const goodComments = [
    'Giảng viên dạy rất tốt và nhiệt tình',
    'Bài giảng dễ hiểu, dễ tiếp cận',
    'Thầy/cô rất tận tâm với sinh viên',
    'Phương pháp giảng dạy hiệu quả',
    'Luôn sẵn sàng hỗ trợ sinh viên',
    'Kiến thức chuyên môn vững vàng'
  ];
  
  const badComments = [
    'Cần cải thiện phương pháp giảng dạy',
    'Bài giảng khó hiểu',
    'Cần thêm ví dụ thực tế',
    'Tốc độ giảng hơi nhanh',
    'Cần tương tác nhiều hơn với sinh viên'
  ];

  // Create good feedbacks
  for (let i = 0; i < goodCount; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    
    feedbacks.push({
      student: students[Math.floor(Math.random() * students.length)]._id,
      tutor: tutors[Math.floor(Math.random() * tutors.length)]._id,
      rating: 'good',
      comment: goodComments[Math.floor(Math.random() * goodComments.length)],
      createdAt: new Date(2026, month, day)
    });
  }

  // Create bad feedbacks
  for (let i = 0; i < badCount; i++) {
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    
    feedbacks.push({
      student: students[Math.floor(Math.random() * students.length)]._id,
      tutor: tutors[Math.floor(Math.random() * tutors.length)]._id,
      rating: 'bad',
      comment: badComments[Math.floor(Math.random() * badComments.length)],
      createdAt: new Date(2026, month, day)
    });
  }

  const createdFeedbacks = await Feedback.insertMany(feedbacks);
  console.log(`✅ Created ${createdFeedbacks.length} feedbacks (${goodCount} good = ${(goodCount/1000*100)}%, ${badCount} bad = ${(badCount/1000*100)}%)`);
  
  return createdFeedbacks;
};

const seed = async () => {
  try {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║       🌱 HCMUT TUTOR SYSTEM - DATABASE SEEDING       ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    await connectDB();
    await clearDatabase();
    
    console.log('\n📊 Seeding data for year 2026...\n');
    const tutors = await seedTutors();
    const students = await seedStudents();
    await seedFeedbacks(students, tutors);
    
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║              ✨ SEED COMPLETED SUCCESSFULLY!          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    
    console.log('📈 Summary:');
    console.log('   ┌─────────────────────────────────────────────────┐');
    console.log(`   │  Tutors:    ${String(tutors.length).padEnd(3)} (distributed across 4 quarters) │`);
    console.log(`   │  Students:  ${String(students.length).padEnd(3)} (distributed across 4 quarters) │`);
    console.log('   │  Feedbacks: 1000 (800 good, 200 bad)           │');
    console.log('   │  Year:      2026                                │');
    console.log('   └─────────────────────────────────────────────────┘\n');
    
    console.log('📊 Quarterly Distribution:');
    console.log('   Q1 (Jan-Mar): 5 tutors,  6 students');
    console.log('   Q2 (Apr-Jun): 7 tutors,  4 students');
    console.log('   Q3 (Jul-Sep): 6 tutors,  4 students');
    console.log('   Q4 (Oct-Dec): 6 tutors,  4 students\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Start backend:  cd backend && npm run dev');
    console.log('   2. Start frontend: cd frontend && npm run dev');
    console.log('   3. Open: http://localhost:3000/reports\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during seed:', error);
    process.exit(1);
  }
};

seed();