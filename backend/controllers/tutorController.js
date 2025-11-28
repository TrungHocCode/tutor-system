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

exports.createSession = async (req, res) => {
    const { Topic, Date, StartTime, EndTime, Format, Location, MaxStudent } = req.body;
    if (!Topic || !Date || !StartTime) return res.status(400).json({ error: 'Missing required session fields.' });
    try {
        const newSession = await tutorService.createSession(req.user.id, req.body);
        res.status(201).json(newSession);
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ error: 'Server error creating session.' });
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