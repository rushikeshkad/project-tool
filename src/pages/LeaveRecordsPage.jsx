import React, { useEffect, useState } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { mockLeaveRecords } from "../utils/mockData";
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

      // Sort by name
      const sortedData = [...data].sort((a, b) => 
        (a.userName || "").localeCompare(b.userName || "")
      );

      setLeaveRecordsData(sortedData);
      setLeaveRecords && setLeaveRecords(sortedData);
    } catch (err) {
      console.error("Error fetching leave records:", err);
      setFetchError("");
      setLeaveRecordsData([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  useEffect(() => {
    if (!year || !month) {
      setLeaveRecordsData([]);
      return;
    }
    refreshLeaves(year, month);
  }, [year, month]);

  const dataToShow =
    (leaveRecordsData && leaveRecordsData.length > 0 && leaveRecordsData) ||
    (leaveRecords && leaveRecords.length > 0 && leaveRecords) ||
    mockLeaveRecords;

  // Build unique users list
  const usersForModal = Object.values(
    dataToShow.reduce((acc, rec) => {
      acc[rec.userId] = {
        userId: rec.userId,
        userName: rec.userName,
        email: rec.email,
        leaveBalance: rec.leaveBalance || 0,
        plannedLeaves: rec.plannedLeaves || 0,
        unplannedLeaves: rec.unplannedLeaves || 0,
        floatingHoliday: rec.floatingHoliday || 0,
        appliedLeaves: rec.appliedLeaves || 0,
      };
      return acc;
    }, {})
  );

  const openApplyModal = () => {
    setModalMode("apply");
    setActiveRecord(null);
    setModalError("");
    setModalOpen(true);
  };

  const handleEditClick = (rec) => {
    setModalMode("edit");
    setActiveRecord(rec);
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
        // Apply new leave
        try {
          const response = await leaveService.applyLeave(payload);
          await refreshLeaves();
          handleCloseModal();
          return;
        } catch (err) {
          console.error("Error applying leave:", err);
          const isNetworkError = !err.response;

          if (isNetworkError) {
            setModalError("Network not connected – using mock data.");
            
            // Calculate new values based on leave type
            const user = usersForModal.find(u => u.userId === payload.userId);
            const newRecord = {
              id: Date.now(),
              userId: payload.userId,
              userName: payload.userName,
              email: payload.email,
              year: payload.year,
              month: payload.month,
              leaveType: payload.leaveType,
              fromDate: payload.fromDate,
              toDate: payload.toDate,
              leaveBalance: user.leaveBalance - payload.days,
              plannedLeaves: payload.leaveType === "Planned Leave" 
                ? user.plannedLeaves - payload.days 
                : user.plannedLeaves,
              unplannedLeaves: payload.leaveType === "Unplanned Leave" 
                ? user.unplannedLeaves - payload.days 
                : user.unplannedLeaves,
              floatingHoliday: payload.leaveType === "Floating Holiday" 
                ? user.floatingHoliday - payload.days 
                : user.floatingHoliday,
              appliedLeaves: user.appliedLeaves + payload.days,
            };

            const addRec = (prev) => [...prev, newRecord];
            setLeaveRecordsData((prev) => addRec(prev));
            setLeaveRecords && setLeaveRecords((prev) => addRec(prev));
            handleCloseModal();
            return;
          } else {
            setModalError(err.response?.data?.message || "Failed to apply leave");
            return;
          }
        }
      } else {
        // Edit existing leave
        if (!activeRecord) return;

        try {
          const response = await leaveService.update(activeRecord.userId, payload);
          await refreshLeaves();
          handleCloseModal();
          return;
        } catch (err) {
          console.error("Error updating leave record:", err);
          const isNetworkError = !err.response;

          if (isNetworkError) {
            setModalError("Network not connected – updating locally.");

            const updatedRecord = {
              ...activeRecord,
              ...payload,
            };

            const replace = (prev) =>
              (prev || []).map((item) =>
                item.userId === activeRecord.userId ? updatedRecord : item
              );

            setLeaveRecordsData((prev) => replace(prev));
            setLeaveRecords && setLeaveRecords((prev) => replace(prev));
            handleCloseModal();
            return;
          } else {
            setModalError(err.response?.data?.message || "Failed to update leave");
            return;
          }
        }
      }
    } finally {
      setModalSaving(false);
    }
  };

  const handleDeleteClick = async (rec) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete leave record for "${rec.userName}"?`
    );
    if (!confirmDelete) return;

    try {
      setListSaving(true);
      setFetchError("");

      await leaveService.delete(rec.userId, year, month);
      await refreshLeaves();
    } catch (err) {
      if (!err?.response) {
        console.warn("Network not connected, deleting locally.");
        setFetchError("Network not connected – deleted locally.");

        const filterFn = (list) =>
          (list || []).filter((item) => item.userId !== rec.userId);

        setLeaveRecordsData((prev) => filterFn(prev));
        setLeaveRecords && setLeaveRecords((prev) => filterFn(prev));
      } else {
        setFetchError(err?.response?.data?.message || "Failed to delete leave record");
      }
    } finally {
      setListSaving(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        Leave Records Management
      </h1>

      {/* Month picker + Apply button */}
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

      {fetchError && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded-lg">
          {fetchError}
        </div>
      )}

      {year && month && (
        <>
          {loadingLeaves ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-500 mt-4">Loading leave records...</p>
            </div>
          ) : dataToShow.length === 0 ? (
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
                      <th className="px-6 py-4 text-center font-semibold">Leaves Available</th>
                      <th className="px-6 py-4 text-center font-semibold">Planned Leaves</th>
                      <th className="px-6 py-4 text-center font-semibold">Unplanned Leaves</th>
                      <th className="px-6 py-4 text-center font-semibold">Floating Holiday (Max 2)</th>
                      <th className="px-6 py-4 text-center font-semibold">Applied Leave Type</th>
                      <th className="px-6 py-4 text-center font-semibold">Applied Leaves</th>
                      <th className="px-6 py-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {dataToShow.map((rec, idx) => (
                      <tr 
                        key={rec.userId} 
                        className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-cyan-50 transition-colors ${
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-800">{rec.userName}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold">
                            {rec.leaveBalance || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg font-bold">
                            {rec.plannedLeaves || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-bold">
                            {rec.unplannedLeaves || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-bold">
                            {rec.floatingHoliday || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            rec.leaveType === "Planned Leave" 
                              ? "bg-green-200 text-green-800"
                              : rec.leaveType === "Unplanned Leave"
                              ? "bg-orange-200 text-orange-800"
                              : "bg-purple-200 text-purple-800"
                          }`}>
                            {rec.leaveType || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold">
                            {rec.appliedLeaves || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 
                                         transition-colors shadow-md hover:shadow-lg"
                              onClick={() => handleEditClick(rec)}
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 
                                         transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                              onClick={() => handleDeleteClick(rec)}
                              disabled={listSaving}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!year && !month && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <Calendar className="w-20 h-20 text-purple-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Please select a month and year to view leave records</p>
        </div>
      )}

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