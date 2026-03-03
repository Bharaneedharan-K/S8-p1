import User from '../models/User.js';
import Land from '../models/Land.js';
import TransferRequest from '../models/TransferRequest.js';
import SchemeApplication from '../models/SchemeApplication.js';

export const getDashboardStats = async (req, res) => {
    try {
        const role = req.userRole;
        const userId = req.userId;
        let stats = {};

        if (role === 'ADMIN') {
            const totalFarmers = await User.countDocuments({ role: 'FARMER' });
            const totalOfficers = await User.countDocuments({ role: 'OFFICER' });
            const landsMinted = await Land.countDocuments({ status: 'LAND_APPROVED' });
            
            // Pending Actions for Admin: lands pending admin approval + transfer requests pending admin approval
            const pendingLands = await Land.countDocuments({ status: 'LAND_PENDING_ADMIN_APPROVAL' });
            const pendingTransfers = await TransferRequest.countDocuments({ status: 'PENDING_ADMIN_EXECUTION' });
            const pendingActions = pendingLands + pendingTransfers;

            stats = {
                totalFarmers,
                totalOfficers,
                landsMinted,
                pendingActions
            };
        } else if (role === 'OFFICER') {
            const officer = await User.findById(userId);
            if (!officer) return res.status(404).json({ message: 'Officer not found' });

            const myDistrict = officer.district;

            // Pending Review: farmers pending verification in district + lands where officerId = me and status = LAND_PENDING_VERIFICATION
            const pendingFarmers = await User.countDocuments({ role: 'FARMER', district: myDistrict, status: 'FARMER_PENDING_VERIFICATION' });
            const pendingLands = await Land.countDocuments({ officerId: userId, status: 'LAND_PENDING_VERIFICATION' });
            const pendingReview = pendingFarmers + pendingLands;

            // Verified Today by this officer (Lands)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const verifiedToday = await Land.countDocuments({ 
                officerId: userId, 
                status: { $in: ['LAND_PENDING_ADMIN_APPROVAL', 'LAND_APPROVED'] },
                updatedAt: { $gte: today }
            });

            // Transfer requests pending officer verification
            const transferRequests = await TransferRequest.countDocuments({ status: 'PENDING_OFFICER_VERIFICATION' });

            stats = {
                assignedDistrict: myDistrict,
                pendingReview,
                verifiedToday,
                transferRequests
            };
        } else if (role === 'FARMER') {
            const landsCount = await Land.countDocuments({ farmerId: userId });
            const applicationsCount = await SchemeApplication.countDocuments({ farmerId: userId });

            stats = {
                landsCount,
                applicationsCount
            };
        }

        res.status(200).json({ success: true, stats });
    } catch (error) {
        console.error('Fetch Dashboard Stats Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
    }
};
