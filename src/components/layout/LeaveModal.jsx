import React, { useEffect, useMemo, useState } from "react";
import { X, Calendar, Plus, Trash2 } from "lucide-react";

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
  
  // Multiple leave entries
  const [leaveEntries, setLeaveEntries] = useState([
    { leaveType: "Planned Leave", fromDate: "", toDate: "", id: Date.now() }
  ]);

  // Editable leave balances (for edit mode)
  const [editableBalances, setEditableBalances] = useState({
    totalLeaves: 0,
    plannedLeaves: 0,
    unplannedLeaves: 0,
    floatingHoliday: 0,
  });

  const selectedUser = useMemo(
    () => users.find((u) => u.userId === selectedUserId) || null,
    [users, selectedUserId]
  );

  const availableLeaves = useMemo(() => {
    if (!selectedUser) return { planned: 0, unplanned: 0, floating: 0, total: 0 };
    
    // In edit mode, use editable balances, otherwise use user's current balances
    if (mode === "edit") {
      return {
        planned: editableBalances.plannedLeaves,
        unplanned: editableBalances.unplannedLeaves,
        floating: editableBalances.floatingHoliday,
        total: editableBalances.totalLeaves,
      };
    }
    
    return {
      planned: selectedUser.plannedLeaves || 0,
      unplanned: selectedUser.unplannedLeaves || 0,
      floating: selectedUser.floatingHoliday || 0,
      total: selectedUser.leaveBalance || 0,
    };
  }, [selectedUser, mode, editableBalances]);

  const calculateDays = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays + 1;
  };

  const totalsByType = useMemo(() => {
    const totals = { "Planned Leave": 0, "Unplanned Leave": 0, "Floating Holiday": 0 };
    leaveEntries.forEach(entry => {
      const days = calculateDays(entry.fromDate, entry.toDate);
      totals[entry.leaveType] += days;
    });
    return totals;
  }, [leaveEntries]);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && record) {
      setSelectedUserId(record.userId);
      
      // Set editable balances
      setEditableBalances({
        totalLeaves: record.leaveBalance || 0,
        plannedLeaves: record.plannedLeaves || 0,
        unplannedLeaves: record.unplannedLeaves || 0,
        floatingHoliday: record.floatingHoliday || 0,
      });
      
      // Load existing applications if available
      if (record.leaveApplications && record.leaveApplications.length > 0) {
        setLeaveEntries(record.leaveApplications.map(app => ({
          leaveType: app.leaveType,
          fromDate: app.fromDate ? app.fromDate.slice(0, 10) : "",
          toDate: app.toDate ? app.toDate.slice(0, 10) : "",
          id: app.id || Date.now() + Math.random()
        })));
      } else {
        setLeaveEntries([{
          leaveType: record.leaveType || "Planned Leave",
          fromDate: record.fromDate ? record.fromDate.slice(0, 10) : "",
          toDate: record.toDate ? record.toDate.slice(0, 10) : "",
          id: Date.now()
        }]);
      }
    } else {
      if (users.length > 0) {
        setSelectedUserId(users[0].userId);
      }
      setLeaveEntries([
        { leaveType: "Planned Leave", fromDate: "", toDate: "", id: Date.now() }
      ]);
      setEditableBalances({
        totalLeaves: 0,
        plannedLeaves: 0,
        unplannedLeaves: 0,
        floatingHoliday: 0,
      });
    }
  }, [isOpen, mode, record, users]);

  if (!isOpen) return null;

  const addLeaveEntry = () => {
    setLeaveEntries([
      ...leaveEntries,
      { leaveType: "Planned Leave", fromDate: "", toDate: "", id: Date.now() }
    ]);
  };

  const removeLeaveEntry = (id) => {
    if (leaveEntries.length === 1) {
      alert("At least one leave entry is required");
      return;
    }
    setLeaveEntries(leaveEntries.filter(entry => entry.id !== id));
  };

  const updateLeaveEntry = (id, field, value) => {
    setLeaveEntries(leaveEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    // Validate all entries
    for (const entry of leaveEntries) {
      if (!entry.leaveType) {
        alert("Please select leave type for all entries.");
        return;
      }
      if (!entry.fromDate || !entry.toDate) {
        alert("Please select dates for all entries.");
        return;
      }
      const days = calculateDays(entry.fromDate, entry.toDate);
      if (days <= 0) {
        alert("Please select valid date ranges for all entries.");
        return;
      }
    }

    // Validate against available leaves
    if (totalsByType["Planned Leave"] > availableLeaves.planned) {
      alert(`Not enough Planned Leave. Only ${availableLeaves.planned} days available.`);
      return;
    }
    if (totalsByType["Unplanned Leave"] > availableLeaves.unplanned) {
      alert(`Not enough Unplanned Leave. Only ${availableLeaves.unplanned} days available.`);
      return;
    }
    if (totalsByType["Floating Holiday"] > availableLeaves.floating) {
      alert(`Not enough Floating Holiday. Only ${availableLeaves.floating} days available.`);
      return;
    }

    const payload = {
      mode,
      userId: selectedUser.userId,
      userName: selectedUser.userName,
      email: selectedUser.email,
      // Include updated balances if in edit mode
      leaveBalance: mode === "edit" ? editableBalances.totalLeaves : selectedUser.leaveBalance,
      plannedLeaves: mode === "edit" ? editableBalances.plannedLeaves : selectedUser.plannedLeaves || 0,
      unplannedLeaves: mode === "edit" ? editableBalances.unplannedLeaves : selectedUser.unplannedLeaves || 0,
      floatingHoliday: mode === "edit" ? editableBalances.floatingHoliday : selectedUser.floatingHoliday || 0,
      appliedLeaves: selectedUser.appliedLeaves || 0,
      leaveEntries: leaveEntries.map(entry => ({
        leaveType: entry.leaveType,
        fromDate: entry.fromDate,
        toDate: entry.toDate,
        days: calculateDays(entry.fromDate, entry.toDate)
      })),
      year,
      month,
      id: record?.id,
    };

    onSubmit && onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn overflow-y-auto py-8">
      <div className="bg-white w-full max-w-4xl p-8 rounded-2xl shadow-2xl my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            {mode === "edit" ? "Edit Leave" : "Apply Multiple Leaves"}
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

        <div className="space-y-6">
          {/* User selector */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-6 rounded-xl">
            <div className="grid grid-cols-2 gap-4">
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
                  disabled={mode === "edit"}
                >
                  <option value="">-- Select User --</option>
                  {users.map((u) => (
                    <option key={u.userId} value={u.userId}>
                      {u.userName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 bg-white text-gray-700"
                  value={selectedUser?.email || ""}
                  readOnly
                />
              </div>
            </div>

            {/* Available Leaves Summary */}
            {selectedUser && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">Leave Balances</h4>
                  {mode === "edit" && (
                    <span className="text-xs text-gray-600">Edit balances below</span>
                  )}
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Total</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        value={editableBalances.totalLeaves}
                        onChange={(e) => setEditableBalances({
                          ...editableBalances,
                          totalLeaves: parseInt(e.target.value) || 0
                        })}
                        className="text-xl font-bold text-gray-800 w-full text-center border-2 border-gray-300 rounded px-2"
                      />
                    ) : (
                      <p className="text-xl font-bold text-gray-800">{availableLeaves.total}</p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Planned (PL)</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        value={editableBalances.plannedLeaves}
                        onChange={(e) => setEditableBalances({
                          ...editableBalances,
                          plannedLeaves: parseInt(e.target.value) || 0
                        })}
                        className="text-xl font-bold text-blue-600 w-full text-center border-2 border-blue-300 rounded px-2"
                      />
                    ) : (
                      <p className="text-xl font-bold text-blue-600">{availableLeaves.planned}</p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Unplanned (UL)</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        value={editableBalances.unplannedLeaves}
                        onChange={(e) => setEditableBalances({
                          ...editableBalances,
                          unplannedLeaves: parseInt(e.target.value) || 0
                        })}
                        className="text-xl font-bold text-orange-600 w-full text-center border-2 border-orange-300 rounded px-2"
                      />
                    ) : (
                      <p className="text-xl font-bold text-orange-600">{availableLeaves.unplanned}</p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Floating (FH)</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        max="2"
                        value={editableBalances.floatingHoliday}
                        onChange={(e) => setEditableBalances({
                          ...editableBalances,
                          floatingHoliday: parseInt(e.target.value) || 0
                        })}
                        className="text-xl font-bold text-green-600 w-full text-center border-2 border-green-300 rounded px-2"
                      />
                    ) : (
                      <p className="text-xl font-bold text-green-600">{availableLeaves.floating}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Leave Entries */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Leave Applications</h3>
              <button
                onClick={addLeaveEntry}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                           text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Leave</span>
              </button>
            </div>

            {leaveEntries.map((entry, index) => {
              const days = calculateDays(entry.fromDate, entry.toDate);
              return (
                <div key={entry.id} className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-700">Leave Entry #{index + 1}</h4>
                    {leaveEntries.length > 1 && (
                      <button
                        onClick={() => removeLeaveEntry(entry.id)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type
                      </label>
                      <select
                        className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 
                                   focus:border-purple-500 outline-none bg-white"
                        value={entry.leaveType}
                        onChange={(e) => updateLeaveEntry(entry.id, 'leaveType', e.target.value)}
                      >
                        <option value="Planned Leave">Planned Leave (PL)</option>
                        <option value="Unplanned Leave">Unplanned Leave (UL)</option>
                        <option value="Floating Holiday">Floating Holiday (FH)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 
                                   focus:border-purple-500 outline-none"
                        value={entry.fromDate}
                        onChange={(e) => updateLeaveEntry(entry.id, 'fromDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        To Date
                      </label>
                      <input
                        type="date"
                        className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 
                                   focus:border-purple-500 outline-none"
                        value={entry.toDate}
                        onChange={(e) => updateLeaveEntry(entry.id, 'toDate', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Days
                      </label>
                      <div className="border-2 border-gray-300 rounded-lg px-3 py-2 bg-white text-center">
                        <span className="text-lg font-bold text-purple-600">{days}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-3">Application Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total PL</p>
                <p className="text-2xl font-bold text-blue-600">{totalsByType["Planned Leave"]}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total UL</p>
                <p className="text-2xl font-bold text-orange-600">{totalsByType["Unplanned Leave"]}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total FH</p>
                <p className="text-2xl font-bold text-green-600">{totalsByType["Floating Holiday"]}</p>
              </div>
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
            {saving ? "Saving..." : mode === "edit" ? "Update Leave" : "Apply Leaves"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveModal;