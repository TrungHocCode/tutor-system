"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/src/app/components/Sidebar";
import Header from "@/src/app/components/Header";
import { analyticsAPI } from "@/src/app/lib/api";

interface QuarterlyStat {
	quarter: number;
	students: number;
	tutors: number;
}

interface StatsData {
	year: number;
	quarterlyStats: QuarterlyStat[];
}

interface FeedbackData {
	year: number;
	total: number;
	good: number;
	bad: number;
}

export default function DashboardPage() {
	const [stats, setStats] = useState<StatsData | null>(null);
	const [feedback, setFeedback] = useState<FeedbackData | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentMonth] = useState(new Date().getMonth());
	const [selectedDate, setSelectedDate] = useState(new Date().getDate());

	useEffect(() => {
		const fetchData = async () => {
			try {
			const [statsData, feedbackData] = await Promise.all([
				analyticsAPI.getStats(),
				analyticsAPI.getFeedbackSummary(),
			]);

			console.log("Stats data:", statsData);
			console.log("Feedback data:", feedbackData);
			setStats({
				year: statsData.year,
				quarterlyStats: statsData.quarterlyStats || [],
			});
			setFeedback({
				year: feedbackData.year,
				total: feedbackData.total,
				good: feedbackData.good,
				bad: feedbackData.bad,
			});
			} catch (error) {
			console.error("Error fetching data:", error);
			} finally {
			setLoading(false);
			}
		};

		fetchData();
	}, []);

	const getMaxValue = () => {
		if (!stats) return 100; // Mặc định là 100
		const allValues = stats.quarterlyStats.flatMap((q) => [
			q.students,
			q.tutors,
		]);
		let maxData = Math.max(...allValues, 0);

		if (maxData === 0) return 50; // Nếu không có dữ liệu, mốc là 50
		if (maxData <= 10) return 10; // Nếu dữ liệu < 10, mốc là 10
		if (maxData <= 50) return 50; // Nếu dữ liệu < 50, mốc là 50
		if (maxData <= 100) return 100; // Nếu dữ liệu < 100, mốc là 100

		// Nếu > 100, làm tròn lên 100 gần nhất
		return Math.ceil(maxData / 100) * 100;
	};

	const renderCalendar = () => {
		const daysInMonth = new Date(2025, currentMonth + 1, 0).getDate();
		const firstDay = new Date(2025, currentMonth, 1).getDay();
		const days = [];

		for (let i = 0; i < firstDay; i++) {
			days.push(<div key={`empty-${i}`} />);
		}

		for (let day = 1; day <= daysInMonth; day++) {
			days.push(
				<button
					key={day}
					onClick={() => setSelectedDate(day)}
					className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
						selectedDate === day
							? "bg-blue-700 text-white"
							: "bg-gray-100 text-gray-700 hover:bg-gray-200"
					}`}
				>
					{day}
				</button>
			);
		}

		return days;
	};

	if (loading) {
		return (
			<div className="flex min-h-screen">
				<Sidebar />
				<div className="flex-1 ml-52">
					<Header />
					<main className="p-8">
						<div className="text-white text-center">Đang tải dữ liệu...</div>
					</main>
				</div>
			</div>
		);
	}

	const maxValue = getMaxValue();
	const goodPercentage = feedback ? (feedback.good / feedback.total) * 100 : 0;

	return (
		<div className="flex min-h-screen">
			<Sidebar />

			<div className="flex-1 ml-52">
				<Header />

				<main className="p-6 h-screen flex flex-col gap-6">
					<div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
						{/* Bar Chart */}
						<div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-blue-900">
									Thống kê số lượng sinh viên - tutor năm {stats?.year || 2026}
								</h2>
								<svg
									className="w-8 h-8 text-gray-700"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<rect x="4" y="4" width="4" height="16" />
									<rect x="10" y="8" width="4" height="12" />
									<rect x="16" y="2" width="4" height="18" />
								</svg>
							</div>

							<div className="mb-4">
								<p className="text-sm font-semibold text-gray-600">
									Số lượng (ngàn)
								</p>
							</div>

							<div className="relative h-72">
								{/* Y-axis labels */}
								<div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-600">
									{[7, 6, 5, 4, 3, 2, 1, 0].map((val) => (
										<div key={val}>{val}</div>
									))}
								</div>

								{/* Chart area */}
								<div className="ml-8 h-full flex items-end gap-8 pb-8">
									{stats?.quarterlyStats.map((quarter, idx) => (
										<div
											key={idx}
											className="flex-1 flex flex-col items-center"
										>
											<div className="w-full flex gap-2 h-64 items-end">
												{/* Student bar */}
												<div
													className="flex-1 bg-green-500 rounded-t transition-all hover:opacity-80"
													style={{
														height: `${(quarter.students / maxValue) * 100}%`,
													}}
													title={`Sinh viên: ${quarter.students}`}
												/>
												{/* Tutor bar */}
												<div
													className="flex-1 bg-red-500 rounded-t transition-all hover:opacity-80"
													style={{
														height: `${(quarter.tutors / maxValue) * 100}%`,
													}}
													title={`Tutor: ${quarter.tutors}`}
												/>
											</div>
											<div className="mt-2 text-sm font-medium text-gray-700">
												{quarter.quarter}
											</div>
										</div>
									))}
								</div>

								{/* X-axis label */}
								<div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-sm font-medium text-gray-600">
									Quý
								</div>
							</div>

							{/* Legend */}
							<div className="flex items-center justify-center gap-8 mt-6">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-green-500 rounded" />
									<span className="text-sm font-medium text-gray-700">
										Sinh viên
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-red-500 rounded" />
									<span className="text-sm font-medium text-gray-700">
										Tutor
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-700">
										Ghi chú
									</span>
								</div>
							</div>
						</div>

						{/* Calendar */}
						<div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-2xl font-bold text-gray-800">January</h2>
								<div className="flex items-center gap-2">
									<svg
										className="w-6 h-6 text-gray-700"
										fill="currentColor"
										viewBox="0 0 24 24"
									>
										<rect
											x="3"
											y="4"
											width="18"
											height="18"
											rx="2"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<line
											x1="3"
											y1="10"
											x2="21"
											y2="10"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<line
											x1="8"
											y1="2"
											x2="8"
											y2="6"
											stroke="currentColor"
											strokeWidth="2"
										/>
										<line
											x1="16"
											y1="2"
											x2="16"
											y2="6"
											stroke="currentColor"
											strokeWidth="2"
										/>
									</svg>
									<span className="text-xl font-bold">2025</span>
								</div>
							</div>

							<div className="grid grid-cols-7 gap-2 mb-4">
								{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
									(day) => (
										<div
											key={day}
											className="text-center text-xs font-bold text-white bg-blue-700 py-2 rounded"
										>
											{day}
										</div>
									)
								)}
							</div>

							<div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
						</div>
					</div>

					{/* Second Row */}
					<div className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6">
						{/* Pie Chart */}
						<div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-bold text-blue-900">
									Thống kê phản hồi của sinh viên năm {feedback?.year || 2026}
								</h2>
								<svg
									className="w-8 h-8 text-gray-700"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<circle
										cx="12"
										cy="12"
										r="10"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<path d="M12 2 L12 12 L20 8" fill="currentColor" />
								</svg>
							</div>

							<div className="flex items-center justify-center py-8">
								<div className="relative w-64 h-64">
									<svg
										className="w-full h-full -rotate-90"
										viewBox="0 0 100 100"
									>
										{/* Good feedback (blue) */}
										<circle
											cx="50"
											cy="50"
											r="40"
											fill="none"
											stroke="#1E40AF"
											strokeWidth="20"
											strokeDasharray={`${goodPercentage * 2.513} ${
												(100 - goodPercentage) * 2.513
											}`}
										/>
										{/* Bad feedback (red) */}
										<circle
											cx="50"
											cy="50"
											r="40"
											fill="none"
											stroke="#DC2626"
											strokeWidth="20"
											strokeDasharray={`${(100 - goodPercentage) * 2.513} ${
												goodPercentage * 2.513
											}`}
											strokeDashoffset={`-${goodPercentage * 2.513}`}
										/>
									</svg>
									<div className="absolute inset-0 flex items-center justify-center">
										<div className="text-center">
											<div className="text-3xl font-bold text-gray-800">
												{feedback?.total || 0}
											</div>
											<div className="text-sm text-gray-600">Tổng phản hồi</div>
										</div>
									</div>
								</div>
							</div>

							<div className="flex items-center justify-center gap-8 mt-4">
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-blue-700 rounded" />
									<span className="text-sm font-medium text-gray-700">
										Tốt ({feedback?.good || 0})
									</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 bg-red-600 rounded" />
									<span className="text-sm font-medium text-gray-700">
										Không tốt ({feedback?.bad || 0})
									</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-gray-700">
										Ghi chú
									</span>
								</div>
							</div>
						</div>

						{/* Report Card */}
						<div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col items-center justify-center">
							<svg
								className="w-32 h-32 mb-6 text-gray-800"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4"
								/>
							</svg>
							<button className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-gray-800 transition-colors">
								PHÂN TÍCH BÁO CÁO
							</button>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}
