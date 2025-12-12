import React, { useEffect, useState, useMemo } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { leaveService } from "../api/apiService";
import LeaveModal from "../components/layout/LeaveModal";
import { Edit2, Trash2, Plus, Calendar } from "lucide-react";

const LeaveRecordsPage = ({ leaveRecords, setLeaveRecords }) => {
  const [selectedM, setSelectedM] = useState("");
  const [leaveRecordsData, setLeaveRecordsData] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("apply");
  const [activeRecord, setActiveRecord] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [listSaving, setListSaving] = useState(false);

  const [year, month] = selectedM ? selectedM.split("-") : ["", ""];

  // Process and group leaves by user with multi-row display logic
  const processedLeaveData = useMemo(() => {
    const dataSource = leaveRecordsData?.length > 0 ? leaveRecordsData : 
                       leaveRecords?.length > 0 ? leaveRecords : [];

    // Group by userId
    const grouped = dataSource.reduce((acc, record) => {
      if (!acc[record.userId]) {
        acc[record.userId] = {
          userId: record.userId,
          userName: record.userName,
          email: record.email,
          leaveBalance: record.leaveBalance || 0,
          plannedLeaves: record.plannedLeaves || 0,
          unplannedLeaves: record.unplannedLeaves || 0,
          floatingHoliday: record.floatingHoliday || 0,
          appliedLeaves: record.appliedLeaves || 0,
          leaveApplications: []
        };
      }

      // Add leave application
      if (record.leaveType) {
        acc[record.userId].leaveApplications.push({
          id: record.id,
          leaveType: record.leaveType,
          fromDate: record.fromDate,
          toDate: record.toDate,
          days: record.days || 1
        });
      }

      return acc;
    }, {});

    // Convert to array and sort by name
    return Object.values(grouped).sort((a, b) => 
      (a.userName || "").localeCompare(b.userName || "")
    );
  }, [leaveRecordsData, leaveRecords]);

  // Group consecutive dates of same leave type
  const groupDates = (applications) => {
    if (!applications || applications.length === 0) return [];

    // Sort by date first
    const sorted = [...applications].sort((a, b) => 
      new Date(a.fromDate) - new Date(b.fromDate)
    );

    const grouped = [];
    let current = { ...sorted[0] };

    for (let i = 1; i < sorted.length; i++) {
      const prev = current;
      const next = sorted[i];

      // Check if same type and consecutive dates
      const prevEnd = new Date(prev.toDate);
      const nextStart = new Date(next.fromDate);
      const dayDiff = (nextStart - prevEnd) / (1000 * 60 * 60 * 24);

      if (prev.leaveType === next.leaveType && dayDiff <= 1) {
        // Merge consecutive dates of same type
        current.toDate = next.toDate;
        current.days += next.days;
      } else {
        // Save current and start new group
        grouped.push(current);
        current = { ...next };
      }
    }
    grouped.push(current);

    return grouped;
  };

  // Calculate totals by leave type
  const calculateTypeTotals = (applications) => {
    const totals = { PL: 0, UL: 0, FH: 0 };
    applications.forEach(app => {
      if (app.leaveType === "Planned Leave") totals.PL += app.days;
      else if (app.leaveType === "Unplanned Leave") totals.UL += app.days;
      else if (app.leaveType === "Floating Holiday") totals.FH += app.days;
    });
    return totals;
  };

  // Refresh leaves from backend
  const refreshLeaves = async (y = year, m = month) => {
    if (!y || !m) {
      setLeaveRecordsData([]);
      return;
    }

    setLoadingLeaves(true);
    setFetchError("");

    try {
      const response = await leaveService.getByYearMonth(y, m);
      const data = response?.data ?? response ?? [];
      setLeaveRecordsData(data);
      setLeaveRecords && setLeaveRecords(data);
    } catch (err) {
      console.error("Error fetching leave records:", err);
      setFetchError(
        err.response?.data?.message || 
        err.message || 
        "Failed to fetch leave records. Please try again."
      );
      setLeaveRecordsData([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // Fetch leaves when month/year changes
  useEffect(() => {
    if (!year || !month) {
      setLeaveRecordsData([]);
      return;
    }
    refreshLeaves(year, month);
  }, [year, month]);

  // Build users list for modal
  const usersForModal = processedLeaveData.map(user => ({
    userId: user.userId,
    userName: user.userName,
    email: user.email,
    leaveBalance: user.leaveBalance,
    plannedLeaves: user.plannedLeaves,
    unplannedLeaves: user.unplannedLeaves,
    floatingHoliday: user.floatingHoliday,
    appliedLeaves: user.appliedLeaves,
  }));

  // Modal handlers
  const openApplyModal = () => {
    setModalMode("apply");
    setActiveRecord(null);
    setModalError("");
    setModalOpen(true);
  };

  const handleEditClick = (user) => {
    setModalMode("edit");
    setActiveRecord(user);
    setModalError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setActiveRecord(null);
    setModalError("");
  };

  const handleSubmitLeaveModal = async (payload) => {
    if (!payload) return;

    try {
      setModalSaving(true);
      setModalError("");

      if (modalMode === "apply") {
        await leaveService.applyLeave(payload);
      } else {
        await leaveService.update(payload.userId, payload);
      }
      
      await refreshLeaves();
      handleCloseModal();
    } catch (err) {
      console.error("Error processing leave:", err);
      setModalError(
        err.response?.data?.message || 
        err.message || 
        "Failed to process leave. Please try again."
      );
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteClick = async (user) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete all leave records for "${user.userName}"?`
    );
    if (!confirmDelete) return;

    try {
      setListSaving(true);
      setFetchError("");
      await leaveService.delete(user.userId, year, month);
      await refreshLeaves();
    } catch (err) {
      console.error("Error deleting leave:", err);
      setFetchError(
        err.response?.data?.message || 
        err.message || 
        "Failed to delete leave records. Please try again."
      );
    } finally {
      setListSaving(false);
    }
  };

  // Format date range for display
  const formatDateRange = (fromDate, toDate) => {
    const from = new Date(fromDate).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short' 
    });
    const to = new Date(toDate).toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short' 
    });
    return fromDate === toDate ? from : `${from} to ${to}`;
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        Leave Records Management
      </h1>

      {/* Month/Year Picker and Apply Button */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-3">
          <Calendar className="w-5 h-5 inline mr-2" />
          Select Year &amp; Month
        </label>

        <div className="flex items-center gap-4">
          <MonthYearPicker value={selectedM} onChange={setSelectedM} />
          
          <button
            type="button"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
                       rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 
                       transition-all font-semibold flex items-center space-x-2"
            onClick={openApplyModal}
          >
            <Plus className="w-5 h-5" />
            <span>Apply Leave</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {fetchError && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{fetchError}</p>
        </div>
      )}

      {/* Leave Records Table */}
      {year && month && (
        <>
          {loadingLeaves ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 mt-4">Loading leave records...</p>
            </div>
          ) : processedLeaveData.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No leave records found for this month.</p>
              {fetchError && (
                <p className="text-gray-400 text-sm mt-2">
                  Please check your connection or try again later.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold w-48">Name</th>
                      <th className="px-6 py-4 text-center font-semibold w-40">No. of Leaves Applied</th>
                      <th className="px-6 py-4 text-left font-semibold w-40">Leave Type</th>
                      <th className="px-6 py-4 text-left font-semibold w-56">Date</th>
                      <th className="px-6 py-4 text-left font-semibold w-48">Leaves Available</th>
                      <th className="px-6 py-4 text-center font-semibold w-32">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {processedLeaveData.map((user, idx) => {
                      const groupedApps = groupDates(user.leaveApplications);
                      const typeTotals = calculateTypeTotals(user.leaveApplications);
                      const totalApplied = user.appliedLeaves || 0;

                      return (
                        <tr 
                          key={user.userId}
                          className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          {/* Name Column */}
                          <td className="px-6 py-4 font-semibold text-gray-800 align-top">
                            <div className="flex flex-col">
                              <span className="text-lg">{user.userName}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </td>

                          {/* No. of Leaves Applied Column */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="inline-block px-5 py-3 bg-red-100 text-red-700 rounded-xl font-bold text-2xl shadow-sm">
                              {totalApplied}
                            </div>
                          </td>

                          {/* Leave Type Column - Multiple Internal Rows */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2">
                              {typeTotals.PL > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-blue-600 text-sm">PL:</span>
                                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                    {typeTotals.PL}
                                  </span>
                                </div>
                              )}
                              {typeTotals.UL > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-orange-600 text-sm">UL:</span>
                                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                    {typeTotals.UL}
                                  </span>
                                </div>
                              )}
                              {typeTotals.FH > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-green-600 text-sm">FH:</span>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                    {typeTotals.FH}
                                  </span>
                                </div>
                              )}
                              {typeTotals.PL === 0 && typeTotals.UL === 0 && typeTotals.FH === 0 && (
                                <span className="text-gray-400 text-sm">No leaves</span>
                              )}
                            </div>
                          </td>

                          {/* Date Column - Multiple Internal Rows */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2">
                              {groupedApps.length > 0 ? (
                                groupedApps.map((app, appIdx) => (
                                  <div 
                                    key={appIdx} 
                                    className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg font-medium"
                                  >
                                    {formatDateRange(app.fromDate, app.toDate)}
                                    <span className="ml-2 text-xs text-gray-500">
                                      ({app.days} {app.days === 1 ? 'day' : 'days'})
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">No dates</span>
                              )}
                            </div>
                          </td>

                          {/* Leaves Available Column - Multiple Internal Rows */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-gray-700 text-sm">Total:</span>
                                <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-bold">
                                  {user.leaveBalance}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-blue-600 text-sm">PL:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                  {user.plannedLeaves}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-orange-600 text-sm">UL:</span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                  {user.unplannedLeaves}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-green-600 text-sm">FH:</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                  {user.floatingHoliday}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="flex flex-col items-center space-y-2">
                              <button
                                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
                                           transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                                onClick={() => handleEditClick(user)}
                                title="Edit Leave Records"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-sm font-semibold">Edit</span>
                              </button>
                              <button
                                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                                           transition-colors shadow-md hover:shadow-lg disabled:opacity-50 
                                           flex items-center justify-center space-x-2"
                                onClick={() => handleDeleteClick(user)}
                                disabled={listSaving}
                                title="Delete All Leaves"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm font-semibold">Delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State - No Month Selected */}
      {!year && !month && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-20 h-20 text-purple-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Please select a month and year to view leave records</p>
          <p className="text-gray-400 text-sm mt-2">Use the picker above to get started</p>
        </div>
      )}

      {/* Leave Modal */}
      <LeaveModal
        isOpen={modalOpen}
        mode={modalMode}
        record={activeRecord}
        users={usersForModal}
        year={year}
        month={month}
        onClose={handleCloseModal}
        onSubmit={handleSubmitLeaveModal}
        saving={modalSaving}
        error={modalError}
      />
    </div>
  );
};

export default LeaveRecordsPage;