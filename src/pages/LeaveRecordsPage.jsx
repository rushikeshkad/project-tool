import React, { useEffect, useState, useMemo } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { leaveService, userDetailsService } from "../api/apiService";
import LeaveModal from "../components/layout/LeaveModal";
import { Edit2, Trash2, Plus, Calendar } from "lucide-react";

const LeaveRecordsPage = ({ leaveRecords, setLeaveRecords, userEmail }) => {
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

  // All registered users for modal dropdown
  const [allUsers, setAllUsers] = useState([]);

  const [year, month] = selectedM ? selectedM.split("-") : ["", ""];

  // Fetch all registered users on mount
  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const users = await userDetailsService.getAll();
      setAllUsers(users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Process and group leaves by user email - ONE ROW PER USER
  const processedLeaveData = useMemo(() => {
    const dataSource = leaveRecordsData?.length > 0 ? leaveRecordsData : 
                       leaveRecords?.length > 0 ? leaveRecords : [];

    console.log("Raw API data:", dataSource);

    // Group by email - combine multiple records for same email
    const grouped = dataSource.reduce((acc, record) => {
      const email = record.email;
      
      if (!acc[email]) {
        acc[email] = {
          id: record.id,
          email: record.email,
          name: record.name,
          leavesInHandPL: record.leavesInHandPL || 0,
          leavesInHandUL: record.leavesInHandUL || 0,
          leavesInHandFL: record.leavesInHandFL || 0,
          leaveEntries: [] // Array of leave periods
        };
      }

      // Add this leave period to the user's entries
      acc[email].leaveEntries.push({
        id: record.id,
        dateFrom: record.dateFrom,
        dateTo: record.dateTo,
        totalDays: record.totalDays,
        breakdown: record.breakdown || []
      });

      return acc;
    }, {});

    const users = Object.values(grouped).sort((a, b) => 
      (a.name || "").localeCompare(b.name || "")
    );

    console.log("Grouped by user (one row per user):", users);

    return users;
  }, [leaveRecordsData, leaveRecords]);

  // Calculate totals by leave type from all breakdowns
  const calculateTypeTotals = (leaveEntries) => {
    const totals = { FL: 0, PL: 0, UL: 0 };
    if (!leaveEntries || !Array.isArray(leaveEntries)) return totals;
    
    leaveEntries.forEach(entry => {
      if (entry.breakdown && Array.isArray(entry.breakdown)) {
        entry.breakdown.forEach(item => {
          if (item.type === "FL") totals.FL += item.days || 0;
          else if (item.type === "PL") totals.PL += item.days || 0;
          else if (item.type === "UL") totals.UL += item.days || 0;
        });
      }
    });
    return totals;
  };

  // Calculate total days across all entries
  const calculateTotalDays = (leaveEntries) => {
    if (!leaveEntries || !Array.isArray(leaveEntries)) return 0;
    return leaveEntries.reduce((sum, entry) => sum + (entry.totalDays || 0), 0);
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
      console.log("Fetched leave data:", data);
      setLeaveRecordsData(Array.isArray(data) ? data : []);
      setLeaveRecords && setLeaveRecords(Array.isArray(data) ? data : []);
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

  // Modal handlers
  const openApplyModal = () => {
    setModalMode("apply");
    setActiveRecord(null);
    setModalError("");
    setModalOpen(true);
  };

  const handleEditClick = (user) => {
    console.log("Editing user record:", user);
    
    if (!user.email) {
      setFetchError("Cannot edit: Email missing");
      return;
    }

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

    console.log("Submitting payload:", payload);

    try {
      setModalSaving(true);
      setModalError("");

      if (modalMode === "apply") {
        await leaveService.applyLeave(payload);
      } else {
        if (!payload.email) {
          throw new Error("Email is required for updating leave records");
        }
        await leaveService.update(payload.email, payload);
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
      `Are you sure you want to delete all leave records for "${user.name}"?`
    );
    if (!confirmDelete) return;

    try {
      setListSaving(true);
      setFetchError("");
      
      // Delete by email
      await leaveService.delete(user.email, year, month);
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
    if (!fromDate || !toDate) return "-";
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
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Name</th>
                      <th className="px-6 py-4 text-center font-semibold">Total Days</th>
                      <th className="px-6 py-4 text-left font-semibold">Leave Breakdown</th>
                      <th className="px-6 py-4 text-left font-semibold">Date Range</th>
                      <th className="px-6 py-4 text-left font-semibold">Leaves In Hand</th>
                      <th className="px-6 py-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {processedLeaveData.map((user, idx) => {
                      const typeTotals = calculateTypeTotals(user.leaveEntries);
                      const totalDays = calculateTotalDays(user.leaveEntries);

                      return (
                        <tr 
                          key={user.email}
                          className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 transition-colors ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          {/* Name Column */}
                          <td className="px-6 py-4 font-semibold text-gray-800 align-top">
                            <div className="flex flex-col">
                              <span className="text-lg">{user.name}</span>
                              <span className="text-xs text-gray-500">{user.email}</span>
                            </div>
                          </td>

                          {/* Total Days Column */}
                          <td className="px-6 py-4 text-center align-top">
                            <div className="inline-block px-5 py-3 bg-red-100 text-red-700 rounded-xl font-bold text-2xl shadow-sm">
                              {totalDays}
                            </div>
                          </td>

                          {/* Leave Breakdown Column - Multiple Internal Rows */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2">
                              {typeTotals.FL > 0 && (
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-green-600 text-sm">FL:</span>
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                    {typeTotals.FL}
                                  </span>
                                </div>
                              )}
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
                              {typeTotals.FL === 0 && typeTotals.PL === 0 && typeTotals.UL === 0 && (
                                <span className="text-gray-400 text-sm">No breakdown</span>
                              )}
                            </div>
                          </td>

                          {/* Date Range Column - Multiple Internal Rows */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2">
                              {user.leaveEntries.map((entry, entryIdx) => (
                                <div key={entryIdx} className="text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg font-medium">
                                  {formatDateRange(entry.dateFrom, entry.dateTo)}
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({entry.totalDays || 0} days)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Leaves In Hand Column */}
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-green-600 text-sm">FL:</span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                  {user.leavesInHandFL}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-blue-600 text-sm">PL:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">
                                  {user.leavesInHandPL}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-semibold text-orange-600 text-sm">UL:</span>
                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                  {user.leavesInHandUL}
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
        allUsers={allUsers}
        year={year}
        month={month}
        onClose={handleCloseModal}
        onSubmit={handleSubmitLeaveModal}
        saving={modalSaving}
        error={modalError}
        currentUserEmail={userEmail}
      />
    </div>
  );
};

export default LeaveRecordsPage;