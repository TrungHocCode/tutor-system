const db = require('../db/db')
class SessionService{
    async createSession(sessionData){
        const {TutorID, Topic, Date, StartTime, EndTime, Format, Location, MaxStudent} = sessionData
        sql = `INSERT into session (TutorID, Topic, Date, StartTime, EndTime, Format, Location, MaxStudent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING AvailabilityID, TutorID, Topic, Date, StartTime, EndTime, Format, Location, MaxStudent, CreatedAt`
        try{
            const result = await db.query(sql, [TutorID, Topic, Date, StartTime, EndTime, Format, Location, MaxStudent])
            return result.rows[0]
        }catch{error}{
            console.error("Database error during session creation:", error);
            throw new Error('Database error during session creation.');
        }
    }
    async getSession(sessionID){
        const result = await db.query(`SELECT * from session where SessionID = $1`,[sessionID]);
        return result.rows[0] || null
    }
    async updateSession(sessionID,tutorID, updateData){
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

        const sql = `
            UPDATE session
            SET ${fields.join(', ')}
            WHERE "SessionID" = $${paramIndex++} AND TutorID = $${paramIndex}
            RETURNING SessionID, TutorID, Date, StartTime, EndTime, Status
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
        const session = this.getSession(sessionID);
        if (session){
            const sql = `DELETE from session where SessionID = $1`;
            const result = await db.query(sql,[sessionID]);
            return result.rows[0]
        }
        return null
    }
}
module.exports = new SessionService()