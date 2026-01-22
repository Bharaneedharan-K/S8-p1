
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env from current directory
dotenv.config({ path: './.env' });

const fixIndexes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        // Use the correct env variable name: MONGODB_URI
        const uri = process.env.MONGODB_URI;
        if (!uri) throw new Error('MONGODB_URI is undefined in .env');

        await mongoose.connect(uri);
        console.log('Connected to DB.');

        const collection = mongoose.connection.collection('schemes');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        const nameIndex = indexes.find(idx => idx.name === 'name_1');

        if (nameIndex) {
            console.log('Found problematic index "name_1". Dropping it...');
            await collection.dropIndex('name_1');
            console.log('✅ Index "name_1" dropped successfully.');
        } else {
            console.log('Index "name_1" not found. No action needed.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

fixIndexes();
