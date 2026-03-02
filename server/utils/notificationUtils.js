import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createNotification = async (userId, title, message, type = 'INFO', link = '') => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type,
            link
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

export const notifyAdmins = async (title, message, type = 'INFO', link = '') => {
    try {
        const admins = await User.find({ role: 'ADMIN', status: 'ADMIN_ACTIVE' });
        const notifications = admins.map(admin => ({
            userId: admin._id,
            title,
            message,
            type,
            link
        }));
        if (notifications.length > 0) await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying admins:', error);
    }
};

export const notifyOfficersInDistrict = async (district, title, message, type = 'INFO', link = '') => {
    try {
        const officers = await User.find({ role: 'OFFICER', district: district, status: 'OFFICER_ACTIVE' });
        const notifications = officers.map(officer => ({
            userId: officer._id,
            title,
            message,
            type,
            link
        }));
        if (notifications.length > 0) await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying officers:', error);
    }
};

export const notifyFarmers = async (title, message, type = 'INFO', link = '') => {
    try {
        const farmers = await User.find({ role: 'FARMER' });
        // Can be slow for many farmers, but okay for MVP scheme alerts
        const notifications = farmers.map(f => ({
            userId: f._id,
            title,
            message,
            type,
            link
        }));
        await Notification.insertMany(notifications);
    } catch (error) {
        console.error('Error notifying farmers:', error);
    }
}
