const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'school_information_system',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Sample first names
const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Donald', 'Sandra', 'Mark', 'Ashley',
  'Paul', 'Dorothy', 'Steven', 'Kimberly', 'Andrew', 'Emily', 'Joshua', 'Donna'
];

// Sample last names
const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker'
];

async function seed1AStudents() {
  let connection;
  try {
    console.log('🌱 Seeding 39 students for Form 1A...');
    
    connection = await mysql.createConnection(config);
    
    // Get Form 1A class ID
    const [classes] = await connection.query(
      'SELECT id FROM classes WHERE form = 1 AND stream = "A" LIMIT 1'
    );
    
    if (classes.length === 0) {
      console.error('❌ Form 1A class not found. Please run the main seed script first.');
      return;
    }
    
    const classId = classes[0].id;
    console.log(`🏫 Found Form 1A class with ID: ${classId}`);
    
    // Generate 39 students
    const students = [];
    for (let i = 1; i <= 39; i++) {
      const registrationNumber = `1A-${String(i).padStart(3, '0')}`;
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const gender = i % 2 === 0 ? 'FEMALE' : 'MALE';
      
      // Generate date of birth (around 12-13 years old for Form 1)
      const birthYear = 2011 + Math.floor(Math.random() * 2);
      const birthMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
      const birthDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const dateOfBirth = `${birthYear}-${birthMonth}-${birthDay}`;
      
      students.push({
        id: uuidv4(),
        registrationNumber,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        classId,
        isActive: true
      });
    }
    
    // Insert students
    console.log('👨‍🎓 Inserting students...');
    for (const student of students) {
      await connection.query(
        'INSERT INTO students (id, registrationNumber, firstName, lastName, dateOfBirth, gender, classId, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [student.id, student.registrationNumber, student.firstName, student.lastName, student.dateOfBirth, student.gender, student.classId, student.isActive]
      );
    }
    
    // Update class student count
    await connection.query(
      'UPDATE classes SET currentStudents = currentStudents + 39 WHERE id = ?',
      [classId]
    );
    
    // Verify
    const [count] = await connection.query('SELECT COUNT(*) as count FROM students WHERE classId = ?', [classId]);
    console.log(`✅ Successfully seeded ${count[0].count} students in Form 1A`);
    
    // Display seeded students
    const [studentList] = await connection.query(
      'SELECT registrationNumber, firstName, lastName, gender FROM students WHERE classId = ? ORDER BY registrationNumber',
      [classId]
    );
    
    console.log('\n📋 Seeded students:');
    studentList.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.registrationNumber}: ${student.firstName} ${student.lastName} (${student.gender})`);
    });
    
    console.log('\n🎉 Form 1A students seeded successfully!');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed1AStudents().catch(console.error);
