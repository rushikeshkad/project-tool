// src/components/layout/LeaveModal.jsx
import React, { useEffect, useMemo, useState } from "react";

const LeaveModal = ({
  isOpen,
  mode = "apply",         // "apply" | "edit"
  record,                  // existing leave record in edit mode
  users = [],              // [{ userId, userName, email, leaveBalance, appliedLeaves }, ...]
  year,
  month,
  onClose,
  onSubmit,               // (payload) => Promise/void
  saving,
  error,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Compute selected user from list
  const selectedUser = useMemo(
    () => users.find((u) => u.userId === selectedUserId) || null,
    [users, selectedUserId]
  );

  // Compute number of days between fromDate and toDate (inclusive)
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

  // Initialize form when modal opens or when record/users change
  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && record) {
      // Pre-fill from existing record
      setSelectedUserId(record.userId);

      setLeaveType(record.leaveType || "Planned Leave");

      // Assume record.fromDate / toDate are "YYYY-MM-DD" or ISO strings
      const fromStr = record.fromDate
        ? record.fromDate.slice(0, 10)
        : "";
      const toStr = record.toDate ? record.toDate.slice(0, 10) : "";

      setFromDate(fromStr);
      setToDate(toStr);
    } else {
      // Apply mode: default to first user if available
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

    const payload = {
      mode, // "apply" or "edit"
      userId: selectedUser.userId,
      userName: selectedUser.userName,
      email: selectedUser.email,
      leaveBalance: selectedUser.leaveBalance,
      appliedLeaves: selectedUser.appliedLeaves,
      leaveType,
      fromDate,
      toDate,
      days,
      year,
      month,
      // include id in edit mode if present
      id: record?.id,
    };

    onSubmit && onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          {mode === "edit" ? "Edit Leave" : "Apply Leave"}
        </h2>

        {error && (
          <p className="text-red-600 mb-3 text-sm">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {/* User selector */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select User
            </label>
            <select
              className="w-full border rounded px-3 py-2"
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

          {/* Email & leave balance row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={selectedUser?.email || ""}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Balance
              </label>
              <div className="border rounded px-3 py-2 bg-gray-50">
                {selectedUser?.leaveBalance ?? "-"}
              </div>
            </div>
          </div>

          {/* Leave type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Leave Type
            </label>
            <select
              className="w-full border rounded px-3 py-2"
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
              <label className="block text-sm font-medium mb-1">
                From
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                To
              </label>
              <input
                type="date"
                className="w-full border rounded px-3 py-2"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          {/* Number of days */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Number of Days
            </label>
            <div className="border rounded px-3 py-2 bg-gray-50 font-semibold">
              {days}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : mode === "edit"
              ? "Update"
              : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;
