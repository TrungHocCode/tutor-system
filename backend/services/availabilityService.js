const db = require('../db/db'); 

class AvailabilityService{
    async getOneAvailability(id) {
        const result = await db.query(`SELECT * FROM availability WHERE "AvailabilityID" = $1`, [id]);
        return result.rows[0] || null;
    }
    async getAvailabilityByTutorID(id){
        const result = db.query(`SELECT * from availability where TutorID = $1`,[id])
        return result.rows[0] || null
    }
    async getAvailabilityByDate(tutorId, date) {
        const sql = `
            SELECT "StartTime", "EndTime", "Status"
            FROM availability 
            WHERE "TutorID" = $1 AND "Date" = $2
            AND "Status" = 'Available'
            ORDER BY "StartTime";
        `;
        
        try {
            const result = await db.query(sql, [tutorId, date]);
            return result.rows;
        } catch (error) {
            console.error("Database error during fetching daily availability:", error);
            throw new Error('Database error during fetching daily availability.');
        }
    }
    async getMonthlyAvailability(tutorId, startDate, endDate) {
        const sql = `
            SELECT 
                "AvailabilityID", 
                to_char("Date", 'YYYY-MM-DD') as "Date", 
                "StartTime", "EndTime", "Status"
            FROM availability 
            WHERE "TutorID" = $1
            AND "Date"::DATE BETWEEN $2::DATE AND $3::DATE
            ORDER BY "Date", "StartTime";
        `;
        
        try {
            const result = await db.query(sql, [tutorId, startDate, endDate]);
            return result.rows;
        } catch (error) {
            console.error("Database error during fetching monthly availability:", error);
            throw new Error('Database error during fetching monthly availability.');
        }
    }
    async createAvailability(availabilityData){
        const {TutorID, Date, StartTime, EndTime} = availabilityData
        
        // Đảm bảo tên cột trong SQL khớp chính xác với định nghĩa trong DB
        const sql = `
        INSERT INTO availability ("TutorID", "Date", "StartTime", "EndTime")
        VALUES ($1, $2::DATE, $3, $4) 
        RETURNING "AvailabilityID", "TutorID", "Date", "StartTime", "EndTime", "CreatedAt"
        `; // Thêm dấu " vào tất cả tên cột
        
        try{
            const result = await db.query(sql, [TutorID, Date, StartTime, EndTime])
            return result.rows[0]
        }catch (error){
            console.error("Database error during availability creation:", error);
            throw new Error('Database error during availability creation.');
        }
    }
    async deleteAvailability(id) {
        const existing = await this.getOneAvailability(id);
        if (existing) {
            const sql = `DELETE FROM availability WHERE "AvailabilityID" = $1 RETURNING "AvailabilityID"`;
            const result = await db.query(sql, [id]); 
            return result.rows[0]; 
        }
        return null; 
    }
    async updateAvailability(availabilityId, tutorId, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = ['Date', 'StartTime', 'EndTime', 'Status']; 
        
        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                fields.push(`"${key}" = $${paramIndex++}`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            throw new Error("No valid fields to update.");
        }

        values.push(availabilityId); 
        values.push(tutorId); 

        const sql = `
            UPDATE availability 
            SET ${fields.join(', ')}
            WHERE "AvailabilityID" = $${paramIndex++} AND "TutorID" = $${paramIndex}
            RETURNING "AvailabilityID", "TutorID", "Date", "StartTime", "EndTime", "Status"
        `;

        try {
            const result = await db.query(sql, values);
            return result.rows[0] || null; 
        } catch (error) {
            console.error("Database error during availability update:", error);
            throw new Error('Database error during availability update.');
        }
    }
}

module.exports = new AvailabilityService();