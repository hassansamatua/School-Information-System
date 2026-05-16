'use client'

import { useState } from 'react'

export default function SetupPage() {
  const [status, setStatus] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const setupDatabase = async () => {
    setIsLoading(true)
    setStatus('Setting up database...')

    try {
      // This would typically be done server-side, but for setup purposes
      // we'll provide the SQL commands you need to run manually
      
      const sqlCommands = `
-- Create database
CREATE DATABASE IF NOT EXISTS school_information_system;

-- Use the database
USE school_information_system;

-- Create admin user
INSERT INTO users (id, email, password, role, name, isActive, createdAt, updatedAt) 
VALUES ('admin-001', 'admin@school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'ADMIN', 'System Administrator', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE email = 'admin@school.edu';

-- Create teacher user
INSERT INTO users (id, email, password, role, name, isActive, createdAt, updatedAt) 
VALUES ('teacher-001', 'teacher@school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'TEACHER', 'John Teacher', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE email = 'teacher@school.edu';

-- Create parent user
INSERT INTO users (id, email, password, role, name, isActive, createdAt, updatedAt) 
VALUES ('parent-001', 'parent@school.edu', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'PARENT', 'Jane Parent', true, NOW(), NOW())
ON DUPLICATE KEY UPDATE email = 'parent@school.edu';
      `

      setStatus(`
Database setup instructions:

1. Open XAMPP Control Panel
2. Start Apache and MySQL services
3. Open browser and go to: http://localhost/phpmyadmin
4. Click on "SQL" tab
5. Copy and paste these commands:

${sqlCommands}

6. Click "Go" to execute

After running these commands, the following users will be created:
- Admin: admin@school.edu / admin123
- Teacher: teacher@school.edu / teacher123  
- Parent: parent@school.edu / parent123

The password hash shown is for 'admin123' - all users use the same password for testing.
      `)
    } catch (error) {
      setStatus('Error: ' + error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">School Information System Setup</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Prerequisites</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ XAMPP installed</li>
              <li>❓ Apache service running</li>
              <li>❓ MySQL service running</li>
              <li>❓ Database created</li>
            </ul>
          </div>

          <button
            onClick={setupDatabase}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Generating Setup Instructions...' : 'Get Database Setup Instructions'}
          </button>

          {status && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Setup Instructions:</h3>
              <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border">
                {status}
              </pre>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">Next Steps:</h3>
            <ol className="text-sm text-yellow-800 space-y-1">
              <li>1. Follow the setup instructions above</li>
              <li>2. Run the SQL commands in phpMyAdmin</li>
              <li>3. Restart the development server</li>
              <li>4. Go to http://localhost:3001/login</li>
              <li>5. Test with the provided credentials</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}