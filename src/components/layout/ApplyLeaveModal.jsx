// src/components/layout/ApplyLeaveModal.jsx
import React, { useEffect, useMemo, useState } from "react";

const ApplyLeaveModal = ({
  isOpen,
  users = [],          // array of { userId, userName, email, leaveBalance, appliedLeaves? }
  year,
  month,
  onClose,
  onApply,             // async (payload) => void  (defined in LeaveRecordsPage)
  saving = false,
  error = "",
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [email, setEmail] = useState("");
  const [leaveBalance, setLeaveBalance] = useState(0);
  const [leaveType, setLeaveType] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [localError, setLocalError] = useState("");

  // find the selected user object
  const selectedUser = useMemo(
    () => users.find((u) => String(u.userId) === String(selectedUserId)),
    [users, selectedUserId]
  );

  // whenever selected user changes, update email + leave balance
  useEffect(() => {
    if (selectedUser) {
      setEmail(selectedUser.email || "");
      setLeaveBalance(selectedUser.leaveBalance ?? 0);
    } else {
      setEmail("");
      setLeaveBalance(0);
    }
  }, [selectedUser]);

  // reset form whenever the modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId("");
      setEmail("");
      setLeaveBalance(0);
      setLeaveType("");
      setFromDate("");
      setToDate("");
      setLocalError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // compute number of days based on from/to (inclusive)
  let numberOfDays = 0;
  if (fromDate && toDate) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (!isNaN(start) && !isNaN(end) && end >= start) {
      const diffMs = end.getTime() - start.getTime();
      numberOfDays = diffMs / (1000 * 60 * 60 * 24) + 1;
    }
  }

  const handleApplyClick = async () => {
    setLocalError("");

    if (!selectedUserId) {
      setLocalError("Please select a user.");
      return;
    }
    if (!leaveType) {
      setLocalError("Please select a leave type.");
      return;
    }
    if (!fromDate || !toDate) {
      setLocalError("Please select both From and To dates.");
      return;
    }
    if (numberOfDays <= 0) {
      setLocalError("Please make sure To date is on or after From date.");
      return;
    }

    const payload = {
      userId: selectedUser.userId,
      userName: selectedUser.userName,
      email,
      year,
      month,
      leaveType,
      fromDate,
      toDate,
      days: numberOfDays,
      currentLeaveBalance: leaveBalance,
      currentAppliedLeaves: selectedUser.appliedLeaves ?? 0,
    };

    await onApply(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">
          Apply Leave {year && month && `– ${month}/${year}`}
        </h2>

        {error && (
          <p className="text-red-600 mb-2 text-sm">
            {error}
          </p>
        )}
        {localError && (
          <p className="text-red-600 mb-2 text-sm">
            {localError}
          </p>
        )}

        <div className="space-y-4">
          {/* User selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Select User</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Choose user --</option>
              {users.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {u.userName}
                </option>
              ))}
            </select>
          </div>

          {/* Email + Leave balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                className="w-full border rounded px-3 py-2 bg-gray-50"
                value={email}
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Balance
              </label>
              <div className="px-3 py-2 border rounded bg-gray-50">
                {leaveBalance}
              </div>
            </div>
          </div>

          {/* Leave type */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Leave Type
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
            >
              <option value="">-- Choose type --</option>
              <option value="Planned Leave">Planned Leave</option>
              <option value="Unplanned Leave">Unplanned Leave</option>
              <option value="Floating Holiday">Floating Holiday</option>
            </select>
          </div>

          {/* From / To date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                From Date
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
                To Date
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
            <div className="px-3 py-2 border rounded bg-gray-50">
              {numberOfDays || "-"}
            </div>
          </div>
        </div>

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
            onClick={handleApplyClick}
            disabled={saving}
          >
            {saving ? "Applying..." : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
