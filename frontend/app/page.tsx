"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, User, Loader2, ArrowRight } from 'lucide-react';

// --- MOCK DATA & TYPES ---
type UserRole = 'admin' | 'tutor' | 'student';

// --- COMPONENT CHÍNH ---

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const respond = await res.json()
      console.log(respond)
      if(res.ok){
        localStorage.setItem("access_token", respond.token);
		    localStorage.setItem("user_data", JSON.stringify(respond.user));
      }
      toast.success(`Chào mừng ${respond.user.Name}!`);
      
      switch (respond.user.Role) {
        case 'admin': router.push('/admin'); break;
        case 'tutor': router.push('/tutor'); break;
        case 'student': router.push('/student'); break;
        default: router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Đã có lỗi xảy ra.');
      toast.error('Đăng nhập thất bại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50">
      
      {/* --- LEFT SIDE: VIDEO BACKGROUND --- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center">
        
        {/* 1. Video Layer */}
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
        >
          {/* Đảm bảo file bk.mp4 nằm đúng trong thư mục public/ */}
          <source src="/bk.mp4" type="video/mp4" />
          Trình duyệt của bạn không hỗ trợ video thẻ.
        </video>

        {/* 2. Overlay Layer (Lớp phủ màu tối để text dễ đọc hơn) */}
        <div className="absolute inset-0 bg-blue-900/70 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent z-10"></div>

        {/* 3. Content Layer (Text & Logo) */}
        <div className="relative z-20 text-white text-center p-12 max-w-lg">
          <div className="mb-8 flex justify-center">
            <Image src="/hcmut.png" alt="HCMUT Logo" width={200} height={100} className="object-contain" />
            {/* <div className="bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
              <Image src="/hcmut.png" alt="HCMUT Logo" width={100} height={100} className="object-contain" />
            </div> */}
          </div>
          
          <h2 className="text-6xl mb-6 tracking-tight drop-shadow-lg" style={{color: '#FFFFF1', fontFamily: 'Jaro'}}>
            HCMUT TUTOR
          </h2>
          
          <p className="text-blue-100 text-lg leading-relaxed font-light drop-shadow-md">
            Kết nối tri thức, nâng tầm giá trị. <br/>
            Nền tảng hỗ trợ học tập chính thức của Trường Đại học Bách Khoa Thành phố Hồ Chí Minh.
          </p>
        </div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header Mobile */}
          <div className="text-center lg:hidden">
            <div className="mx-auto h-20 w-20 relative mb-4">
              <Image src="/hcmut.png" alt="HCMUT Logo" fill className="object-contain" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Đăng nhập</h2>
          </div>

          <div className="text-center hidden lg:block">
             <h2 className="text-5xl font-thinbold" style={{color: '#0313B0', fontFamily: 'Jaro'}}>Đăng nhập hệ thống</h2>
             <p className="text-1xl mt-2 text-gray-600" style={{fontFamily: 'Jaro'}}>Nhập thông tin tài khoản của bạn</p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium mb-1" style={{color: '#0313B0', fontFamily: 'Jaro'}}>Tên đăng nhập</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User size={20} />
                  </div>
                    <input
                      type="text"
                      required
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                                focus:ring-2 focus:ring-blue-600 focus:border-transparent 
                                transition-all outline-none placeholder-gray-500 text-gray-500"
                      style={{fontFamily: 'Jaro'}}
                      placeholder="Nhập MSSV/MCB"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                    />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium  mb-1" style={{color: '#0313B0', fontFamily: 'Jaro'}}>Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-none placeholder-gray-500 text-gray-500"
                    style={{fontFamily: 'Jaro'}}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="flex justify-end mt-2">
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800" style={{color: '#0313B0', fontFamily: 'Jaro'}}>Quên mật khẩu?</a>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="
                w-full flex justify-center py-3 px-4 
                border border-transparent text-sm font-bold rounded-lg 
                text-white 
                bg-[#0313B0] hover:bg-[#02108A] 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0313B0]
                transition-all duration-200 
                shadow-lg hover:shadow-xl 
                disabled:opacity-70 disabled:cursor-not-allowed
              "
              style={{fontFamily: 'Jaro'}}
            >
              {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : 'Đăng nhập'}
            </button>
            
            <div className="mt-6 text-center text-sm text-gray-400" style={{fontFamily: 'Jaro'}}>
              Copyright © 2024 HCMUT. All rights reserved.
            </div>
            
            {/* Dev Helper
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-500 text-center">
              Dev Mode: admin / tutor / student (Pass: any)
            </div> */}
          </form>
        </div>
      </div>
    </div>
  );
}