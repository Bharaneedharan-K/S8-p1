
import mongoose from 'mongoose';
import Land from './models/Land.js';
import User from './models/User.js';

const MONGODB_URI = 'mongodb+srv://bharaneedharan2004_db_user:lhymsuwks9HHsGGU@cluster0.99l7vnr.mongodb.net/?appName=Cluster0';

const checkLands = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const lands = await Land.find({});
        console.log(`Found ${lands.length} TOTAL land records.`);

        for (const land of lands) {
            const officer = await User.findById(land.officerId);
            const farmer = await User.findById(land.farmerId);
            console.log(`[${land.status}] Off: ${officer?.email} | Date: ${land.verificationDate}`);
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
