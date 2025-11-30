"use client";

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { HiPaperAirplane, HiDotsVertical, HiArrowLeft } from 'react-icons/hi';
// REUSE DATA
import { MOCK_COMMUNITIES, MOCK_MESSAGES, ChatMessage } from '@/app/data/mockData';

export default function TutorChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const groupId = Number(searchParams.get('groupId') || 1); 

  const currentGroup = MOCK_COMMUNITIES.find(c => c.id === groupId);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const groupMessages = MOCK_MESSAGES.filter(m => m.groupId === groupId);
    setMessages(groupMessages);
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now(),
      groupId: groupId,
      sender: "Tôi (Tutor)", // Đổi tên để phân biệt
      text: inputValue,
      isMe: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputValue("");
  };

  const myGroups = MOCK_COMMUNITIES.filter(c => c.isJoined);

  if (!currentGroup) return <div>Nhóm không tồn tại</div>;

  return (
    <div className="flex h-full gap-6">
      
      {/* KHUNG CHAT */}
      <div className="flex-1 bg-white rounded-2xl flex flex-col border border-gray-200 shadow-sm overflow-hidden relative">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm">
           <div className="flex items-center gap-3">
              {/* SỬA LINK BACK VỀ TUTOR */}
              <button onClick={() => router.push('/tutor/community')} className="p-2 hover:bg-gray-100 rounded-full md:hidden">
                  <HiArrowLeft />
              </button>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{currentGroup.name.charAt(0)}</div>
              <div><h2 className="font-bold text-lg text-gray-800">{currentGroup.name}</h2><p className="text-xs text-green-500 flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Online</p></div>
           </div>
           <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><HiDotsVertical className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#F3F4F6] custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
              {!msg.isMe && <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">{msg.sender.charAt(0)}</div>}
              <div className={`max-w-[75%] group`}>
                {!msg.isMe && <p className="text-[10px] text-gray-500 ml-1 mb-1 font-bold">{msg.sender}</p>}
                <div className={`p-3 text-sm shadow-sm relative ${msg.isMe ? 'bg-blue-600 text-white rounded-2xl rounded-tr-none' : 'bg-white text-gray-800 rounded-2xl rounded-tl-none'}`}>
                  {msg.text}
                  <span className={`text-[9px] absolute bottom-1 right-2 opacity-70 ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>{msg.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
          <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={`Nhắn tin với tư cách Tutor...`} className="flex-1 bg-gray-100 px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
          <button type="submit" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95"><HiPaperAirplane className="rotate-90 translate-x-[-1px] w-5 h-5" /></button>
        </form>
      </div>

      {/* SIDEBAR PHẢI */}
      <div className="w-72 bg-white p-5 rounded-2xl shadow-sm border border-gray-100 h-fit hidden lg:block">
        <h3 className="font-bold text-gray-500 text-xs uppercase mb-4 tracking-wider">Chuyển nhóm nhanh</h3>
        <div className="space-y-2">
           {myGroups.map((group) => (
               // SỬA LINK Ở ĐÂY: /tutor/...
               <div key={group.id} onClick={() => router.push(`/tutor/community/chat?groupId=${group.id}`)} className={`flex items-center p-3 rounded-xl cursor-pointer transition border ${group.id === groupId ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-50'}`}>
                 <div className={`w-8 h-8 rounded-lg mr-3 flex items-center justify-center font-bold text-sm ${group.id === groupId ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>{group.name.charAt(0)}</div>
                 <span className={`text-sm font-medium truncate ${group.id === groupId ? 'text-blue-800' : 'text-gray-700'}`}>{group.name}</span>
               </div>
           ))}
        </div>
      </div>
    </div>
  );
}