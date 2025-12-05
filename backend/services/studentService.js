const db = require('../db/db');

class StudentService {
    async getStudentProfile(userId) {
        const sql = `
            SELECT 
                u."ID", u."Name", u."Email", u."ContactInfo", u."Role",
                s."Major"
            FROM users u
            INNER JOIN student s ON u."ID" = s."StudentID"
            WHERE u."ID" = $1 AND u."Role" = 'student'
        `;
        const result = await db.query(sql, [userId]);
        return result.rows[0] || null;
    }
    async updateStudentProfile(userId, updateData) {
        const { Name, ContactInfo, Major, LearningGoals } = updateData;
        
        // Cập nhật bảng users (Name, Phone)
        await db.query(`
            UPDATE users 
            SET "Name" = COALESCE($1, "Name"), 
                "ContactInfo" = COALESCE($2, "ContactInfo")
            WHERE "ID" = $3
        `, [Name, ContactInfo, userId]);

        // Cập nhật bảng student (Major, LearningGoals)
        await db.query(`
            UPDATE student 
            SET "Major" = COALESCE($1, "Major"), 
                "LearningGoals" = COALESCE($2, "LearningGoals")
            WHERE "StudentID" = $3
        `, [Major, LearningGoals, userId]);

        return { message: "Cập nhật hồ sơ thành công" };
    }

    // 2. Đổi mật khẩu
    async changePassword(userId, oldPassword, newPassword) {
        // Lấy mật khẩu cũ từ DB
        const userRes = await db.query('SELECT "Password" FROM users WHERE "ID" = $1', [userId]);
        const currentUser = userRes.rows[0];

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(oldPassword, currentUser.Password);
        if (!isMatch) {
            throw new Error('Mật khẩu hiện tại không đúng.');
        }

        // Mã hóa mật khẩu mới
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Cập nhật
        await db.query('UPDATE users SET "Password" = $1 WHERE "ID" = $2', [hashedPassword, userId]);
        return { message: "Đổi mật khẩu thành công" };
    }

    // 3. Cập nhật cấu hình thông báo
    async updateNotificationSettings(studentId, prefs) {
        await db.query(`
            UPDATE student 
            SET "NotificationPrefs" = $1
            WHERE "StudentID" = $2
        `, [JSON.stringify(prefs), studentId]);
        return { message: "Đã lưu cài đặt thông báo" };
    }
    
    // 4. Lấy cấu hình thông báo (để hiển thị lúc load trang)
    async getSettings(studentId) {
        const res = await db.query('SELECT "NotificationPrefs" FROM student WHERE "StudentID" = $1', [studentId]);
        return res.rows[0] || {};
    }
    
    async registerSession(studentId, sessionId) {
        // FIX: dùng to_char cho Date
        const sessionCheck = await db.query(`
            SELECT 
                s."SessionID",
                s."MaxStudent",
                s."Status",
                to_char(s."Date", 'YYYY-MM-DD') as "Date", 
                s."StartTime",
                COUNT(r."RegistrationID") as current_students
            FROM session s
            LEFT JOIN registration r ON s."SessionID" = r."SessionID" 
                AND r."Status" != 'Cancelled'
            WHERE s."SessionID" = $1
            GROUP BY s."SessionID", s."Date", s."StartTime", s."MaxStudent", s."Status"
        `, [sessionId]);

        if (sessionCheck.rows.length === 0) {
            throw new Error('Phiên học không tồn tại');
        }

        const session = sessionCheck.rows[0];

        // Tạo đối tượng Date từ chuỗi YYYY-MM-DD HH:mm:ss (Giờ địa phương server)
        const sessionDateTime = new Date(`${session.Date} ${session.StartTime}`);
        
        if (sessionDateTime < new Date()) {
            throw new Error('Phiên học đã kết thúc hoặc đã diễn ra.');
        }

        if (parseInt(session.current_students) >= session.MaxStudent) {
            throw new Error('Phiên học đã đầy');
        }

        const result = await db.query(`
            INSERT INTO registration ("SessionID", "StudentID", "Status", "EnrollmentDate")
            VALUES ($1, $2, 'Pending', CURRENT_TIMESTAMP)
            RETURNING *
        `, [sessionId, studentId]);

        return {
            success: true,
            message: 'Đăng ký thành công',
            registration: result.rows[0]
        };
    }

    async cancelSession(studentId, sessionId) {
        // FIX: dùng to_char cho Date
        const regCheck = await db.query(`
            SELECT 
                r."RegistrationID",
                r."Status",
                r."EnrollmentDate",
                s."SessionID",
                s."Status" as session_status,
                to_char(s."Date", 'YYYY-MM-DD') as "Date",
                s."StartTime",
                s."MaxStudent",
                s."Topic"
            FROM registration r
            JOIN session s ON r."SessionID" = s."SessionID"
            WHERE r."SessionID" = $1 AND r."StudentID" = $2
        `, [sessionId, studentId]);
        
        if (regCheck.rows.length === 0) {
            throw new Error('Bạn chưa đăng ký lớp học này.');
        }

        const registration = regCheck.rows[0];
        
        if (registration.Status === 'Cancelled') {
            throw new Error('Bạn đã hủy đăng ký lớp này rồi.');
        }
        
        if (registration.session_status === 'Completed') {
            throw new Error('Không thể hủy lớp đã hoàn thành.');
        }
        
        if (registration.session_status === 'Cancelled') {
            throw new Error('Lớp học này đã bị hủy bởi giảng viên.');
        }

        // Logic kiểm tra 24h
        const sessionDateTime = new Date(`${registration.Date} ${registration.StartTime}`);
        const now = new Date();
        const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);
        const CANCEL_DEADLINE_HOURS = 24;
        
        if (hoursUntilSession < CANCEL_DEADLINE_HOURS && sessionDateTime > now) {
            throw new Error(
                `Bạn chỉ có thể hủy đăng ký trước ${CANCEL_DEADLINE_HOURS} giờ.`
            );
        }
        
        if (sessionDateTime < now) {
            throw new Error('Không thể hủy lớp đang hoặc đã diễn ra.');
        }

        await db.query(`
            UPDATE registration
            SET "Status" = 'Cancelled'
            WHERE "RegistrationID" = $1
        `, [registration.RegistrationID]);

        return {
            success: true,
            message: 'Hủy đăng ký thành công',
            data: {
                registrationId: registration.RegistrationID,
                sessionId: sessionId,
                topic: registration.Topic,
                sessionDate: registration.Date,
                sessionTime: registration.StartTime,
            }
        };
    }

    async viewSchedule(studentId) {
        // FIX: dùng to_char cho s."Date"
        const result = await db.query(`
            SELECT 
                r."RegistrationID",
                r."Status" as registration_status,
                r."EnrollmentDate",
                s."SessionID",
                s."Topic",
                to_char(s."Date", 'YYYY-MM-DD') as "Date",
                s."StartTime",
                s."EndTime",
                s."Format",
                s."Location",
                s."MaxStudent",
                s."Base",
                s."Status" as session_status,
                t."TutorID",
                u."Name" as tutor_name,
                u."Email" as tutor_email,
                
                -- Đếm số sinh viên
                (
                    SELECT COUNT(*)
                    FROM registration r2
                    WHERE r2."SessionID" = s."SessionID"
                        AND r2."Status" IN ('Pending', 'Confirmed')
                ) as enrolled_students
                
            FROM registration r
            JOIN session s ON r."SessionID" = s."SessionID"
            JOIN tutor t ON s."TutorID" = t."TutorID"
            JOIN users u ON t."TutorID" = u."ID"
            WHERE r."StudentID" = $1
            AND r."Status" != 'Cancelled'
            ORDER BY s."Date" ASC, s."StartTime" ASC
        `, [studentId]);
        
        return {
            success: true,
            count: result.rows.length,
            data: result.rows
        };
    }

    async getAllAvailableSessions(studentId) {
        // FIX: dùng to_char cho s."Date"
        const sql = `
            SELECT 
                s."SessionID", s."Topic", 
                to_char(s."Date", 'YYYY-MM-DD') as "Date", 
                s."StartTime", s."EndTime", 
                s."Format", s."Location", s."MaxStudent", s."Base",
                u."Name" as "TutorName",
                
                (SELECT COUNT(*) FROM registration r2 
                 WHERE r2."SessionID" = s."SessionID" 
                 AND r2."Status" != 'Cancelled') as "CurrentStudents"

            FROM session s
            JOIN tutor t ON s."TutorID" = t."TutorID"
            JOIN users u ON t."TutorID" = u."ID"
            
            WHERE s."Date" >= CURRENT_DATE 
            AND s."Status" != 'Cancelled'
            
            AND NOT EXISTS (
                SELECT 1 
                FROM registration r 
                WHERE r."SessionID" = s."SessionID" 
                AND r."StudentID" = $1 
                AND r."Status" != 'Cancelled'
            )
            
            ORDER BY s."Date", s."StartTime"
        `;
        const result = await db.query(sql, [studentId]);
        return result.rows;
    }
    async getAllStudents({ page, limit, search, major, year }) {
        const offset = (page - 1) * limit;
        let params = [];
        let whereConditions = [`u."Role" = 'student'`];
        let idx = 1;

        if (search) {
            whereConditions.push(`(u."Name" ILIKE $${idx} OR u."Email" ILIKE $${idx} OR s."StudentCode" ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }
        if (major) {
            whereConditions.push(`s."Major" = $${idx}`);
            params.push(major);
            idx++;
        }
        if (year) {
            whereConditions.push(`s."EnrollmentYear" = $${idx}`);
            params.push(year);
            idx++;
        }

        const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

        const sqlData = `
            SELECT u."ID", u."Name", u."Email", u."ContactInfo", u."CreatedAt",
                   s."StudentCode", s."Major", s."EnrollmentYear"
            FROM users u
            JOIN student s ON u."ID" = s."StudentID"
            ${whereClause}
            ORDER BY u."CreatedAt" DESC
            LIMIT $${idx} OFFSET $${idx + 1}
        `;
        
        const sqlCount = `
            SELECT COUNT(*) 
            FROM users u 
            JOIN student s ON u."ID" = s."StudentID"
            ${whereClause}
        `;

        const [dataRes, countRes] = await Promise.all([
            db.query(sqlData, [...params, limit, offset]),
            db.query(sqlCount, params)
        ]);

        return {
            students: dataRes.rows,
            total: parseInt(countRes.rows[0].count)
        };
    }

    // 2. Lấy chi tiết sinh viên theo ID
    async getStudentById(id) {
        const sql = `
            SELECT u."ID", u."Name", u."Email", u."ContactInfo", u."CreatedAt",
                   s."StudentCode", s."Major", s."EnrollmentYear", s."LearningGoals"
            FROM users u
            JOIN student s ON u."ID" = s."StudentID"
            WHERE u."ID" = $1
        `;
        const result = await db.query(sql, [id]);
        return result.rows[0];
    }

    // 3. Tạo sinh viên mới (Transaction)
    async createStudent(data) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Check email
            const exist = await client.query('SELECT "ID" FROM users WHERE "Email" = $1', [data.email]);
            if (exist.rows.length > 0) throw new Error('Email đã tồn tại');

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password || '123456', salt);

            // Insert Users
            const userRes = await client.query(`
                INSERT INTO users ("Name", "Email", "Password", "ContactInfo", "Role")
                VALUES ($1, $2, $3, $4, 'student') RETURNING "ID"
            `, [data.name, data.email, hashedPassword, data.phone]);
            const newId = userRes.rows[0].ID;

            // Insert Student
            await client.query(`
                INSERT INTO student ("StudentID", "StudentCode", "Major", "EnrollmentYear")
                VALUES ($1, $2, $3, $4)
            `, [newId, data.studentId, data.major, data.year]);

            await client.query('COMMIT');
            return { id: newId, ...data };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 4. Update Admin (cập nhật thông tin bởi admin)
    async updateStudentByAdmin(id, data) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Update User
            if (data.name || data.email || data.phone) {
                await client.query(`
                    UPDATE users SET "Name" = COALESCE($1, "Name"), "Email" = COALESCE($2, "Email"), "ContactInfo" = COALESCE($3, "ContactInfo")
                    WHERE "ID" = $4
                `, [data.name, data.email, data.phone, id]);
            }
            
            // Update Student
            if (data.studentId || data.major || data.year) {
                await client.query(`
                    UPDATE student SET "StudentCode" = COALESCE($1, "StudentCode"), "Major" = COALESCE($2, "Major"), "EnrollmentYear" = COALESCE($3, "EnrollmentYear")
                    WHERE "StudentID" = $4
                `, [data.studentId, data.major, data.year, id]);
            }

            await client.query('COMMIT');
            return { message: "Update successful" };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // 5. Delete Student (Transaction)
    async deleteStudent(id) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            // Xóa các bảng phụ trước
            await client.query('DELETE FROM registration WHERE "StudentID" = $1', [id]);
            await client.query('DELETE FROM feedback WHERE "StudentID" = $1', [id]);
            await client.query('DELETE FROM student WHERE "StudentID" = $1', [id]);
            // Xóa bảng chính
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

module.exports = new StudentService();