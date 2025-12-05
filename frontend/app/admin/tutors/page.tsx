"use client";

import { useEffect, useState, useCallback } from "react";
// import Sidebar from "@/app/components/Sidebar"; // Uncomment nếu dùng
// import Header from "@/app/components/Header";   // Uncomment nếu dùng
import { HiPencilAlt, HiTrash, HiSearch, HiPlus, HiFilter } from "react-icons/hi";
import toast, { Toaster } from 'react-hot-toast';
import { useRouter } from "next/navigation";

// --- INTERFACE KHỚP VỚI POSTGRESQL ---
interface Tutor {
	ID: number;
	Name: string;
	Email: string;
	ContactInfo: string;   // DB lưu là ContactInfo
	Specialization: string;
	Experience: string;
	Department: string;
	Subject: string;
}

const API_BASE = 'http://localhost:5000/api/tutors';

export default function TutorsPage() {
	const router = useRouter();

	// --- STATE ---
	const [tutors, setTutors] = useState<Tutor[]>([]);
	const [loading, setLoading] = useState(true);
	
	// Pagination & Filter
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [search, setSearch] = useState("");
	const [filterDept, setFilterDept] = useState(""); // Lọc theo khoa

	// Modal & Form
	const [showModal, setShowModal] = useState(false);
	const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		department: "",
		specialization: "",
		experience: ""
	});

	// --- HELPER: Lấy Header Auth ---
	const getAuthHeaders = () => {
		const token = localStorage.getItem('access_token');
		return {
			'Content-Type': 'application/json',
			...(token && { 'Authorization': `Bearer ${token}` })
		};
	};

	// --- FETCH DATA ---
	const fetchTutors = useCallback(async () => {
		try {
			setLoading(true);
			const headers = getAuthHeaders();
			
			// Query params
			const params = new URLSearchParams({ page: page.toString(), limit: "10" });
			if (search) params.append("search", search);
			if (filterDept) params.append("department", filterDept);

			const response = await fetch(`${API_BASE}/list?${params.toString()}`, {
				method: 'GET',
				headers: headers
			});

			const data = await response.json();

			if (data.success) {
				setTutors(data.data);
				// Tính toán totalPages nếu backend trả về totalItems
				const totalItems = data.pagination?.totalItems || 0;
				const calculatedPages = Math.ceil(totalItems / 10) || 1;
				setTotalPages(calculatedPages);
			} else {
				setTutors([]);
			}
		} catch (error) {
			console.error("Error fetching tutors:", error);
			toast.error("Lỗi kết nối server");
		} finally {
			setLoading(false);
		}
	}, [page, search, filterDept, router]);

	// Debounce Search
	useEffect(() => {
		const timer = setTimeout(() => {
			fetchTutors();
		}, 500);
		return () => clearTimeout(timer);
	}, [fetchTutors]);

	// --- SUBMIT (CREATE) ---
	// Lưu ý: Update Tutor cho Admin chưa được define rõ trong service trước đó, 
	// nên ở đây ta tập trung vào Create và Delete. Nếu cần Update, cần bổ sung route PUT /update/:id ở Backend.
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const toastId = toast.loading("Đang xử lý...");

		try {
			const headers = getAuthHeaders();

			// Payload mapping
			const payload = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				subject: formData.subject,
				department: formData.department,
				specialization: formData.specialization,
				experience: formData.experience,
				password: "Tutor@123" // Mật khẩu mặc định
			};

			let url = `${API_BASE}/create`; // Route Admin tạo Tutor
			let method = 'POST';

			// Nếu có logic update thì mở comment này
			/*
			if (editingTutor) {
				url = `${API_BASE}/update/${editingTutor.ID}`; // Cần BE hỗ trợ route này
				method = 'PUT';
			}
			*/
			if (editingTutor) {
				toast.error("Chức năng cập nhật Tutor bởi Admin đang bảo trì", { id: toastId });
				return;
			}

			const res = await fetch(url, {
				method,
				headers,
				body: JSON.stringify(payload)
			});

			const result = await res.json();

			if (result.success) {
				toast.success("Thành công!", { id: toastId });
				closeModal();
				fetchTutors();
			} else {
				throw new Error(result.message || result.error);
			}
		} catch (error: any) {
			toast.error(error.message || "Có lỗi xảy ra", { id: toastId });
		}
	};

	// --- DELETE ---
	const handleDelete = async (id: number) => {
		if (!confirm("Bạn có chắc chắn muốn xóa Tutor này?")) return;
		const toastId = toast.loading("Đang xóa...");
		
		try {
			const headers = getAuthHeaders();
			const res = await fetch(`${API_BASE}/delete/${id}`, {
				method: 'DELETE',
				headers
			});
			const result = await res.json();

			if (result.success) {
				toast.success("Đã xóa Tutor", { id: toastId });
				fetchTutors();
			} else {
				throw new Error(result.message || "Lỗi khi xóa");
			}
		} catch (error: any) {
			toast.error(error.message || "Lỗi khi xóa", { id: toastId });
		}
	};

	// --- HELPER UI ---
	const handleEdit = (tutor: Tutor) => {
		setEditingTutor(tutor);
		setFormData({
			name: tutor.Name,
			email: tutor.Email,
			phone: tutor.ContactInfo || "",
			subject: tutor.Subject || "",
			department: tutor.Department || "",
			specialization: tutor.Specialization || "",
			experience: tutor.Experience || ""
		});
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingTutor(null);
		setFormData({
			name: "", email: "", phone: "", subject: "", department: "", specialization: "", experience: ""
		});
	};

	return (
		<div className="flex min-h-screen bg-gray-50">
			{/* <Sidebar /> */}
			<div className="flex-1 ml-0 md:ml-0 p-8">
				{/* <Header /> */}
				<Toaster position="top-right" />

				<main>
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
						{/* HEADER */}
						<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
							<div>
								<h1 className="text-2xl font-bold text-gray-800">Quản lý Gia sư</h1>
								<p className="text-sm text-gray-500 mt-1">Danh sách và thông tin giảng viên/gia sư</p>
							</div>
							<button
								onClick={() => setShowModal(true)}
								className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md"
							>
								<HiPlus className="w-5 h-5" />
								Thêm Tutor
							</button>
						</div>

						{/* FILTERS */}
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
							<div className="md:col-span-2 relative">
								<HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<input
									type="text"
									placeholder="Tìm theo tên, email, môn học..."
									className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
								/>
							</div>
							<div className="relative">
								<HiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
								<select
									className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none"
									value={filterDept}
									onChange={(e) => setFilterDept(e.target.value)}
								>
									<option value="">Tất cả khoa</option>
									<option value="Khoa học Máy tính">Khoa học Máy tính</option>
									<option value="Toán Ứng dụng">Toán Ứng dụng</option>
									<option value="Vật lý Kỹ thuật">Vật lý Kỹ thuật</option>
									<option value="Ngôn ngữ Anh">Ngôn ngữ Anh</option>
								</select>
							</div>
						</div>

						{/* TABLE */}
						{loading ? (
							<div className="text-center py-20">
								<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
								<span className="text-gray-500">Đang tải dữ liệu...</span>
							</div>
						) : tutors.length === 0 ? (
							<div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
								<p className="text-gray-500">Không tìm thấy gia sư nào.</p>
							</div>
						) : (
							<>
								<div className="overflow-x-auto rounded-lg border border-gray-200">
									<table className="w-full">
										<thead className="bg-gray-50">
											<tr>
												<th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm uppercase">Giảng viên</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm uppercase">Liên hệ</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm uppercase">Chuyên môn</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-600 text-sm uppercase">Khoa / Bộ môn</th>
												<th className="text-center py-4 px-4 font-semibold text-gray-600 text-sm uppercase">Thao tác</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{tutors.map((tutor) => (
												<tr key={tutor.ID} className="hover:bg-blue-50/50 transition-colors">
													<td className="py-4 px-4">
														<div className="flex flex-col">
															<span className="text-gray-900 font-medium">{tutor.Name}</span>
															<span className="text-gray-500 text-xs">ID: {tutor.ID}</span>
														</div>
													</td>
													<td className="py-4 px-4 text-sm text-gray-600">
														<div>{tutor.Email}</div>
														<div className="text-gray-400 text-xs">{tutor.ContactInfo}</div>
													</td>
													<td className="py-4 px-4 text-sm text-gray-600">
														<div className="font-medium text-gray-700">{tutor.Subject}</div>
														<div className="text-xs truncate max-w-[150px]" title={tutor.Specialization}>{tutor.Specialization}</div>
													</td>
													<td className="py-4 px-4 text-sm text-gray-600">
														<span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
															{tutor.Department || "N/A"}
														</span>
													</td>
													<td className="py-4 px-4">
														<div className="flex items-center justify-center gap-2">
															<button
																onClick={() => handleEdit(tutor)}
																className="text-yellow-600 bg-yellow-50 p-2 rounded-full hover:bg-yellow-100 transition-colors"
																title="Xem chi tiết (Edit)"
															>
																<HiPencilAlt className="w-5 h-5" />
															</button>
															<button
																onClick={() => handleDelete(tutor.ID)}
																className="text-red-600 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
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

								{/* PAGINATION */}
								<div className="flex items-center justify-between mt-6 border-t pt-4">
									<span className="text-sm text-gray-500">
										Trang <span className="font-bold">{page}</span> / <span className="font-bold">{totalPages}</span>
									</span>
									<div className="flex gap-2">
										<button
											onClick={() => setPage((p) => Math.max(1, p - 1))}
											disabled={page === 1}
											className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
										>
											Trước
										</button>
										<button
											onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
											disabled={page === totalPages}
											className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
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

			{/* MODAL FORM */}
			{showModal && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
						<div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
							<h2 className="text-xl font-bold text-gray-800">
								{editingTutor ? "Thông tin Tutor" : "Thêm Tutor mới"}
							</h2>
							<button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
								<input
									type="text" required value={formData.name}
									onChange={(e) => setFormData({ ...formData, name: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
								<input
									type="email" required value={formData.email}
									onChange={(e) => setFormData({ ...formData, email: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
									<input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Khoa</label>
									<input type="text" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" placeholder="VD: Toán Ứng dụng" />
								</div>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Môn học</label>
									<input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
									<input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Chuyên môn sâu</label>
								<textarea
									rows={2}
									value={formData.specialization}
									onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
								/>
							</div>

							{!editingTutor && (
								<div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
									<span className="font-bold">Note:</span> Mật khẩu mặc định là <code>Tutor@123</code>
								</div>
							)}

							<div className="flex gap-3 pt-4 border-t">
								<button type="button" onClick={closeModal} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">Hủy</button>
								{/* Chỉ hiển thị nút Lưu khi tạo mới (Vì Update chưa implement ở BE) */}
								{!editingTutor && (
									<button type="submit" className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-medium">Tạo mới</button>
								)}
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}