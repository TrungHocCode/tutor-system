const db = require('../db/db');

class SessionService {
    async createSession(sessionData){
        const {TutorID, Topic, Date, StartTime, EndTime, Format, Location, MaxStudent, Base} = sessionData
        
        // FIX: Trả về Date dạng chuỗi YYYY-MM-DD để tránh lệch múi giờ
        const sql = `
            INSERT into session (
                "TutorID", "Topic", "Date", "StartTime", "EndTime", 
                "Format", "Location", "MaxStudent", "Base", "Status"
            )
            VALUES ($1, $2, $3::DATE, $4, $5, $6, $7, $8, $9, 'open')
            RETURNING "SessionID", "TutorID", "Topic", to_char("Date", 'YYYY-MM-DD') as "Date", "StartTime", "EndTime", "Format", "Location", "MaxStudent", "Base", "Status", "CreatedAt"
        `;
        
        try{
            const result = await db.query(sql, [TutorID, Topic, Date, StartTime, EndTime, Format, Location, MaxStudent, Base])
            return result.rows[0]
        }catch(error){
            console.error("Database error during session creation:", error);
            throw new Error('Database error during session creation.');
        }
    }

    // 🔥 QUAN TRỌNG: Đây là hàm bị thiếu gây ra lỗi của bạn
    async getSessionsByTutorId(tutorId) {
        const sql = `
            SELECT 
                "SessionID", "Topic", 
                to_char("Date", 'YYYY-MM-DD') as "Date", 
                "StartTime", "EndTime", 
                "Format", "Location", "MaxStudent", "Status", "Base"
            FROM session 
            WHERE "TutorID" = $1
            ORDER BY "Date", "StartTime"
        `;
        try {
            const result = await db.query(sql, [tutorId]);
            return result.rows;
        } catch (error) {
            console.error("Database error fetching sessions:", error);
            throw new Error('Database error fetching sessions.');
        }
    }

    async getSession(sessionID){
        const result = await db.query(`SELECT * from session where "SessionID" = $1`,[sessionID]);
        return result.rows[0] || null
    }

    async updateSession(sessionID, tutorID, updateData){
        const fields = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = ['Topic','Date', 'StartTime', 'EndTime','Format','Location','MaxStudent', 'Status']; 
        
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                fields.push(`"${key}" = $${paramIndex++}`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            throw new Error("No valid fields to update.");
        }

        values.push(sessionID); 
        values.push(tutorID); 

        // FIX: Trả về Date dạng chuỗi
        const sql = `
            UPDATE session
            SET ${fields.join(', ')}
            WHERE "SessionID" = $${paramIndex++} AND "TutorID" = $${paramIndex}
            RETURNING "SessionID", "Topic", to_char("Date", 'YYYY-MM-DD') as "Date", "StartTime", "EndTime", "Status"
        `;

        try {
            const result = await db.query(sql, values);
            return result.rows[0] || null; 
        } catch (error) {
            console.error("Database error during session update:", error);
            throw new Error('Database error during session update.');
        }
    }

    async deleteSession(sessionID){
        const session = await this.getSession(sessionID);
        if (session){
            const sql = `DELETE from session where "SessionID" = $1 RETURNING "SessionID"`;
            const result = await db.query(sql,[sessionID]);
            return result.rows[0]
        }
        return null
    }
}

module.exports = new SessionService();