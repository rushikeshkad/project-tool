import React, { useEffect, useMemo, useState } from "react";
import { X, Calendar, Clock } from "lucide-react";

const LeaveModal = ({
  isOpen,
  mode = "apply",
  record,
  users = [],
  year,
  month,
  onClose,
  onSubmit,
  saving,
  error,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const selectedUser = useMemo(
    () => users.find((u) => u.userId === selectedUserId) || null,
    [users, selectedUserId]
  );

  // Calculate available leaves based on type
  const availableLeaves = useMemo(() => {
    if (!selectedUser) return { planned: 0, unplanned: 0, floating: 0 };
    
    return {
      planned: selectedUser.plannedLeaves || 0,
      unplanned: selectedUser.unplannedLeaves || 0,
      floating: selectedUser.floatingHoliday || 0,
    };
  }, [selectedUser]);

  const days = useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays + 1;
  }, [fromDate, toDate]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && record) {
      setSelectedUserId(record.userId);
      setLeaveType(record.leaveType || "Planned Leave");
      const fromStr = record.fromDate ? record.fromDate.slice(0, 10) : "";
      const toStr = record.toDate ? record.toDate.slice(0, 10) : "";
      setFromDate(fromStr);
      setToDate(toStr);
    } else {
      if (users.length > 0) {
        setSelectedUserId(users[0].userId);
      } else {
        setSelectedUserId("");
      }
      setLeaveType("Planned Leave");
      setFromDate("");
      setToDate("");
    }
  }, [isOpen, mode, record, users]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }
    if (!leaveType) {
      alert("Please select a leave type.");
      return;
    }
    if (!fromDate || !toDate) {
      alert("Please select From and To dates.");
      return;
    }
    if (days <= 0) {
      alert("Please select a valid date range.");
      return;
    }

    // Validate against available leaves
    const maxAllowed = 
      leaveType === "Planned Leave" ? availableLeaves.planned :
      leaveType === "Unplanned Leave" ? availableLeaves.unplanned :
      availableLeaves.floating;

    if (days > maxAllowed) {
      alert(`Not enough ${leaveType} available. Only ${maxAllowed} days remaining.`);
      return;
    }

    const payload = {
      mode,
      userId: selectedUser.userId,
      userName: selectedUser.userName,
      email: selectedUser.email,
      leaveBalance: selectedUser.leaveBalance,
      plannedLeaves: selectedUser.plannedLeaves || 0,
      unplannedLeaves: selectedUser.unplannedLeaves || 0,
      floatingHoliday: selectedUser.floatingHoliday || 0,
      appliedLeaves: selectedUser.appliedLeaves || 0,
      leaveType,
      fromDate,
      toDate,
      days,
      year,
      month,
      id: record?.id,
    };

    onSubmit && onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl p-8 rounded-2xl shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            {mode === "edit" ? "Edit Leave" : "Apply Leave"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* User selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select User
            </label>
            <select
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                         outline-none transition-all bg-white"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Select User --</option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.userName}
                </option>
              ))}
            </select>
          </div>

          {/* Email & Available Leaves */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 text-gray-700"
                value={selectedUser?.email || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Total Leave Balance
              </label>
              <div className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-gray-50 font-semibold text-gray-800">
                {selectedUser?.leaveBalance ?? "-"}
              </div>
            </div>
          </div>

          {/* Available Leaves Breakdown */}
          {selectedUser && (
            <div className="grid grid-cols-3 gap-3 bg-gradient-to-r from-purple-50 to-cyan-50 p-4 rounded-xl">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Planned</p>
                <p className="text-lg font-bold text-blue-600">{availableLeaves.planned}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Unplanned</p>
                <p className="text-lg font-bold text-orange-600">{availableLeaves.unplanned}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">Floating (Max 2)</p>
                <p className="text-lg font-bold text-green-600">{availableLeaves.floating}</p>
              </div>
            </div>
          )}

          {/* Leave type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Leave Type
            </label>
            <select
              className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 
                         focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                         outline-none transition-all bg-white"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="Planned Leave">Planned Leave</option>
              <option value="Unplanned Leave">Unplanned Leave</option>
              <option value="Floating Holiday">Floating Holiday</option>
            </select>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                           outline-none transition-all"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                To Date
              </label>
              <input
                type="date"
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                           outline-none transition-all"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* Number of days */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Number of Days
            </label>
            <div className="border-2 border-purple-200 rounded-xl px-4 py-3 bg-gradient-to-r from-purple-50 to-cyan-50">
              <span className="text-2xl font-bold text-purple-600">{days}</span>
              <span className="text-sm text-gray-600 ml-2">
                {days === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <button
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold 
                       rounded-xl transition-colors"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white 
                       font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Saving..." : mode === "edit" ? "Update Leave" : "Apply Leave"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;