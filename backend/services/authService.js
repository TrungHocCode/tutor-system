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
    const payload = {
        id: user.ID,
        email: user.Email,
        name: user.Name,
        role: user.Role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Đăng ký người dùng mới, băm mật khẩu và tạo tài khoản trong DB.
 * @param {object} userData - Dữ liệu người dùng (Name, Email, Password, ContactInfo)
 * @returns {object} - Đối tượng { user, token }
 */
async function register(userData) {
    const existingUser = await userService.findByEmail(userData.Email);
    if (existingUser) {
        throw new Error('Email đã được đăng ký.');
    }
    const hashedPassword = await bcrypt.hash(userData.Password, SALT_ROUNDS);
    const userToCreate = {
        ...userData,
        Password: hashedPassword,
    };
    const newUser = await userService.createUser(userToCreate);
    const token = generateToken(newUser);
    delete newUser.Password; 
    return { user: newUser, token };
}

/**
 * Đăng nhập người dùng, so sánh mật khẩu và cấp Token.
 * @param {string} Email - Email của người dùng
 * @param {string} Password - Mật khẩu plaintext
 * @returns {object} - Đối tượng { user, token }
 */
async function login(Email, Password) {
    const user = await userService.findByEmail(Email);
    if (!user) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
        throw new Error('Email hoặc mật khẩu không đúng.');
    }
    const token = generateToken(user);
    delete user.Password; 
    return { user, token };
}

/**
 * Xác minh tính hợp lệ của token (dùng cho các service khác ngoài middleware).
 * @param {string} token - Token JWT.
 * @returns {object} - Payload đã được giải mã.
 */
function verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
}

module.exports = {
    register,
    login,
    verifyToken,
    generateToken 
};