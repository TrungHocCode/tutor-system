"use client";

import { useEffect, useState, useCallback } from "react";
// import Sidebar from "@/app/components/Sidebar"; 
// import Header from "@/app/components/Header";   
import { HiPencilAlt, HiTrash, HiSearch, HiPlus } from "react-icons/hi";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation"; // Import để chuyển trang

// --- INTERFACE ---
interface Student {
	ID: number;
	Name: string;
	Email: string;
	StudentCode: string;
	ContactInfo: string;
	Major: string;
	EnrollmentYear: number;
}

const API_BASE = 'http://localhost:5000/api/students';

export default function StudentsPage() {
	const router = useRouter(); // Hook điều hướng

	// --- STATE ---
	const [students, setStudents] = useState<Student[]>([]);
	const [loading, setLoading] = useState(true);
	
	// Pagination & Filter
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState("");
	const [filterMajor, setFilterMajor] = useState("");
	const [filterYear, setFilterYear] = useState("");

	// Modal & Form
	const [showModal, setShowModal] = useState(false);
	const [editingStudent, setEditingStudent] = useState<Student | null>(null);
	const [formData, setFormData] = useState({
		name: "", email: "", studentId: "", phone: "", major: "", year: "",
	});
	// --- FETCH DATA ---
	const fetchStudents = useCallback(async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('access_token');
        const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
		

			// Query params
			const params = new URLSearchParams({ page: page.toString(), limit: "10" });
			if (search) params.append("search", search);
			if (filterMajor) params.append("major", filterMajor);
			if (filterYear) params.append("year", filterYear);

			// GỌI API VỚI HEADER
			const response = await fetch(`${API_BASE}/list?${params.toString()}`, {
				method: 'GET',
				headers: headers // Thêm headers vào đây
			});

			const data = await response.json();

			if (data.success) {
				setStudents(data.data);
				setTotalPages(data.pagination.totalPages);
			} else {
				setStudents([]);
			}
		} catch (error) {
			console.error("Error fetching students:", error);
			toast.error("Lỗi kết nối server");
		} finally {
			setLoading(false);
		}
	}, [page, search, filterMajor, filterYear, router]);

	useEffect(() => {
		const timer = setTimeout(() => {
			fetchStudents();
		}, 500);
		return () => clearTimeout(timer);
	}, [fetchStudents]);

	// --- SUBMIT (CREATE / UPDATE) ---
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const toastId = toast.loading("Đang xử lý...");
		
		try {
			const payload = {
				name: formData.name,
				email: formData.email,
				studentId: formData.studentId,
				phone: formData.phone,
				major: formData.major,
				year: formData.year ? parseInt(formData.year) : undefined,
				password: "Student@123" 
			};

			let url = `${API_BASE}/create`;
			let method = 'POST';

			if (editingStudent) {
				url = `${API_BASE}/update/${editingStudent.ID}`;
				method = 'PUT';
			}
            			const token = localStorage.getItem('access_token');
        const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };
			// GỌI API VỚI HEADER
			const res = await fetch(url, {
				method,
				headers: headers, // Thêm headers vào đây
				body: JSON.stringify(payload)
			});

			const result = await res.json();

			if (result.success) {
				toast.success(editingStudent ? "Cập nhật thành công!" : "Tạo mới thành công!", { id: toastId });
				closeModal();
				fetchStudents();
			} else {
				throw new Error(result.message);
			}
		} catch (error: any) {
			toast.error(error.message || "Có lỗi xảy ra", { id: toastId });
		}
	};

	// --- DELETE ---
	const handleDelete = async (id: number) => {
		if (!confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) return;
		
		const toastId = toast.loading("Đang xóa...");
		try {
						const token = localStorage.getItem('access_token');
        const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      };

			// GỌI API VỚI HEADER
			const res = await fetch(`${API_BASE}/delete/${id}`, { 
				method: 'DELETE',
				headers: headers // Thêm headers vào đây
			});
			
			const result = await res.json();

			if (result.success) {
				toast.success("Đã xóa sinh viên", { id: toastId });
				fetchStudents();
			} else {
				throw new Error(result.message);
			}
		} catch (error: any) {
			toast.error(error.message || "Lỗi khi xóa", { id: toastId });
		}
	};

	// --- HELPER FUNCTIONS ---
	const handleEdit = (student: Student) => {
		setEditingStudent(student);
		setFormData({
			name: student.Name,
			email: student.Email,
			studentId: student.StudentCode || "",
			phone: student.ContactInfo || "",
			major: student.Major || "",
			year: student.EnrollmentYear ? String(student.EnrollmentYear) : "",
		});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingStudent(null);
		setFormData({
			name: "", email: "", studentId: "", phone: "", major: "", year: "",
		});
	};

	// --- RENDER ---
	return (
		<div className="flex min-h-screen bg-gray-50">
			{/* <Sidebar /> */}
			
			<div className="flex-1 ml-0 md:ml-0 p-8"> 
                <Toaster position="top-right" />

				<main>
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
						
                        {/* HEADER */}
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
							<div>
                                <h1 className="text-2xl font-bold text-gray-800">Quản lý Sinh viên</h1>
                                <p className="text-sm text-gray-500 mt-1">Quản lý thông tin và tài khoản sinh viên</p>
                            </div>
							<button
								onClick={() => setShowModal(true)}
								className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
							>
								<HiPlus className="w-5 h-5" />
                                Thêm Sinh viên
							</button>
						</div>

                        {/* FILTERS */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="md:col-span-2 relative">
                                <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Tìm theo tên, email, MSSV..." 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={filterMajor}
                                    onChange={(e) => setFilterMajor(e.target.value)}
                                >
                                    <option value="">Tất cả ngành</option>
                                    <option value="CNTT">CNTT</option>
                                    <option value="Kinh tế">Kinh tế</option>
                                </select>
                            </div>
                            <div>
                                <select 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(e.target.value)}
                                >
                                    <option value="">Tất cả năm</option>
                                    <option value="2023">2023</option>
                                    <option value="2024">2024</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                        </div>

                        {/* TABLE */}
						{loading ? (
							<div className="text-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
								<span className="text-gray-500">Đang tải dữ liệu...</span>
							</div>
						) : students.length === 0 ? (
							<div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-gray-500">Không tìm thấy sinh viên nào.</p>
							</div>
						) : (
							<>
								<div className="overflow-x-auto rounded-lg border border-gray-200">
									<table className="w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">MSSV</th>
												<th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Họ tên & Email</th>
												<th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Liên hệ</th>
												<th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Ngành</th>
												<th className="text-left py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Năm</th>
												<th className="text-center py-4 px-6 font-semibold text-gray-600 text-sm uppercase tracking-wider">Thao tác</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{students.map((student) => (
												<tr key={student.ID} className="hover:bg-blue-50/50 transition-colors">
													<td className="py-4 px-6 text-gray-800 font-medium">
														{student.StudentCode || <span className="text-gray-400 italic">--</span>}
													</td>
													<td className="py-4 px-6">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-900 font-medium">{student.Name}</span>
                                                            <span className="text-gray-500 text-sm">{student.Email}</span>
                                                        </div>
													</td>
													<td className="py-4 px-6 text-gray-600">
														{student.ContactInfo || "-"}
													</td>
													<td className="py-4 px-6 text-gray-600">
														<span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
                                                            {student.Major || "N/A"}
                                                        </span>
													</td>
													<td className="py-4 px-6 text-gray-600">
														{student.EnrollmentYear || "-"}
													</td>
													<td className="py-4 px-6">
														<div className="flex items-center justify-center gap-3">
															<button
																onClick={() => handleEdit(student)}
																className="text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 p-2 rounded-full transition-all"
                                                                title="Chỉnh sửa"
															>
																<HiPencilAlt className="w-5 h-5" />
															</button>
															<button
																onClick={() => handleDelete(student.ID)}
																className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-full transition-all"
                                                                title="Xóa"
															>
																<HiTrash className="w-5 h-5" />
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Pagination */}
								<div className="flex items-center justify-between mt-6 border-t pt-4">
                                    <span className="text-sm text-gray-500">
                                        Trang <span className="font-bold">{page}</span> / <span className="font-bold">{totalPages}</span>
                                    </span>
									<div className="flex gap-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Trước
                                        </button>
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Sau
                                        </button>
                                    </div>
								</div>
							</>
						)}
					</div>
				</main>
			</div>

			{/* Modal Form - Giữ nguyên giao diện của bạn nhưng logic submit đã update ở trên */}
			{showModal && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
							<h2 className="text-xl font-bold text-gray-800">
								{editingStudent ? "Cập nhật Sinh viên" : "Thêm Sinh viên mới"}
							</h2>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* ... Phần Form Input giữ nguyên như code trước ... */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">MSSV</label>
                                    <input
                                        type="text"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="VD: SV2024001"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Năm nhập học</label>
                                    <input
                                        type="number"
                                        value={formData.year}
                                        onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="VD: 2024"
                                    />
                                </div>
                            </div>
                            
                            <div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Họ tên *</label>
								<input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
                            <div>
								<label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
								<input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
							</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SĐT</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ngành</label>
                                    <input type="text" value={formData.major} onChange={(e) => setFormData({ ...formData, major: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>

							<div className="flex gap-3 pt-4 border-t border-gray-100">
								<button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Hủy</button>
								<button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg">Lưu lại</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}