const studentService = require('../services/studentService');

exports.getStudentProfile = async(req, res) => {
    try {
        const profile = await studentService.getStudentProfile(req.user.id);
        if (!profile) return res.status(404).json({ error: 'Student profile not found.' });
        res.status(200).json(profile);
    } catch(err) {
        console.error("Error getting student profile:", err);
        res.status(500).json({error: 'Server error retrieving profile.'});
    }
};

exports.registerSession = async(req, res) => {
    try {
        const studentId = req.user.id;
        const sessionId = parseInt(req.params.sessionId);
                
        const result = await studentService.registerSession(studentId, sessionId);
        res.status(200).json(result);
    } catch(err) {
        console.error("Error handling register session", err);
        res.status(500).json({error: err.message});
    }
}

exports.cancelSession = async(req, res) => {
    try {
        const studentId = req.user.id;
        const sessionId = parseInt(req.params.sessionId);
                
        const result = await studentService.cancelSession(studentId, sessionId);
        res.status(200).json(result);
    } catch(err) {
        console.error("Error handling cancel session", err);
        res.status(500).json({error: err.message});
    }
}

exports.viewSchedule = async(req, res) => {
    try {
        const studentId = req.user.id;
                
        const result = await studentService.viewSchedule(studentId);
        res.status(200).json(result);
    } catch(err) {
        console.error("Error getting sessions", err);
        res.status(500).json({error: err.message});
    }
}
exports.getAllAvailableSessions = async(req, res) => {
    try {
        const sessions = await studentService.getAllAvailableSessions(req.user.id);
        res.status(200).json(sessions);
    } catch(err) {
        console.error("Error getting available sessions", err);
        res.status(500).json({error: err.message});
    }
}

exports.updateProfile = async (req, res) => {
    try {
        await studentService.updateStudentProfile(req.user.id, req.body);
        res.status(200).json({ message: "Cập nhật hồ sơ thành công" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    try {
        await studentService.changePassword(req.user.id, oldPassword, newPassword);
        res.status(200).json({ message: "Đổi mật khẩu thành công" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.updateNotifications = async (req, res) => {
    try {
        await studentService.updateNotificationSettings(req.user.id, req.body);
        res.status(200).json({ message: "Đã lưu cài đặt" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const settings = await studentService.getSettings(req.user.id);
        res.status(200).json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};