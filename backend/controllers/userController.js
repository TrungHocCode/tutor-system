// controllers/userController.js
const userService = require('../services/userService');

exports.getMe = async (req, res) => {
    
    const userId = req.user.id; 

    try {
        const user = await userService.getById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        
        res.status(200).json(user);
    } catch (error) {
        console.error("Get Me Error:", error);
        res.status(500).json({ error: 'Failed to retrieve user details.' });
    }
};

// Cập nhật thông tin cá nhân
exports.updateMe = async (req, res) => {
    const userId = req.user.id; 
    const updateData = req.body;

    try {
        const updatedUser = await userService.updateProfile(userId, updateData);
        
        if (!updatedUser) {
             return res.status(404).json({ error: 'User not found.' });
        }

        res.status(200).json({ 
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: error.message });
    }
};