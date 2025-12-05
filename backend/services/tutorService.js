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
    async getAllTutors({ page, limit, search, department }) {
        const offset = (page - 1) * limit;
        let params = [];
        let conditions = [`u."Role" = 'tutor'`];
        let idx = 1;

        if (search) {
            conditions.push(`(u."Name" ILIKE $${idx} OR u."Email" ILIKE $${idx} OR t."Subject" ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }
        if (department) {
            conditions.push(`t."Department" = $${idx}`);
            params.push(department);
            idx++;
        }

        const whereSql = `WHERE ${conditions.join(' AND ')}`;
        
        const sqlData = `
            SELECT u."ID", u."Name", u."Email", u."ContactInfo", u."CreatedAt",
                   t."Specialization", t."Experience", t."Department", t."Subject"
            FROM users u
            JOIN tutor t ON u."ID" = t."TutorID"
            ${whereSql}
            ORDER BY u."CreatedAt" DESC
            LIMIT $${idx} OFFSET $${idx + 1}
        `;
        
        const sqlCount = `SELECT COUNT(*) FROM users u JOIN tutor t ON u."ID" = t."TutorID" ${whereSql}`;

        const [rows, count] = await Promise.all([
            db.query(sqlData, [...params, limit, offset]),
            db.query(sqlCount, params)
        ]);

        return { 
            tutors: rows.rows, 
            total: parseInt(count.rows[0].count) 
        };
    }

    // 2. Tạo Tutor mới (Transaction users + tutor)
    async createTutorByAdmin(data) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Check email
            const exist = await client.query('SELECT "ID" FROM users WHERE "Email" = $1', [data.email]);
            if (exist.rows.length > 0) throw new Error('Email đã tồn tại');

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(data.password || '123456', salt);

            // Create User
            const userRes = await client.query(`
                INSERT INTO users ("Name", "Email", "Password", "ContactInfo", "Role")
                VALUES ($1, $2, $3, $4, 'tutor') RETURNING "ID"
            `, [data.name, data.email, hash, data.phone]);
            const newId = userRes.rows[0].ID;

            // Create Tutor Profile (bao gồm Department, Subject mới thêm vào DB)
            await client.query(`
                INSERT INTO tutor ("TutorID", "Subject", "Department", "Specialization", "Experience")
                VALUES ($1, $2, $3, $4, $5)
            `, [newId, data.subject, data.department, data.specialization, data.experience]);

            await client.query('COMMIT');
            return { id: newId, ...data };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    // 3. Xóa Tutor (Transaction xóa các bảng liên quan)
    async deleteTutor(id) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            // Xóa availability
            await client.query('DELETE FROM availability WHERE "TutorID" = $1', [id]);
            // Xóa session (và các bảng con của session nếu chưa setup CASCADE)
            // Lưu ý: Cần xóa Registration, Feedback, SessionMaterial trước nếu không có ON DELETE CASCADE
            // Giả sử xóa cơ bản:
            await client.query('DELETE FROM tutor WHERE "TutorID" = $1', [id]);
            await client.query('DELETE FROM users WHERE "ID" = $1', [id]);
            
            await client.query('COMMIT');
            return { message: "Deleted successfully" };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

}

module.exports = new TutorService();