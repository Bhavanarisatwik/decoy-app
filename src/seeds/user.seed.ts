import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';

const MONGODB_URI = process.env['MONGODB_URI'] || 'mongodb://localhost:27017/decoy-app';

// Sample user data
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'Admin@123456'
  },
  {
    username: 'user1',
    email: 'user1@example.com',
    password: 'User@123456'
  },
  {
    username: 'user2',
    email: 'user2@example.com',
    password: 'User@123456'
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'John@123456'
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'Jane@123456'
  }
];

async function seedUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Hash passwords and create users
    const usersWithHashedPasswords = await Promise.all(
      sampleUsers.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return {
          ...user,
          password: hashedPassword
        };
      })
    );

    // Insert users
    const createdUsers = await User.insertMany(usersWithHashedPasswords);
    console.log(`Successfully created ${createdUsers.length} users`);

    // Display created users (without passwords)
    createdUsers.forEach((user) => {
      console.log(`✓ Created user: ${user.username} (${user.email})`);
    });

    // Disconnect
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
}

// Run if this is the main module
if (require.main === module) {
  seedUsers();
}

export { seedUsers };