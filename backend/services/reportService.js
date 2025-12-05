const db = require('../db/db');

class ReportService {
    // 1. Thống kê tổng quan cho Dashboard
    async getSystemOverview() {
        // Sử dụng sub-queries để lấy tổng số trong 1 lần gọi DB
        const sql = `
            SELECT
                (SELECT COUNT(*) FROM users WHERE "Role" = 'student') as "totalStudents",
                (SELECT COUNT(*) FROM users WHERE "Role" = 'tutor') as "totalTutors",
                (SELECT COUNT(*) FROM feedback) as "totalFeedbacks",
                (SELECT COUNT(*) FROM session) as "totalSessions"
        `;
        const result = await db.query(sql);
        // Postgres trả về count dạng string (bigint), cần parse int
        const data = result.rows[0];
        return {
            totalStudents: parseInt(data.totalStudents),
            totalTutors: parseInt(data.totalTutors),
            totalFeedbacks: parseInt(data.totalFeedbacks),
            totalSessions: parseInt(data.totalSessions)
        };
    }

    // 2. Thống kê tăng trưởng theo quý (biểu đồ cột)
    async getQuarterlyStats(year) {
        // Query phức tạp: Tạo bảng tạm quarters 1-4, sau đó LEFT JOIN với users
        const sql = `
            WITH quarters AS (SELECT generate_series(1, 4) AS quarter)
            SELECT 
                q.quarter,
                COUNT(CASE WHEN u."Role" = 'student' THEN 1 END) as students,
                COUNT(CASE WHEN u."Role" = 'tutor' THEN 1 END) as tutors
            FROM quarters q
            LEFT JOIN users u ON EXTRACT(QUARTER FROM u."CreatedAt") = q.quarter 
                             AND EXTRACT(YEAR FROM u."CreatedAt") = $1
            GROUP BY q.quarter
            ORDER BY q.quarter;
        `;
        const result = await db.query(sql, [year]);
        return result.rows.map(row => ({
            quarter: parseInt(row.quarter),
            students: parseInt(row.students),
            tutors: parseInt(row.tutors)
        }));
    }

    // 3. Phân tích phản hồi (biểu đồ tròn + top giảng viên)
    async getFeedbackAnalysis(year) {
        // Thống kê số lượng theo rating (Good >= 4, Bad < 4)
        const sqlRating = `
            SELECT 
                COUNT(CASE WHEN "Rating" >= 4 THEN 1 END) as good,
                COUNT(CASE WHEN "Rating" < 4 THEN 1 END) as bad,
                COUNT(*) as total
            FROM feedback 
            WHERE EXTRACT(YEAR FROM "CreatedAt") = $1
        `;
        
        // Top 5 Giảng viên có rating cao nhất
        const sqlTopTutors = `
            SELECT u."Name", u."Email", t."Department", AVG(f."Rating")::NUMERIC(10,1) as avg_rating, COUNT(f."FeedbackID") as total_reviews
            FROM feedback f
            JOIN session s ON f."SessionID" = s."SessionID"
            JOIN tutor t ON s."TutorID" = t."TutorID"
            JOIN users u ON t."TutorID" = u."ID"
            WHERE EXTRACT(YEAR FROM f."CreatedAt") = $1
            GROUP BY u."ID", u."Name", u."Email", t."Department"
            HAVING COUNT(f."FeedbackID") > 0 -- Chỉ lấy ai có review
            ORDER BY avg_rating DESC
            LIMIT 5
        `;

        const [ratingRes, topRes] = await Promise.all([
            db.query(sqlRating, [year]),
            db.query(sqlTopTutors, [year])
        ]);

        return {
            ratings: {
                good: parseInt(ratingRes.rows[0].good),
                bad: parseInt(ratingRes.rows[0].bad),
                total: parseInt(ratingRes.rows[0].total)
            },
            topTutors: topRes.rows
        };
    }

    // 4. Lưu báo cáo đã tạo vào DB
    async saveReport(type, title, description, data, filters) {
        const sql = `
            INSERT INTO reports ("Type", "Title", "Description", "Data", "Filters")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING "ReportID", "Title", "CreatedAt"
        `;
        // Chuyển object data/filters thành JSON string
        const result = await db.query(sql, [
            type, 
            title, 
            description,
            JSON.stringify(data), 
            JSON.stringify(filters)
        ]);
        return result.rows[0];
    }

    // 5. Lấy lịch sử báo cáo
    async getReportHistory(limit, offset) {
        const sql = `SELECT "ReportID", "Type", "Title", "Description", "CreatedAt" FROM reports ORDER BY "CreatedAt" DESC LIMIT $1 OFFSET $2`;
        const countSql = `SELECT COUNT(*) FROM reports`;
        
        const [data, count] = await Promise.all([
            db.query(sql, [limit, offset]),
            db.query(countSql)
        ]);
        
        return {
            reports: data.rows,
            total: parseInt(count.rows[0].count)
        };
    }
}

module.exports = new ReportService();