const reportService = require('../services/reportService');

exports.getOverview = async (req, res) => {
    try {
        const data = await reportService.getSystemOverview();
        res.status(200).json({ success: true, data });
    } catch (error) {
        console.error("Report Overview Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const stats = await reportService.getQuarterlyStats(year);
        res.status(200).json({ success: true, year, quarterlyStats: stats });
    } catch (error) {
        console.error("Report Stats Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// API tổng hợp để tạo báo cáo theo yêu cầu
exports.generateReport = async (req, res) => {
    try {
        const { reportTypes, filters = {} } = req.body;
        const results = [];
        const year = filters.year || new Date().getFullYear();

        // Duyệt qua các loại báo cáo được yêu cầu
        for (const type of reportTypes) {
            let reportData = null;
            let title = '';
            let description = '';

            if (type === 'feedback_analysis') {
                reportData = await reportService.getFeedbackAnalysis(year);
                title = `Phân tích phản hồi năm ${year}`;
                description = 'Thống kê rating và top giảng viên';
            } 
            // Có thể thêm case 'student_progress' gọi studentService nếu cần
            
            if (reportData) {
                // Lưu vào lịch sử
                await reportService.saveReport(type, title, description, reportData, filters);
                results.push({ type, title, data: reportData });
            }
        }

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error("Generate Report Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const result = await reportService.getReportHistory(limit, (page - 1) * limit);
        
        res.status(200).json({
            success: true,
            data: result.reports,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(result.total / limit),
                totalItems: result.total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getReportTypes = (req, res) => {
    // Dữ liệu tĩnh về các loại báo cáo hệ thống hỗ trợ
    const types = [
        { id: 'feedback_analysis', name: 'Phân tích phản hồi', description: 'Đánh giá chất lượng giảng dạy', icon: '💬', color: 'red' },
        // Thêm các loại khác nếu đã implement logic
    ];
    res.json({ success: true, data: types });
};