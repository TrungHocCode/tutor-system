const db = require('../db/db');
const bcrypt = require('bcryptjs'); // Đảm bảo đã cài: npm install bcryptjs
const availabilityService = require('./availabilityService'); 
const sessionService = require('./sessionService'); 

// ... giữ nguyên hàm timeToMinutes ...
function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return (h * 60) + m;
}

class TutorService {
    // ... giữ nguyên getTutorProfile ...
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

    // --- CẬP NHẬT: Sửa cả bảng Users và Tutor ---
    async updateTutorProfile(tutorId, updateData) {
        const { Name, ContactInfo, Specialization, Experience } = updateData;

        // 1. Cập nhật bảng USERS (Name, ContactInfo)
        if (Name || ContactInfo) {
            await db.query(`
                UPDATE users 
                SET "Name" = COALESCE($1, "Name"), 
                    "ContactInfo" = COALESCE($2, "ContactInfo")
                WHERE "ID" = $3
            `, [Name, ContactInfo, tutorId]);
        }

        // 2. Cập nhật bảng TUTOR (Specialization, Experience)
        if (Specialization !== undefined || Experience !== undefined) {
             await db.query(`
                UPDATE tutor 
                SET "Specialization" = COALESCE($1, "Specialization"), 
                    "Experience" = COALESCE($2, "Experience")
                WHERE "TutorID" = $3
            `, [Specialization, Experience, tutorId]);
        }

        return this.getTutorProfile(tutorId);
    }

    // --- MỚI: Đổi mật khẩu ---
    async changePassword(userId, oldPassword, newPassword) {
        // 1. Lấy mật khẩu cũ
        const userRes = await db.query('SELECT "Password" FROM users WHERE "ID" = $1', [userId]);
        if (userRes.rows.length === 0) throw new Error("User not found");
        
        const currentHash = userRes.rows[0].Password;

        // 2. Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, currentHash);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không đúng.');
        }

        // 3. Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(newPassword, salt);

        // 4. Lưu vào DB
        await db.query('UPDATE users SET "Password" = $1 WHERE "ID" = $2', [newHash, userId]);
        
        return { message: "Đổi mật khẩu thành công" };
    }

    // ... giữ nguyên các phần Availability và Session ...
    async getMyMonthlyAvailability(tutorId, startDate, endDate) {
        return availabilityService.getMonthlyAvailability(tutorId, startDate, endDate);
    }
    
    async addAvailability(TutorID, data) {
        const availabilityData = { TutorID: TutorID, ...data };
        return availabilityService.createAvailability(availabilityData);
    }
    
    async updateAvailability(availabilityId, tutorId, data) {
        return availabilityService.updateAvailability(availabilityId, tutorId, data);
    }
    
    async deleteAvailability(availabilityId) {
        return availabilityService.deleteAvailability(availabilityId);
    }

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
        return sessionService.deleteSession(sessionId);
    }async getNotificationSettings(tutorId) {
        const sql = `SELECT "NotificationPrefs" FROM tutor WHERE "TutorID" = $1`;
        const result = await db.query(sql, [tutorId]);
        // Nếu chưa có (null), trả về object mặc định
        return result.rows[0]?.NotificationPrefs || {
            newLesson: true,
            message: true,
            reminder: true,
            system: true
        };
    }

    // --- MỚI: Cập nhật cấu hình thông báo ---
    async updateNotificationSettings(tutorId, prefs) {
        const sql = `
            UPDATE tutor 
            SET "NotificationPrefs" = $1 
            WHERE "TutorID" = $2
            RETURNING "NotificationPrefs"
        `;
        // Chuyển object thành JSON string khi lưu (pg driver thường tự handle, nhưng stringify cho chắc)
        const result = await db.query(sql, [JSON.stringify(prefs), tutorId]);
        return result.rows[0].NotificationPrefs;
    }

}

module.exports = new TutorService();