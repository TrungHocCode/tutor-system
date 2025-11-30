const db = require('../db/db');
const availabilityService = require('./availabilityService'); 
const sessionService = require('./sessionService'); 

function timeToMinutes(timeStr) {
        const [h, m, s] = timeStr.split(':').map(Number);
        return (h * 60) + m;
}
class TutorService {
    
    // =======================================================
    // I. QUẢN LÝ HỒ SƠ TƯ VẤN (Tutor Profile Management)
    // =======================================================

    async getTutorProfile(userId) {
        const sql = `
            SELECT 
                u."ID", u."Name", u."Email", u."ContactInfo", u."Role",
                t."Specialization", t."Experience"
            FROM users u
            INNER JOIN tutor t ON u."ID" = t."TutorID"
            WHERE u."ID" = $1 AND u."Role" = 'tutor'
        `;
        const result = await db.query(sql, [userId]);
        return result.rows[0] || null;
    }

    async updateTutorProfile(tutorId, updateData) {
        // Logic cập nhật hồ sơ trong bảng 'tutor' (Specialization, Experience)
        // ... (Sử dụng logic tạo query động như đã thống nhất)
        const { Specialization, Experience } = updateData;
        
        const fields = [];
        const values = [];
        let paramIndex = 1;

        if (Specialization !== undefined) {
            fields.push(`"Specialization" = $${paramIndex++}`);
            values.push(Specialization);
        }
        if (Experience !== undefined) {
            fields.push(`"Experience" = $${paramIndex++}`);
            values.push(Experience);
        }

        if (fields.length === 0) {
            throw new Error("No valid tutor-specific fields to update.");
        }

        values.push(tutorId);
        
        const sql = `
            UPDATE tutor SET ${fields.join(', ')}
            WHERE "TutorID" = $${paramIndex}
            RETURNING *
        `;

        const result = await db.query(sql, values);
        
        if (result.rows[0]) {
             // Trả về toàn bộ hồ sơ đã được JOIN
             return this.getTutorProfile(tutorId);
        }
        return null;
    }
    
    // =======================================================
    // II. QUẢN LÝ LỊCH TRỐNG (Availability Delegation)
    // =======================================================
    
    async getMyMonthlyAvailability(tutorId, startDate, endDate) {
        return availabilityService.getMonthlyAvailability(tutorId, startDate, endDate);
    }
    
    async addAvailability(TutorID, data) {
        const availabilityData = { TutorID: TutorID, ...data };
        // Có thể thêm logic kiểm tra trùng lặp lịch ở đây
        return availabilityService.createAvailability(availabilityData);
    }
    
    async updateAvailability(availabilityId, tutorId, data) {
        // Gọi thẳng service, logic bảo mật (kiểm tra tutorId) đã có trong service
        return availabilityService.updateAvailability(availabilityId, tutorId, data);
    }
    
    async deleteAvailability(availabilityId) {
        // Có thể thêm logic kiểm tra: Không xóa nếu lịch đã được đặt Session
        return availabilityService.deleteAvailability(availabilityId);
    }
    
    // =======================================================
    // III. QUẢN LÝ BUỔI HỌC (Session Delegation)
    // =======================================================
    
    async createSession(tutorID, sessionData) {
        const fullSessionData = { TutorID: tutorID, ...sessionData };
        const sessionDate = sessionData.Date;
        const sessionStart = sessionData.StartTime;
        const sessionEnd = sessionData.EndTime;
        
        const availableSlots = await availabilityService.getAvailabilityByDate(tutorID, sessionDate);
        
        if (!availableSlots || availableSlots.length === 0) {
            throw new Error(`Bạn chưa thiết lập lịch rảnh nào vào ngày ${sessionDate}. Vui lòng thêm lịch rảnh trước.`);
        }

        const sessionStartMins = timeToMinutes(sessionStart);
        const sessionEndMins = timeToMinutes(sessionEnd);

        let isWithinAvailability = false;

        for (const slot of availableSlots) {
            const slotStartMins = timeToMinutes(slot.StartTime);
            const slotEndMins = timeToMinutes(slot.EndTime);

            if (sessionStartMins >= slotStartMins && sessionEndMins <= slotEndMins) {
                isWithinAvailability = true;
                break; 
            }
        }

        if (!isWithinAvailability) {
            throw new Error('Giờ học này không nằm trong khung giờ rảnh (Availability) của bạn. Vui lòng kiểm tra lại lịch rảnh.');
        }
        
        return sessionService.createSession(fullSessionData);
    }
    
    async viewMySessions(tutorId) {
        return sessionService.getSessionsByTutorId(tutorId);
    }

    async updateSession(sessionId, tutorId, updateData) {
        return sessionService.updateSession(sessionId, tutorId, updateData);
    }
    
    async deleteSession(sessionId) {
        // Có thể thêm logic: Kiểm tra nếu có student đã đăng ký thì không cho xóa
        return sessionService.deleteSession(sessionId);
    }
}

module.exports = new TutorService();