const tutorService = require('../services/tutorService');

exports.getTutorProfile = async (req, res) => {
    try {
        const profile = await tutorService.getTutorProfile(req.user.id);
        if (!profile) return res.status(404).json({ error: 'Tutor profile not found.' });
        res.status(200).json(profile);
    } catch (error) {
        console.error("Error getting tutor profile:", error);
        res.status(500).json({ error: 'Server error retrieving profile.' });
    }
};

exports.updateTutorProfile = async (req, res) => {
    try {
        const updatedProfile = await tutorService.updateTutorProfile(req.user.id, req.body);
        if (!updatedProfile) return res.status(404).json({ error: 'Tutor profile not found or no changes made.' });
        res.status(200).json(updatedProfile);
    } catch (error) {
        console.error("Error updating tutor profile:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getTutorMonthlyAvailability = async (req, res) => {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'Start and end dates are required.' });
    try {
        const availability = await tutorService.getMyMonthlyAvailability(req.user.id, start, end);
        res.status(200).json(availability);
    } catch (error) {
        console.error("Error getting monthly availability:", error);
        res.status(500).json({ error: 'Server error retrieving availability.' });
    }
};

exports.addAvailability = async (req, res) => {
    const { Date, StartTime, EndTime } = req.body;
    if (!Date || !StartTime || !EndTime) return res.status(400).json({ error: 'Missing required date/time fields.' });
    try {
        const newAvailability = await tutorService.addAvailability(req.user.id, req.body);
        res.status(201).json(newAvailability);
    } catch (error) {
        console.error("Error adding availability:", error);
        res.status(500).json({ error: 'Server error adding availability.' });
    }
};
exports.updateAvailability = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedAvailability = await tutorService.updateAvailability(id, req.user.id, req.body);
        if (!updatedAvailability) return res.status(404).json({ error: 'Availability not found or unauthorized.' });
        res.status(200).json(updatedAvailability);
    } catch (error) {
        console.error("Error updating availability:", error);
        res.status(500).json({ error: 'Server error updating availability.' });
    }
};

// NEW: Xóa lịch rảnh
exports.deleteAvailability = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedResult = await tutorService.deleteAvailability(id);
        if (deletedResult.rowCount === 0) return res.status(404).json({ error: 'Availability not found.' });
        res.status(200).json({ message: 'Availability successfully deleted.' });
    } catch (error) {
        console.error("Error deleting availability:", error);
        res.status(500).json({ error: 'Server error deleting availability.' });
    }
};
exports.createSession = async (req, res) => {
    const { Topic, Date, StartTime, EndTime, Format, Location, MaxStudent, Base } = req.body;
    if (!Topic || !Date || !StartTime) return res.status(400).json({ error: 'Missing required session fields.' });
    try {
        const newSession = await tutorService.createSession(req.user.id, req.body);
        res.status(201).json(newSession);
    } catch (error) {
        console.error("Error creating session:", error);
        if (error.message.includes('lịch rảnh') || error.message.includes('Availability')) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Server error creating session.' });
    }
};
exports.updateSession = async (req, res) => {
    const { id } = req.params;
    try {
        // Cần truyền req.user.id để đảm bảo Tutor chỉ sửa buổi học của chính mình
        const updatedSession = await tutorService.updateSession(id, req.user.id, req.body);
        
        if (!updatedSession) {
            return res.status(404).json({ error: 'Session not found or unauthorized.' });
        }
        res.status(200).json(updatedSession);
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ error: 'Server error updating session.' });
    }
};

// NEW: Xóa buổi học (Hoặc hủy buổi)
exports.deleteSession = async (req, res) => {
    const { id } = req.params;
    try {
        // Lưu ý: Nếu muốn bảo mật hơn, Service nên check cả TutorID trước khi xóa
        // Hiện tại tutorService.deleteSession chỉ gọi sessionService.deleteSession(id)
        // Bạn có thể update service sau nếu cần check quyền sở hữu
        const deletedResult = await tutorService.deleteSession(id);
        
        if (!deletedResult) {
            return res.status(404).json({ error: 'Session not found.' });
        }
        res.status(200).json({ message: 'Session successfully deleted.' });
    } catch (error) {
        console.error("Error deleting session:", error);
        res.status(500).json({ error: 'Server error deleting session.' });
    }
};
exports.viewMySessions = async (req, res) => {
    try {
        const sessions = await tutorService.viewMySessions(req.user.id);
        res.status(200).json(sessions);
    } catch (error) {
        console.error("Error viewing sessions:", error);
        res.status(500).json({ error: 'Server error retrieving sessions.' });
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Vui lòng nhập đầy đủ mật khẩu cũ và mới.' });
    }
    
    try {
        await tutorService.changePassword(req.user.id, oldPassword, newPassword);
        res.status(200).json({ message: "Đổi mật khẩu thành công." });
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(400).json({ error: error.message }); // Trả về 400 nếu sai pass cũ
    }
};

exports.getNotificationSettings = async (req, res) => {
    try {
        const settings = await tutorService.getNotificationSettings(req.user.id);
        res.status(200).json(settings);
    } catch (error) {
        console.error("Error getting settings:", error);
        res.status(500).json({ error: 'Lỗi tải cấu hình thông báo.' });
    }
};

// --- MỚI: Update Settings ---
exports.updateNotificationSettings = async (req, res) => {
    try {
        // req.body sẽ là object { newLesson: true, ... }
        const updatedSettings = await tutorService.updateNotificationSettings(req.user.id, req.body);
        res.status(200).json({ message: "Đã lưu cài đặt", settings: updatedSettings });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ error: 'Lỗi lưu cấu hình thông báo.' });
    }
};