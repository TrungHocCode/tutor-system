// services/userService.js

// Giả định db đã được import
const db = require('../db/db'); 

class userService {
    // 1. Tìm người dùng bằng Email (Đã hiện thực, dùng cho Auth)
    async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE "Email" = $1`;
        const result = await db.query(sql, [email]);
        return result.rows[0] || null;
    }

    // 2. Tạo người dùng mới (Đã hiện thực, dùng cho Auth)
    async createUser(userData) {
        // ... (Code INSERT)
        // ...
    }
    
    // 3. Lấy thông tin người dùng bằng ID (Dùng cho /me hoặc các chức năng khác)
    async getById(id) {
        const sql = `
            SELECT "ID", "Name", "Email", "ContactInfo", "CreatedAt" 
            FROM users 
            WHERE "ID" = $1
        `;
        const result = await db.query(sql, [id]);
        return result.rows[0] || null;
    }

    // 4. Cập nhật thông tin người dùng
    // Quan trọng: Chỉ cho phép người dùng cập nhật thông tin của CHÍNH HỌ
    async updateProfile(id, updateData) {
        // Tạo chuỗi SET động từ updateData để xử lý linh hoạt các trường muốn cập nhật
        const fields = [];
        const values = [];
        let paramIndex = 1;

        // Chỉ cho phép cập nhật các trường này
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

        values.push(id); // ID là tham số cuối cùng
        
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