const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'hansco123',
  database: 'school_information_system',
  port: 3306
};

async function seedDatabase() {
  let connection;
  try {
    console.log('🌱 Seeding database...');
    
    connection = await mysql.createConnection(config);
    
    // Helper function to generate UUID
    const generateId = () => uuidv4();
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const adminId = generateId();
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await connection.query(
      'INSERT INTO users (id, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
      [adminId, 'admin@school.edu', adminPassword, 'ADMIN', true]
    );
    
    await connection.query(
      'INSERT INTO admins (id, userId, firstName, lastName, phone) VALUES (?, ?, ?, ?, ?)',
      [generateId(), adminId, 'System', 'Administrator', '1234567890']
    );
    
    // Create teacher user
    console.log('👨‍🏫 Creating teacher user...');
    const teacherId = generateId();
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    
    await connection.query(
      'INSERT INTO users (id, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
      [teacherId, 'teacher@school.edu', teacherPassword, 'TEACHER', true]
    );
    
    await connection.query(
      'INSERT INTO teachers (id, userId, firstName, lastName, phone, employeeId, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [generateId(), teacherId, 'John', 'Teacher', '1234567890', 'T001', 'Mathematics']
    );
    
    // Create parent user
    console.log('👨‍👩‍👧‍👦 Creating parent user...');
    const parentId = generateId();
    const parentPassword = await bcrypt.hash('parent123', 12);
    
    await connection.query(
      'INSERT INTO users (id, email, password, role, isActive) VALUES (?, ?, ?, ?, ?)',
      [parentId, 'parent@school.edu', parentPassword, 'PARENT', true]
    );
    
    await connection.query(
      'INSERT INTO parents (id, userId, firstName, lastName, phone, occupation, address, isApproved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [generateId(), parentId, 'Jane', 'Parent', '1234567890', 'Engineer', '123 Main St', true]
    );
    
    // Create classes for Form 1-4 with streams A-D
    console.log('🏫 Creating classes...');
    const classes = [];
    
    for (let form = 1; form <= 4; form++) {
      for (const stream of ['A', 'B', 'C', 'D']) {
        const className = `Form ${form}${stream}`;
        const classId = generateId();
        
        await connection.query(
          'INSERT INTO classes (id, name, form, stream, maxStudents, currentStudents, isActive) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [classId, className, form, stream, 40, 0, true]
        );
        
        classes.push({
          id: classId,
          name: className,
          form: form,
          stream: stream
        });
      }
    }
    
    // Create sample students
    console.log('👨‍🎓 Creating students...');
    const sampleStudents = [
      { registrationNumber: 'F1001', firstName: 'Alice', lastName: 'Johnson', form: 1, gender: 'FEMALE' },
      { registrationNumber: 'F2001', firstName: 'Bob', lastName: 'Smith', form: 2, gender: 'MALE' },
      { registrationNumber: 'F3001', firstName: 'Carol', lastName: 'Williams', form: 3, gender: 'FEMALE' },
      { registrationNumber: 'F4001', firstName: 'David', lastName: 'Brown', form: 4, gender: 'MALE' }
    ];
    
    for (const studentData of sampleStudents) {
      const assignedClass = classes.find(c => c.form === studentData.form && c.stream === 'A');
      const studentId = generateId();
      
      await connection.query(
        'INSERT INTO students (id, registrationNumber, firstName, lastName, dateOfBirth, gender, classId, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          studentId,
          studentData.registrationNumber,
          studentData.firstName,
          studentData.lastName,
          new Date(`2008-${studentData.form}-01`),
          studentData.gender,
          assignedClass?.id,
          true
        ]
      );
      
      // Update class student count
      if (assignedClass) {
        await connection.query(
          'UPDATE classes SET currentStudents = currentStudents + 1 WHERE id = ?',
          [assignedClass.id]
        );
      }
    }
    
    // Verify data
    console.log('\n📊 Verifying seeded data...');
    
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users: ${userCount[0].count}`);
    
    const [classCount] = await connection.query('SELECT COUNT(*) as count FROM classes');
    console.log(`🏫 Classes: ${classCount[0].count}`);
    
    const [studentCount] = await connection.query('SELECT COUNT(*) as count FROM students');
    console.log(`👨‍🎓 Students: ${studentCount[0].count}`);
    
    // Show created classes
    const [classesList] = await connection.query('SELECT name, form, stream, currentStudents, maxStudents FROM classes ORDER BY form, stream');
    console.log('\n📋 Created classes:');
    classesList.forEach(cls => {
      console.log(`  - ${cls.name}: ${cls.currentStudents}/${cls.maxStudents} students`);
    });
    
    // Show created students
    const [studentsList] = await connection.query(`
      SELECT s.registrationNumber, s.firstName, s.lastName, c.name as className 
      FROM students s 
      LEFT JOIN classes c ON s.classId = c.id 
      ORDER BY s.registrationNumber
    `);
    console.log('\n👨‍🎓 Created students:');
    studentsList.forEach(student => {
      console.log(`  - ${student.registrationNumber}: ${student.firstName} ${student.lastName} (${student.className || 'No class'})`);
    });
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n🔐 Login credentials:');
    console.log('Admin: admin@school.edu / admin123');
    console.log('Teacher: teacher@school.edu / teacher123');
    console.log('Parent: parent@school.edu / parent123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedDatabase().catch(console.error);