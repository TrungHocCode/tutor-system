const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const userService = require('./userService')
const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret'; 
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS, 10) || 10;


/**
 * Tạo JSON Web Token (JWT) cho người dùng.
 * @param {object} user - Đối tượng người dùng từ DB.
 * @returns {string} - Token JWT đã ký.
 */
function generateToken(user) {
    // Payload chỉ chứa các thông tin định danh không nhạy cảm
    const payload = {
        id: user.ID,
        email: user.Email,
        name: user.Name,
        // Có thể thêm Role/Type (Tutor/Student) tại đây
    };

    // Tạo và ký token. '1d' là hết hạn sau 1 ngày
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Đăng ký người dùng mới, băm mật khẩu và tạo tài khoản trong DB.
 * @param {object} userData - Dữ liệu người dùng (Name, Email, Password, ContactInfo)
 * @returns {object} - Đối tượng { user, token }
 */
async function register(userData) {
    // 1. Kiểm tra email đã tồn tại
    const existingUser = await userService.findByEmail(userData.Email);
    if (existingUser) {
        throw new Error('Email đã được đăng ký.');
    }

    // 2. Băm mật khẩu
    const hashedPassword = await bcrypt.hash(userData.Password, SALT_ROUNDS);
    
    // 3. Chuẩn bị dữ liệu để lưu vào DB
    const userToCreate = {
        ...userData,
        Password: hashedPassword,
    };

    // 4. Gọi userService để tạo người dùng
    const newUser = await userService.createUser(userToCreate);
    
    // 5. Tạo token và trả về
    const token = generateToken(newUser);
    delete newUser.Password; // Loại bỏ mật khẩu đã băm
    
    return { user: newUser, token };
}

/**
 * Đăng nhập người dùng, so sánh mật khẩu và cấp Token.
 * @param {string} Email - Email của người dùng
 * @param {string} Password - Mật khẩu plaintext
 * @returns {object} - Đối tượng { user, token }
 */
async function login(Email, Password) {
    // 1. Tìm người dùng bằng Email
    const user = await userService.findByEmail(Email);
    if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // 2. So sánh mật khẩu (so sánh mật khẩu plaintext với mật khẩu đã băm trong DB)
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }

    // 3. Tạo token
    const token = generateToken(user);
    
    // 4. Trả về
    delete user.Password; // Loại bỏ mật khẩu đã băm
    return { user, token };
}

/**
 * Xác minh tính hợp lệ của token (dùng cho các service khác ngoài middleware).
 * @param {string} token - Token JWT.
 * @returns {object} - Payload đã được giải mã.
 */
function verifyToken(token) {
    // Lưu ý: Middleware auth.js đã xử lý việc kiểm tra lỗi/hết hạn
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    register,
    login,
    verifyToken,
    generateToken // Có thể export nếu cần tạo token trong các service khác
};