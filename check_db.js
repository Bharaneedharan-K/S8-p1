
import mongoose from 'mongoose';
import Land from './server/models/Land.js'; // Adjust path as needed
import User from './server/models/User.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/welfora'; // Standard local URI

const checkLands = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const lands = await Land.find({});
        console.log(`Found ${lands.length} total land records.`);

        for (const land of lands) {
            const officer = await User.findById(land.officerId);
            const farmer = await User.findById(land.farmerId);
            console.log('------------------------------------------------');
            console.log(`ID: ${land._id}`);
            console.log(`Survey No: ${land.surveyNumber}`);
            console.log(`Status: ${land.status}`);
            console.log(`Officer: ${officer ? officer.name : 'UNKNOWN'} (${land.officerId})`);
            console.log(`Farmer: ${farmer ? farmer.name : 'UNKNOWN'} (${land.farmerId})`);
            console.log(`Verification Date: ${land.verificationDate}`);
            console.log(`Verification Doc: ${land.verificationDocument ? 'YES' : 'NO'}`);
        }

        const officers = await User.find({ role: 'OFFICER' });
        console.log('\n--- Active Officers ---');
        officers.forEach(off => {
            console.log(`${off.name} (${off._id}) - ${off.email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

checkLands();
