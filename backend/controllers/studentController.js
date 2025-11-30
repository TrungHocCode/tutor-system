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