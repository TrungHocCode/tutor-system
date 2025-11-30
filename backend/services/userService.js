const db = require('../db/db'); 

class userService {

    async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE "Email" = $1`;
        const result = await db.query(sql, [email]);
        return result.rows[0] || null;
    }

    async createUser(userData) {
        const { Name, Email, Password, ContactInfo, Role } = userData;
        
        const sql = `
            INSERT INTO users ("Name", "Email", "Password", "ContactInfo", "Role")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING "ID", "Name", "Email", "ContactInfo","Role", "CreatedAt"; -- RETURNING để lấy lại dữ liệu đã tạo
        `;
        
        try {
            const result = await db.query(sql, [Name, Email, Password, ContactInfo, Role]);
            return result.rows[0];
        } catch (error) {
            console.error("Error creating user:", error);
            throw new Error('Database error during user creation.');
        }
    }
        async getById(id) {
        const sql = `
            SELECT "ID", "Name", "Email", "ContactInfo","Role", "CreatedAt" 
            FROM users 
            WHERE "ID" = $1
        `;
        const result = await db.query(sql, [id]);
        return result.rows[0] || null;
    }

    async updateProfile(id, updateData) {
        const fields = [];
        const values = [];
        let paramIndex = 1;

        const allowedFields = ['Name', 'ContactInfo']; 

        for (const key of allowedFields) {
            if (updateData[key] !== undefined) {
                fields.push(`"${key}" = $${paramIndex++}`);
                values.push(updateData[key]);
            }
        }

        if (fields.length === 0) {
            throw new Error("No valid fields to update.");
        }

        values.push(id); 
        
        const sql = `
            UPDATE users SET ${fields.join(', ')}
            WHERE "ID" = $${paramIndex}
            RETURNING "ID", "Name", "Email", "ContactInfo", "CreatedAt"
        `;

        const result = await db.query(sql, values);
        return result.rows[0];
    }
}

module.exports = new userService();