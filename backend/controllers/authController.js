const authService = require('../services/authService');

exports.registerUser = async (req, res) => {
    // Lấy dữ liệu từ body của request
    const { Name, Email, Password, ContactInfo, Role } = req.body;
    
    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!Name || !Email || !Password) {
        return res.status(400).json({ error: 'Missing required fields: Name, Email, and Password are required.' });
    }

    try {
        // Gọi Auth Service để xử lý logic nghiệp vụ (băm mật khẩu, tạo user, tạo token)
        const { user, token } = await authService.register({ Name, Email, Password, ContactInfo,Role });

        // Trả về thành công
        res.status(201).json({ 
            message: 'User registered successfully',
            user: user,
            token: token // Trả về token để user có thể đăng nhập ngay
        });

    } catch (error) {
        // Xử lý lỗi từ Service (ví dụ: Email đã tồn tại)
        if (error.message.includes('Email đã được đăng ký')) {
            return res.status(409).json({ error: error.message }); // 409 Conflict
        }
        console.error("Registration Error:", error);
        res.status(500).json({ error: 'Failed to register user due to a server error.' });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and Password are required.' });
    }

    try {
        // Gọi Auth Service để xử lý logic đăng nhập
        const { user, token } = await authService.login(email, password);

        // Trả về thành công
        res.status(200).json({ 
            message: 'Login successful',
            user: user,
            token: token 
        });

    } catch (error) {
        // Xử lý lỗi xác thực (Sai email/mật khẩu)
        if (error.message.includes('Email hoặc mật khẩu không đúng')) {
            return res.status(401).json({ error: error.message }); // 401 Unauthorized
        }
        
        console.error("Login Error:", error);
        res.status(500).json({ error: 'Failed to login due to a server error.' });
    }
};