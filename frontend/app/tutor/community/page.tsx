"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HiOutlineSearch, HiOutlineFilter, HiX, HiUserGroup, HiChatAlt } from 'react-icons/hi';
// REUSE DATA (Dùng lại data cũ)
import { MOCK_COMMUNITIES, Community } from '@/app/data/mockData';
import toast from 'react-hot-toast';

export default function TutorCommunityPage() {
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Community | null>(null);

  const filteredCommunities = communities.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const myGroups = communities.filter(c => c.isJoined);

  const handleJoinClick = (group: Community) => {
    setSelectedGroup(group);
    setShowPopup(true);
  };

  const confirmJoin = () => {
    if (selectedGroup) {
      const updatedList = communities.map(c => 
        c.id === selectedGroup.id ? { ...c, isJoined: true } : c
      );
      setCommunities(updatedList);
      toast.success(`Đã tham gia nhóm ${selectedGroup.name}`);
      setShowPopup(false);
      setSelectedGroup(null);
    }
  };

  return (
    <div className="flex h-full gap-6">
      
      {/* CỘT TRÁI */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-blue-900">Cộng đồng giảng dạy</h2>
            <HiOutlineFilter className="w-5 h-5 text-gray-500 cursor-pointer hover:text-blue-600" />
          </div>
          <div className="relative mb-4">
             <HiOutlineSearch className="absolute left-4 top-3 text-gray-400 w-5 h-5"/>
             <input type="text" placeholder="Tìm kiếm nhóm chuyên môn..." className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2 custom-scrollbar">
            {['Tất cả', 'Chuyên môn', 'Chia sẻ kinh nghiệm', 'Tuyển dụng'].map((filter) => (
              <button key={filter} className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition whitespace-nowrap">{filter}</button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredCommunities.map((group) => (
              <div key={group.id} className="border border-gray-200 rounded-2xl p-4 flex flex-col items-center bg-gray-50 hover:bg-white hover:shadow-md transition-all relative overflow-hidden">
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-1 bg-white/80 rounded-full text-gray-600 backdrop-blur-sm shadow-sm">{group.category}</span>
                <div className="w-20 h-20 bg-linear-to-br from-blue-400 to-indigo-500 rounded-full mb-3 flex items-center justify-center text-white text-2xl font-bold shadow-lg">{group.name.charAt(0)}</div>
                <h3 className="font-bold text-lg text-gray-800 text-center line-clamp-1">{group.name}</h3>
                <p className="text-xs text-gray-500 mb-4 text-center line-clamp-2 h-8">{group.description}</p>
                <div className="flex items-center text-xs font-medium text-gray-500 mb-4"><HiUserGroup className="w-4 h-4 mr-1"/> {group.members.toLocaleString()} thành viên</div>
                
                {group.isJoined ? (
                  // SỬA LINK Ở ĐÂY: /tutor/...
                  <Link href={`/tutor/community/chat?groupId=${group.id}`} className="w-full">
                    <button className="w-full bg-green-100 text-green-700 font-bold py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-green-200 transition"><HiChatAlt className="w-5 h-5"/> Vào Chat</button>
                  </Link>
                ) : (
                  <button onClick={() => handleJoinClick(group)} className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl hover:bg-blue-700 transition shadow-blue-200 shadow-lg">Tham gia</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CỘT PHẢI */}
      <div className="w-80 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit flex flex-col gap-4">
        <div><h2 className="font-bold text-lg text-gray-800 mb-1">Nhóm của tôi</h2><p className="text-xs text-gray-500">Các nhóm bạn đang tham gia</p></div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {myGroups.map((group) => (
             // SỬA LINK Ở ĐÂY: /tutor/...
             <Link href={`/tutor/community/chat?groupId=${group.id}`} key={group.id}>
                <div className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-blue-50 transition border border-transparent hover:border-blue-100">
                   <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold mr-3">{group.name.charAt(0)}</div>
                   <div className="flex-1 min-w-0"><h4 className="font-bold text-sm text-gray-800 truncate">{group.name}</h4><p className="text-xs text-gray-500 truncate">Có tin nhắn mới...</p></div>
                </div>
             </Link>
          ))}
        </div>
      </div>

      {/* POPUP (Giữ nguyên logic) */}
      {showPopup && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-96 relative shadow-2xl animate-scale-up">
            <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black hover:bg-gray-100 p-1 rounded-full transition"><HiX className="w-6 h-6" /></button>
            <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 text-2xl"><HiUserGroup /></div>
                <h3 className="text-blue-900 font-bold text-xl mb-2">Tham gia nhóm?</h3>
                <p className="text-gray-600 mb-6 text-sm">Bạn có muốn tham gia <br/><span className="font-bold text-black">{selectedGroup.name}</span>?</p>
                <div className="flex justify-center space-x-3">
                   <button onClick={() => setShowPopup(false)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition">Hủy</button>
                   <button onClick={confirmJoin} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Đồng ý</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}