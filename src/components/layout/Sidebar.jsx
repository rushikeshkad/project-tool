// src/components/layout/Sidebar.jsx
import React from "react";
import { LayoutDashboard, FileEdit, List, CalendarDays } from "lucide-react";

const Sidebar = ({ currentPage, setCurrentPage, setError, handleEditMyDetails }) => {
  const items = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "add-edit", icon: FileEdit, label: "My Details" },
    { id: "all-details", icon: List, label: "All User Details" },
    { id: "leave-records", icon: CalendarDays, label: "Leave Records" },
  ];

  return (
    <aside className="w-64 bg-white shadow-xl min-h-screen">
      <nav className="p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentPage(item.id);
              setError("");
              if (item.id === "add-edit") {
                handleEditMyDetails();
              }
            }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
              currentPage === item.id
                ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg transform scale-105"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
