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

exports.getListStudents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, major, year } = req.query;
        const result = await studentService.getAllStudents({ 
            page: parseInt(page), 
            limit: parseInt(limit), 
            search, major, year 
        });
        
        res.status(200).json({
            success: true,
            data: result.students,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(result.total / limit),
                totalItems: result.total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStudentDetailAdmin = async (req, res) => {
    try {
        const student = await studentService.getStudentById(req.params.id);
        if (!student) return res.status(404).json({ error: 'Student not found' });
        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createStudentAdmin = async (req, res) => {
    try {
        const newStudent = await studentService.createStudent(req.body);
        res.status(201).json({ success: true, message: "Tạo sinh viên thành công", data: newStudent });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.updateStudentAdmin = async (req, res) => {
    try {
        await studentService.updateStudentByAdmin(req.params.id, req.body);
        res.status(200).json({ success: true, message: "Cập nhật thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteStudentAdmin = async (req, res) => {
    try {
        await studentService.deleteStudent(req.params.id);
        res.status(200).json({ success: true, message: "Xóa sinh viên thành công" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};