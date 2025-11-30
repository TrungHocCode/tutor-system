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

    async registerSession(studentId, sessionId) {
        const sessionCheck = await db.query(`
            SELECT 
                s."SessionID",
                s."MaxStudent",
                s."Status",
                s."Date",
                s."StartTime",
                COUNT(r."RegistrationID") as current_students
            FROM session s
            LEFT JOIN registration r ON s."SessionID" = r."SessionID" 
                AND r."Status" != 'Cancelled'
            WHERE s."SessionID" = $1
            GROUP BY s."SessionID"
        `, [sessionId]);

        if (sessionCheck.rows.length === 0) {
            throw new Error('Phiên học không tồn tại');
        }

        const session = sessionCheck.rows[0];

        const sessionDateTime = new Date(`${session.Date} ${session.StartTime}`);
        if (sessionDateTime < new Date()) {
            throw new Error('Session is expired');
        }

        if (session.current_students >= session.MaxStudent) {
            throw new Error('Phiên học đã đầy');
        }

        const result = await db.query(`
            INSERT INTO registration ("SessionID", "StudentID", "Status", "EnrollmentDate")
            VALUES ($1, $2, 'Pending', CURRENT_TIMESTAMP)
            RETURNING *
        `, [sessionId, studentId]);

        return {
            success: true,
            message: 'Register successfully',
            registration: result.rows[0]
        };
    }

    async cancelSession(studentId, sessionId) {
        const regCheck = await db.query(`
            SELECT 
                r."RegistrationID",
                r."Status",
                r."EnrollmentDate",
                s."SessionID",
                s."Status" as session_status,
                s."Date",
                s."StartTime",
                s."MaxStudent",
                s."Topic"
            FROM registration r
            JOIN session s ON r."SessionID" = s."SessionID"
            WHERE r."SessionID" = $1 AND r."StudentID" = $2
        `, [sessionId, studentId]);
        
        if (regCheck.rows.length === 0) {
            throw new Error('No session available');
        }

        const registration = regCheck.rows[0];
        
        // Kiểm tra trạng thái đăng ký
        if (registration.Status === 'Cancelled') {
            throw new Error('Your registration has been canceled before');
        }
        
        // Kiểm tra trạng thái phiên học
        if (registration.session_status === 'Completed') {
            throw new Error('Can not cancel completed session');
        }
        
        if (registration.session_status === 'Cancelled') {
            throw new Error('This session has been cancelled before');
        }

        const sessionDateTime = new Date(registration.Date);
        const [hours, minutes, seconds] = registration.StartTime.split(':');
        sessionDateTime.setHours(
            parseInt(hours), 
            parseInt(minutes), 
            parseInt(seconds || 0)
        );
        
        const now = new Date();
        const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);
        
        // Chính sách: Chỉ cho hủy trước 24 giờ
        const CANCEL_DEADLINE_HOURS = 24;
        
        if (hoursUntilSession < CANCEL_DEADLINE_HOURS) {
            throw new Error(
                `You can only cancel ${CANCEL_DEADLINE_HOURS} hours before session's start time. `
            );
        }
        
        if (sessionDateTime < now) {
            throw new Error('Can not cancel on going session');
        }

        await db.query(`
            UPDATE registration
            SET "Status" = 'Cancelled'
            WHERE "RegistrationID" = $1
        `, [registration.RegistrationID]);

        return {
            success: true,
            message: 'Cancel successfully',
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
        const result = await db.query(`
            SELECT 
                -- Registration info
                r."RegistrationID",
                r."Status" as registration_status,
                r."EnrollmentDate",
                
                -- Session info
                s."SessionID",
                s."Topic",
                s."Date",
                s."StartTime",
                s."EndTime",
                s."Format",
                s."Location",
                s."MaxStudent",
                s."Status" as session_status,
                
                -- Tutor info
                t."TutorID",
                u."Name" as tutor_name,
                u."Email" as tutor_email,
                u."ContactInfo" as tutor_contact,
                t."Specialization" as tutor_specialization,
                
                -- Calculated fields
                (s."Date" + s."StartTime") as session_datetime,
                (s."Date" + s."StartTime") > NOW() as is_upcoming,
                
                -- Number of students enrolled
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
            ORDER BY s."Date" ASC, s."StartTime" ASC
        `, [studentId]);
        
        return {
            success: true,
            count: result.rows.length,
            data: result.rows
        };
    }
}