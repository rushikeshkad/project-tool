import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const LeaveModal = ({
  isOpen,
  mode = "apply",
  record,
  allUsers = [],
  year,
  month,
  onClose,
  onSubmit,
  saving,
  error,
  currentUserEmail,
}) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  
  // Breakdown entries with dates: array of {type: "FL"/"PL"/"UL", days: number, dateFrom, dateTo}
  const [breakdowns, setBreakdowns] = useState([
    { type: "FL", days: 0, dateFrom: "", dateTo: "", id: Date.now() }
  ]);

  // Editable leave balances (for edit mode only)
  const [editableBalances, setEditableBalances] = useState({
    fl: 0,
    pl: 0,
    ul: 0,
  });

  // Track if balances were changed
  const [balancesChanged, setBalancesChanged] = useState(false);
  
  // Track if breakdowns were changed
  const [breakdownsChanged, setBreakdownsChanged] = useState(false);

  const selectedUser = useMemo(
    () => allUsers.find((u) => u.email === selectedUserEmail) || null,
    [allUsers, selectedUserEmail]
  );

  // Get leave balances from UserDetails table
  const availableLeaves = useMemo(() => {
    if (!selectedUser) return { FL: 0, PL: 0, UL: 0 };
    
    // Get from user details (pl, ul, fl fields)
    return {
      FL: selectedUser.fl || 0,
      PL: selectedUser.pl || 0,
      UL: selectedUser.ul || 0,
    };
  }, [selectedUser]);

  // Calculate business days (excluding Saturday and Sunday)
  const calculateBusinessDays = (from, to) => {
    if (!from || !to) return 0;
    const start = new Date(from);
    const end = new Date(to);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      return 0;
    }
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };

  // Calculate totals by type from breakdowns
  const totalsByType = useMemo(() => {
    const totals = { FL: 0, PL: 0, UL: 0 };
    breakdowns.forEach(breakdown => {
      const days = parseInt(breakdown.days) || 0;
      totals[breakdown.type] += days;
    });
    return totals;
  }, [breakdowns]);

  useEffect(() => {
    if (!isOpen) return;

    console.log("LeaveModal opened - Mode:", mode, "Record:", record, "AllUsers:", allUsers);

    if (mode === "edit" && record) {
      if (!record.email) {
        console.error("Cannot edit: record missing email:", record);
        return;
      }

      setSelectedUserEmail(record.email);
      
      // Set editable balances from UserDetails (pl, ul, fl)
      const user = allUsers.find(u => u.email === record.email);
      setEditableBalances({
        fl: user?.fl || record.leavesInHandFL || 0,
        pl: user?.pl || record.leavesInHandPL || 0,
        ul: user?.ul || record.leavesInHandUL || 0,
      });
      
      // Load existing leave entries with dates
      if (record.leaveEntries && Array.isArray(record.leaveEntries) && record.leaveEntries.length > 0) {
        const loadedBreakdowns = [];
        
        record.leaveEntries.forEach((entry, entryIdx) => {
          if (entry.breakdown && Array.isArray(entry.breakdown)) {
            entry.breakdown.forEach((item, itemIdx) => {
              loadedBreakdowns.push({
                type: item.type || "FL",
                days: item.days || 0,
                dateFrom: entry.dateFrom ? entry.dateFrom.slice(0, 10) : "",
                dateTo: entry.dateTo ? entry.dateTo.slice(0, 10) : "",
                id: Date.now() + entryIdx * 1000 + itemIdx
              });
            });
          }
        });

        setBreakdowns(loadedBreakdowns.length > 0 ? loadedBreakdowns : [
          { type: "FL", days: 0, dateFrom: "", dateTo: "", id: Date.now() }
        ]);
      } else {
        // No existing leaves - show empty form
        setBreakdowns([{ type: "FL", days: 0, dateFrom: "", dateTo: "", id: Date.now() }]);
      }
      
      setBalancesChanged(false);
      setBreakdownsChanged(false);
    } else {
      // Apply mode - select current user by default
      if (currentUserEmail && allUsers.length > 0) {
        const currentUser = allUsers.find(u => u.email === currentUserEmail);
        if (currentUser) {
          setSelectedUserEmail(currentUser.email);
        } else if (allUsers.length > 0) {
          setSelectedUserEmail(allUsers[0].email);
        }
      } else if (allUsers.length > 0) {
        setSelectedUserEmail(allUsers[0].email);
      }
      
      setBreakdowns([{ type: "FL", days: 0, dateFrom: "", dateTo: "", id: Date.now() }]);
      setEditableBalances({ fl: 0, pl: 0, ul: 0 });
      setBalancesChanged(false);
      setBreakdownsChanged(false);
    }
  }, [isOpen, mode, record, allUsers, currentUserEmail]);

  if (!isOpen) return null;

  const addBreakdown = () => {
    setBreakdowns([
      ...breakdowns,
      { type: "FL", days: 0, dateFrom: "", dateTo: "", id: Date.now() }
    ]);
    setBreakdownsChanged(true);
  };

  const removeBreakdown = (id) => {
    if (breakdowns.length === 1) {
      alert("At least one breakdown entry is required");
      return;
    }
    setBreakdowns(breakdowns.filter(b => b.id !== id));
    setBreakdownsChanged(true);
  };

  const updateBreakdown = (id, field, value) => {
    setBreakdowns(breakdowns.map(b => {
      if (b.id !== id) return b;
      
      const updated = { ...b, [field]: value };
      
      // Auto-calculate business days when dates change
      if (field === 'dateFrom' || field === 'dateTo') {
        const days = calculateBusinessDays(
          field === 'dateFrom' ? value : b.dateFrom,
          field === 'dateTo' ? value : b.dateTo
        );
        updated.days = days;
      }
      
      return updated;
    }));
    setBreakdownsChanged(true);
  };

  const handleBalanceChange = (field, value) => {
    setEditableBalances({
      ...editableBalances,
      [field]: parseFloat(value) || 0
    });
    setBalancesChanged(true);
  };

  const handleSubmit = () => {
    if (!selectedUser) {
      alert("Please select a user.");
      return;
    }

    if (!selectedUser.email) {
      alert("Invalid user selection. Email is missing.");
      console.error("Selected user missing email:", selectedUser);
      return;
    }

    // In edit mode with only balance changes
    if (mode === "edit" && balancesChanged && !breakdownsChanged) {
      // Check if user has no existing leaves
      const hasNoLeaves = !record.leaveEntries || record.leaveEntries.length === 0;
      
      if (hasNoLeaves) {
        // Only update user details table (pl, ul, fl)
        const payload = {
          email: selectedUser.email,
          onlyUpdateBalances: true,
          fl: editableBalances.fl,
          pl: editableBalances.pl,
          ul: editableBalances.ul,
        };
        
        console.log("Updating only balances in UserDetails:", payload);
        onSubmit && onSubmit(payload);
        return;
      } else {
        // User has leaves - just show existing breakdown, don't submit
        alert("Balance changes saved. Existing leave applications are displayed below.");
        return;
      }
    }

    // Validate breakdowns if they were changed or in apply mode
    if (breakdownsChanged || mode === "apply") {
      for (const breakdown of breakdowns) {
        if (!breakdown.type) {
          alert("Please select leave type for all breakdowns.");
          return;
        }
        if (!breakdown.dateFrom || !breakdown.dateTo) {
          alert("Please select dates for all breakdowns.");
          return;
        }
        const days = parseInt(breakdown.days) || 0;
        if (days <= 0) {
          alert("Please enter valid date ranges for all breakdowns. Note: Weekends are excluded.");
          return;
        }
      }

      // Validate against available leaves
      if (totalsByType.FL > availableLeaves.FL) {
        alert(`Not enough Floating Leave (FL). Only ${availableLeaves.FL} days available.`);
        return;
      }
      if (totalsByType.PL > availableLeaves.PL) {
        alert(`Not enough Planned Leave (PL). Only ${availableLeaves.PL} days available.`);
        return;
      }
      if (totalsByType.UL > availableLeaves.UL) {
        alert(`Not enough Unplanned Leave (UL). Only ${availableLeaves.UL} days available.`);
        return;
      }
    }

    // Group breakdowns by date range
    const dateRangeMap = {};
    breakdowns.forEach(b => {
      const key = `${b.dateFrom}_${b.dateTo}`;
      if (!dateRangeMap[key]) {
        dateRangeMap[key] = {
          dateFrom: b.dateFrom,
          dateTo: b.dateTo,
          breakdowns: []
        };
      }
      dateRangeMap[key].breakdowns.push({
        type: b.type,
        days: parseInt(b.days) || 0
      });
    });

    // Build payload
    const payload = {
      email: selectedUser.email,
      leaveEntries: Object.values(dateRangeMap).map(range => ({
        dateFrom: `${range.dateFrom}T00:00:00.000Z`,
        dateTo: `${range.dateTo}T00:00:00.000Z`,
        breakdowns: range.breakdowns
      })),
      // Include updated balances if changed in edit mode
      ...(mode === "edit" && balancesChanged && {
        fl: editableBalances.fl,
        pl: editableBalances.pl,
        ul: editableBalances.ul,
      })
    };

    console.log("Submitting payload:", payload);

    onSubmit && onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              {mode === "edit" ? "Edit Leave Records" : "Apply Leave"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={saving}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* User selector */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-6 rounded-xl">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select User
              </label>
              <select
                className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 
                           focus:border-purple-500 focus:ring-2 focus:ring-purple-200 
                           outline-none transition-all bg-white"
                value={selectedUserEmail}
                onChange={(e) => setSelectedUserEmail(e.target.value)}
                disabled={mode === "edit"}
              >
                <option value="">-- Select User --</option>
                {allUsers.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.name} ({u.email}) {u.email === currentUserEmail ? " - You" : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Leaves In Hand Summary - From UserDetails */}
            {selectedUser && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">Leaves In Hand (From User Details)</h4>
                  {mode === "edit" && (
                    <span className="text-xs text-green-600 font-semibold">✏️ Editable in Edit Mode</span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Floating (FL)</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editableBalances.fl}
                        onChange={(e) => handleBalanceChange('fl', e.target.value)}
                        className="text-xl font-bold text-green-600 w-full text-center border-2 border-green-300 rounded px-2 py-1 focus:border-green-500 outline-none"
                      />
                    ) : (
                      <p className="text-xl font-bold text-green-600">{availableLeaves.FL}</p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Planned (PL)</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editableBalances.pl}
                        onChange={(e) => handleBalanceChange('pl', e.target.value)}
                        className="text-xl font-bold text-blue-600 w-full text-center border-2 border-blue-300 rounded px-2 py-1 focus:border-blue-500 outline-none"
                      />
                    ) : (
                      <p className="text-xl font-bold text-blue-600">{availableLeaves.PL}</p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg text-center shadow-sm">
                    <p className="text-xs text-gray-600 mb-1">Unplanned (UL)</p>
                    {mode === "edit" ? (
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={editableBalances.ul}
                        onChange={(e) => handleBalanceChange('ul', e.target.value)}
                        className="text-xl font-bold text-orange-600 w-full text-center border-2 border-orange-300 rounded px-2 py-1 focus:border-orange-500 outline-none"
                      />
                    ) : (
                      <p className="text-xl font-bold text-orange-600">{availableLeaves.UL}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Breakdown Entries */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">Leave Applications</h3>
              <button
                onClick={addBreakdown}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 
                           text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Leave</span>
              </button>
            </div>

            {breakdowns.map((breakdown, index) => {
              const calculatedDays = calculateBusinessDays(breakdown.dateFrom, breakdown.dateTo);
              return (
                <div key={breakdown.id} className="bg-gray-50 p-5 rounded-xl border-2 border-gray-200">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-semibold text-gray-700">Leave Entry #{index + 1}</h4>
                    {breakdowns.length > 1 && (
                      <button
                        onClick={() => removeBreakdown(breakdown.id)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type
                      </label>
                      <select
                        className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 
                                   focus:border-purple-500 outline-none bg-white"
                        value={breakdown.type}
                        onChange={(e) => updateBreakdown(breakdown.id, 'type', e.target.value)}
                      >
                        <option value="FL">Floating Leave (FL)</option>
                        <option value="PL">Planned Leave (PL)</option>
                        <option value="UL">Unplanned Leave (UL)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Days (Excludes Weekends)
                      </label>
                      <div className="border-2 border-gray-300 rounded-lg px-3 py-2 bg-white text-center">
                        <span className="text-lg font-bold text-purple-600">{calculatedDays}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        From Date
                      </label>
                      <input
                        type="date"
                        className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 
                                   focus:border-purple-500 outline-none"
                        value={breakdown.dateFrom}
                        onChange={(e) => updateBreakdown(breakdown.id, 'dateFrom', e.target.value)}
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
                        value={breakdown.dateTo}
                        onChange={(e) => updateBreakdown(breakdown.id, 'dateTo', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary - Total by Type */}
          <div className="bg-gradient-to-r from-purple-50 to-cyan-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-800 mb-3">Total Leaves Applied</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total FL</p>
                <p className="text-2xl font-bold text-green-600">{totalsByType.FL}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total PL</p>
                <p className="text-2xl font-bold text-blue-600">{totalsByType.PL}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total UL</p>
                <p className="text-2xl font-bold text-orange-600">{totalsByType.UL}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl flex justify-end space-x-3 z-10">
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