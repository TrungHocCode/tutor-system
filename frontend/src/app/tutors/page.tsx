"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/src/app/components/Sidebar";
import Header from "@/src/app/components/Header";
import { tutorAPI } from "@/src/app/lib/api";

interface Tutor {
	_id: string;
	name: string;
	email: string;
	phone?: string;
	subject?: string;
	department?: string;
	createdAt?: string;
}

export default function TutorsPage() {
	const [tutors, setTutors] = useState<Tutor[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [showModal, setShowModal] = useState(false);
	const [editingTutor, setEditingTutor] = useState<Tutor | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		subject: "",
		department: "",
	});

	const fetchTutors = async (currentPage: number) => {
		try {
			setLoading(true);
			const response = await tutorAPI.getAll(currentPage, 10);
			setTutors(response.data || response.tutors || []);
			setTotalPages(response.totalPages || 1);
		} catch (error) {
			console.error("Error fetching tutors:", error);
			setTutors([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTutors(page);
	}, [page]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (editingTutor) {
				await tutorAPI.update(editingTutor._id, formData);
			} else {
				await tutorAPI.create(formData);
			}
			setShowModal(false);
			setEditingTutor(null);
			setFormData({
				name: "",
				email: "",
				phone: "",
				subject: "",
				department: "",
			});
			fetchTutors(page);
		} catch (error: any) {
			alert(error.message || "Có lỗi xảy ra");
		}
	};

	const handleEdit = (tutor: Tutor) => {
		setEditingTutor(tutor);
		setFormData({
			name: tutor.name,
			email: tutor.email,
			phone: tutor.phone || "",
			subject: tutor.subject || "",
			department: tutor.department || "",
		});
		setShowModal(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Bạn có chắc chắn muốn xóa tutor này?")) return;
		try {
			await tutorAPI.delete(id);
			fetchTutors(page);
		} catch (error: any) {
			alert(error.message || "Có lỗi xảy ra");
		}
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingTutor(null);
		setFormData({
			name: "",
			email: "",
			phone: "",
			subject: "",
			department: "",
		});
	};

	return (
		<div className="flex min-h-screen">
			<Sidebar />

			<div className="flex-1 ml-52">
				<Header />

				<main className="p-8">
					<div className="bg-white rounded-2xl shadow-lg p-6">
						<div className="flex items-center justify-between mb-6">
							<h1 className="text-2xl font-bold text-gray-800">
								Quản lý Tutor
							</h1>
							<button
								onClick={() => setShowModal(true)}
								className="bg-blue-700 text-white px-6 py-2.5 rounded-lg hover:bg-blue-800 transition-colors font-medium"
							>
								+ Thêm Tutor
							</button>
						</div>

						{loading ? (
							<div className="text-center py-12 text-gray-600">
								Đang tải dữ liệu...
							</div>
						) : tutors.length === 0 ? (
							<div className="text-center py-12 text-gray-600">
								Chưa có dữ liệu
							</div>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b-2 border-gray-200">
												<th className="text-left py-4 px-4 font-semibold text-gray-700">
													Họ tên
												</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-700">
													Email
												</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-700">
													Số điện thoại
												</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-700">
													Môn học
												</th>
												<th className="text-left py-4 px-4 font-semibold text-gray-700">
													Khoa
												</th>
												<th className="text-center py-4 px-4 font-semibold text-gray-700">
													Thao tác
												</th>
											</tr>
										</thead>
										<tbody>
											{tutors.map((tutor) => (
												<tr
													key={tutor._id}
													className="border-b border-gray-100 hover:bg-gray-50"
												>
													<td className="py-4 px-4 text-gray-800">
														{tutor.name}
													</td>
													<td className="py-4 px-4 text-gray-600">
														{tutor.email}
													</td>
													<td className="py-4 px-4 text-gray-600">
														{tutor.phone || "-"}
													</td>
													<td className="py-4 px-4 text-gray-600">
														{tutor.subject || "-"}
													</td>
													<td className="py-4 px-4 text-gray-600">
														{tutor.department || "-"}
													</td>
													<td className="py-4 px-4">
														<div className="flex items-center justify-center gap-2">
															<button
																onClick={() => handleEdit(tutor)}
																className="bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600 transition-colors text-sm"
															>
																Sửa
															</button>
															<button
																onClick={() => handleDelete(tutor._id)}
																className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition-colors text-sm"
															>
																Xóa
															</button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>

								{/* Pagination */}
								<div className="flex items-center justify-center gap-2 mt-6">
									<button
										onClick={() => setPage((p) => Math.max(1, p - 1))}
										disabled={page === 1}
										className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Trước
									</button>
									<span className="px-4 py-2 text-gray-700">
										Trang {page} / {totalPages}
									</span>
									<button
										onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
										disabled={page === totalPages}
										className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
									>
										Sau
									</button>
								</div>
							</>
						)}
					</div>
				</main>
			</div>

			{/* Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
						<div className="p-6 border-b border-gray-200">
							<h2 className="text-xl font-bold text-gray-800">
								{editingTutor ? "Cập nhật Tutor" : "Thêm Tutor mới"}
							</h2>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Họ tên <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									required
									value={formData.name}
									onChange={(e) =>
										setFormData({ ...formData, name: e.target.value })
									}
									className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="Nhập họ tên"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Email <span className="text-red-500">*</span>
								</label>
								<input
									type="email"
									required
									value={formData.email}
									onChange={(e) =>
										setFormData({ ...formData, email: e.target.value })
									}
									className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="Nhập email"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Số điện thoại
								</label>
								<input
									type="tel"
									value={formData.phone}
									onChange={(e) =>
										setFormData({ ...formData, phone: e.target.value })
									}
									className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="Nhập số điện thoại"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Môn học
								</label>
								<input
									type="text"
									value={formData.subject}
									onChange={(e) =>
										setFormData({ ...formData, subject: e.target.value })
									}
									className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="Nhập môn học"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Khoa
								</label>
								<input
									type="text"
									value={formData.department}
									onChange={(e) =>
										setFormData({ ...formData, department: e.target.value })
									}
									className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
									placeholder="Nhập khoa"
								/>
							</div>

							<div className="flex gap-3 pt-4">
								<button
									type="button"
									onClick={closeModal}
									className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
								>
									Hủy
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
								>
									{editingTutor ? "Cập nhật" : "Thêm mới"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}
