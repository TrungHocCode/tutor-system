"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/src/app/components/Sidebar";
import Header from "@/src/app/components/Header";
import { reportsAPI } from "@/src/app/lib/api";

interface ReportType {
	id: string;
	name: string;
	description: string;
	icon: string;
	color: string;
}

interface ReportData {
	type: string;
	title: string;
	description: string;
	data: any;
}

export default function ReportsPage() {
	const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
	const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [generatedReports, setGeneratedReports] = useState<ReportData[]>([]);
	const [showResults, setShowResults] = useState(false);
	const [filters, setFilters] = useState({
		year: new Date().getFullYear(),
		startDate: "",
		endDate: "",
	});

	useEffect(() => {
		fetchReportTypes();
	}, []);

	const fetchReportTypes = async () => {
		try {
			const response = await reportsAPI.getTypes();
			setReportTypes(response.data || []);
		} catch (error) {
			console.error("Error fetching report types:", error);
		}
	};

	const toggleReportType = (typeId: string) => {
		setSelectedTypes((prev) =>
			prev.includes(typeId)
				? prev.filter((id) => id !== typeId)
				: [...prev, typeId]
		);
	};

	const handleGenerate = async () => {
		if (selectedTypes.length === 0) {
			alert("Vui lòng chọn ít nhất một loại báo cáo");
			return;
		}

		try {
			setLoading(true);
			const response = await reportsAPI.generate(selectedTypes, filters);

			if (response.success) {
				setGeneratedReports(response.data);
				setShowResults(true);
			}
		} catch (error: any) {
			if (error.message.includes("Chưa có dữ liệu")) {
				alert("Chưa có dữ liệu để phân tích cho báo cáo được chọn");
			} else {
				alert(error.message || "Có lỗi xảy ra khi tạo báo cáo");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setSelectedTypes([]);
		setGeneratedReports([]);
		setShowResults(false);
		setFilters({
			year: new Date().getFullYear(),
			startDate: "",
			endDate: "",
		});
	};

	const getColorClasses = (color: string) => {
		const colors: Record<string, string> = {
			blue: "bg-blue-50 border-blue-200 hover:border-blue-400",
			green: "bg-green-50 border-green-200 hover:border-green-400",
			purple: "bg-purple-50 border-purple-200 hover:border-purple-400",
			yellow: "bg-yellow-50 border-yellow-200 hover:border-yellow-400",
			red: "bg-red-50 border-red-200 hover:border-red-400",
		};
		return colors[color] || colors.blue;
	};

	const getSelectedColorClasses = (color: string) => {
		const colors: Record<string, string> = {
			blue: "bg-blue-100 border-blue-500",
			green: "bg-green-100 border-green-500",
			purple: "bg-purple-100 border-purple-500",
			yellow: "bg-yellow-100 border-yellow-500",
			red: "bg-red-100 border-red-500",
		};
		return colors[color] || colors.blue;
	};

	const renderReportData = (report: ReportData) => {
		const { type, data } = report;

		switch (type) {
			case "student_progress":
				return (
					<div className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tổng sinh viên</div>
								<div className="text-2xl font-bold text-blue-700">
									{data.totalStudents}
								</div>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Năm phổ biến nhất</div>
								<div className="text-2xl font-bold text-green-700">
									Năm {data.summary.mostPopularYear}
								</div>
							</div>
							<div className="bg-purple-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Ngành phổ biến nhất</div>
								<div className="text-xl font-bold text-purple-700">
									{data.summary.mostPopularMajor}
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<h4 className="font-semibold text-gray-700 mb-3">
									Phân bố theo năm học
								</h4>
								<div className="space-y-2">
									{data.yearDistribution.map((item: any) => (
										<div key={item.year} className="flex items-center gap-3">
											<div className="w-24 text-sm text-gray-600">
												Năm {item.year}
											</div>
											<div className="flex-1 bg-gray-200 rounded-full h-6 relative">
												<div
													className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
													style={{ width: `${item.percentage}%` }}
												>
													<span className="text-xs text-white font-medium">
														{item.percentage}%
													</span>
												</div>
											</div>
											<div className="w-16 text-sm font-medium text-gray-700">
												{item.count} SV
											</div>
										</div>
									))}
								</div>
							</div>

							<div>
								<h4 className="font-semibold text-gray-700 mb-3">
									Phân bố theo ngành
								</h4>
								<div className="space-y-2">
									{data.majorDistribution.map((item: any) => (
										<div key={item.major} className="flex items-center gap-3">
											<div className="w-32 text-sm text-gray-600 truncate">
												{item.major}
											</div>
											<div className="flex-1 bg-gray-200 rounded-full h-6 relative">
												<div
													className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
													style={{ width: `${item.percentage}%` }}
												>
													<span className="text-xs text-white font-medium">
														{item.percentage}%
													</span>
												</div>
											</div>
											<div className="w-16 text-sm font-medium text-gray-700">
												{item.count} SV
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				);

			case "course_completion":
				return (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tổng giảng viên</div>
								<div className="text-2xl font-bold text-blue-700">
									{data.totalTutors}
								</div>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">
									Giảng viên đang hoạt động
								</div>
								<div className="text-2xl font-bold text-green-700">
									{data.activeTutors}
								</div>
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-gray-700 mb-3">
								Phân bố theo môn học
							</h4>
							<div className="grid grid-cols-2 gap-3">
								{data.subjectDistribution.map((item: any) => (
									<div
										key={item.subject}
										className="bg-gray-50 p-3 rounded-lg border border-gray-200"
									>
										<div className="text-sm font-medium text-gray-700">
											{item.subject}
										</div>
										<div className="flex items-center gap-2 mt-1">
											<div className="text-lg font-bold text-blue-600">
												{item.count}
											</div>
											<div className="text-xs text-gray-500">
												({item.percentage}%)
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				);

			case "activity_participation":
				return (
					<div className="space-y-4">
						<div className="bg-purple-50 p-4 rounded-lg">
							<div className="text-sm text-gray-600">
								Tổng số người tham gia
							</div>
							<div className="text-2xl font-bold text-purple-700">
								{data.totalParticipants}
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-gray-700 mb-3">
								Phân bố theo trạng thái
							</h4>
							<div className="space-y-2">
								{data.statusDistribution.map((item: any) => (
									<div key={item.status} className="flex items-center gap-3">
										<div className="w-24 text-sm text-gray-600 capitalize">
											{item.status}
										</div>
										<div className="flex-1 bg-gray-200 rounded-full h-6">
											<div
												className="bg-purple-500 h-6 rounded-full flex items-center justify-end pr-2"
												style={{ width: `${item.percentage}%` }}
											>
												<span className="text-xs text-white font-medium">
													{item.percentage}%
												</span>
											</div>
										</div>
										<div className="w-16 text-sm font-medium text-gray-700">
											{item.count}
										</div>
									</div>
								))}
							</div>
						</div>

						{data.monthlyTrend && data.monthlyTrend.length > 0 && (
							<div>
								<h4 className="font-semibold text-gray-700 mb-3">
									Xu hướng đăng ký theo tháng
								</h4>
								<div className="grid grid-cols-4 gap-2">
									{data.monthlyTrend.map((item: any) => (
										<div
											key={item.month}
											className="bg-gray-50 p-2 rounded border border-gray-200 text-center"
										>
											<div className="text-xs text-gray-600">{item.month}</div>
											<div className="text-lg font-bold text-purple-600">
												{item.count}
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				);

			case "training_results":
				return (
					<div className="space-y-4">
						<div className="grid grid-cols-3 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tổng sinh viên</div>
								<div className="text-2xl font-bold text-blue-700">
									{data.currentStats.totalStudents}
								</div>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tổng giảng viên</div>
								<div className="text-2xl font-bold text-green-700">
									{data.currentStats.totalTutors}
								</div>
							</div>
							<div className="bg-yellow-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tỷ lệ SV/GV</div>
								<div className="text-2xl font-bold text-yellow-700">
									{data.currentStats.studentTutorRatio}:1
								</div>
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-gray-700 mb-3">
								Xu hướng theo năm
							</h4>
							<div className="space-y-2">
								{data.yearlyTrend.map((item: any) => (
									<div
										key={item.year}
										className="bg-gray-50 p-3 rounded-lg border border-gray-200"
									>
										<div className="flex items-center justify-between">
											<div className="font-medium text-gray-700">
												Năm {item.year}
											</div>
											<div className="flex gap-4">
												<div className="text-sm">
													<span className="text-gray-600">SV: </span>
													<span className="font-semibold text-blue-600">
														{item.students}
													</span>
												</div>
												<div className="text-sm">
													<span className="text-gray-600">GV: </span>
													<span className="font-semibold text-green-600">
														{item.tutors}
													</span>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				);

			case "feedback_analysis":
				return (
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="bg-blue-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tổng phản hồi</div>
								<div className="text-2xl font-bold text-blue-700">
									{data.totalFeedbacks}
								</div>
							</div>
							<div className="bg-green-50 p-4 rounded-lg">
								<div className="text-sm text-gray-600">Tỷ lệ hài lòng</div>
								<div className="text-2xl font-bold text-green-700">
									{data.overallSatisfactionRate}%
								</div>
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-gray-700 mb-3">
								Phân loại phản hồi
							</h4>
							<div className="flex gap-4">
								{data.ratingDistribution.map((item: any) => (
									<div
										key={item.rating}
										className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200"
									>
										<div className="text-sm text-gray-600 capitalize">
											{item.rating === "good" ? "Tốt" : "Không tốt"}
										</div>
										<div className="text-2xl font-bold text-gray-800">
											{item.count}
										</div>
										<div className="text-xs text-gray-500">
											({item.percentage}%)
										</div>
									</div>
								))}
							</div>
						</div>

						{data.topTutors && data.topTutors.length > 0 && (
							<div>
								<h4 className="font-semibold text-gray-700 mb-3">
									Top 10 giảng viên được đánh giá cao
								</h4>
								<div className="space-y-2">
									{data.topTutors.map((tutor: any, index: number) => (
										<div
											key={index}
											className="bg-gray-50 p-3 rounded-lg border border-gray-200"
										>
											<div className="flex items-center justify-between">
												<div className="flex-1">
													<div className="font-medium text-gray-800">
														{index + 1}. {tutor.name}
													</div>
													<div className="text-xs text-gray-600">
														{tutor.subject} - {tutor.department}
													</div>
												</div>
												<div className="flex items-center gap-3">
													<div className="text-sm">
														<span className="text-green-600 font-semibold">
															{tutor.goodCount}
														</span>
														<span className="text-gray-400"> / </span>
														<span className="text-red-600 font-semibold">
															{tutor.badCount}
														</span>
													</div>
													<div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
														{tutor.satisfactionRate}%
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				);

			default:
				return (
					<div className="text-gray-500 text-center py-8">
						Không có dữ liệu hiển thị
					</div>
				);
		}
	};

	return (
		<div className="flex min-h-screen">
			<Sidebar />

			<div className="flex-1 ml-52">
				<Header />

				<main className="p-8">
					<div className="max-w-7xl mx-auto">
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-800 mb-2">
								📊 Phân tích báo cáo
							</h1>
							<p className="text-gray-600">
								Chọn loại báo cáo để phân tích dữ liệu và tạo báo cáo chi tiết
							</p>
						</div>

						{!showResults ? (
							<>
								{/* Filters */}
								<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
									<h2 className="text-lg font-semibold text-gray-800 mb-4">
										 Bộ lọc
									</h2>
									<div className="grid grid-cols-3 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Năm
											</label>
											<input
												type="number"
												value={filters.year}
												onChange={(e) =>
													setFilters({
														...filters,
														year: parseInt(e.target.value),
													})
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Từ ngày
											</label>
											<input
												type="date"
												value={filters.startDate}
												onChange={(e) =>
													setFilters({ ...filters, startDate: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Đến ngày
											</label>
											<input
												type="date"
												value={filters.endDate}
												onChange={(e) =>
													setFilters({ ...filters, endDate: e.target.value })
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
											/>
										</div>
									</div>
								</div>

								{/* Report Types */}
								<div className="bg-white rounded-xl shadow-lg p-6 mb-6">
									<h2 className="text-lg font-semibold text-gray-800 mb-4">
									     Chọn loại báo cáo
										{selectedTypes.length > 0 && (
											<span className="ml-2 text-sm text-blue-600">
												({selectedTypes.length} đã chọn)
											</span>
										)}
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{reportTypes.map((type) => {
											const isSelected = selectedTypes.includes(type.id);
											return (
												<button
													key={type.id}
													onClick={() => toggleReportType(type.id)}
													className={`p-4 border-2 rounded-xl transition-all text-left ${
														isSelected
															? getSelectedColorClasses(type.color)
															: getColorClasses(type.color)
													}`}
												>
													<div className="flex items-start gap-3">
														<div className="text-3xl">{type.icon}</div>
														<div className="flex-1">
															<h3 className="font-semibold text-gray-800 mb-1">
																{type.name}
															</h3>
															<p className="text-xs text-gray-600">
																{type.description}
															</p>
														</div>
														{isSelected && (
															<div className="text-green-600">✓</div>
														)}
													</div>
												</button>
											);
										})}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex justify-center gap-4">
									<button
										onClick={handleReset}
										className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
									>
										Đặt lại
									</button>
									<button
										onClick={handleGenerate}
										disabled={loading || selectedTypes.length === 0}
										className="px-8 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
									>
										{loading ? (
											<>
												<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
												Đang tạo báo cáo...
											</>
										) : (
											<>
												<span>🚀</span>
												Tạo báo cáo
											</>
										)}
									</button>
								</div>
							</>
						) : (
							<>
								{/* Results */}
								<div className="space-y-6">
									{generatedReports.map((report, index) => (
										<div
											key={index}
											className="bg-white rounded-xl shadow-lg p-6"
										>
											<div className="flex items-start justify-between mb-4">
												<div>
													<h2 className="text-xl font-bold text-gray-800">
														{report.title}
													</h2>
													<p className="text-sm text-gray-600 mt-1">
														{report.description}
													</p>
												</div>
											</div>
											<div className="border-t border-gray-200 pt-4">
												{renderReportData(report)}
											</div>
										</div>
									))}
								</div>

								{/* Action Buttons */}
								<div className="flex justify-center gap-4 mt-6">
									<button
										onClick={handleReset}
										className="px-8 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
									>
										Tạo báo cáo mới
									</button>
									<button
										onClick={() => window.print()}
										className="px-8 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
									>
										 Tải xuống PDF
									</button>
								</div>
							</>
						)}
					</div>
				</main>
			</div>
		</div>
	);
}