// src/pages/LeaveRecordsPage.jsx
import React, { useEffect, useState } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { mockLeaveRecords } from "../utils/mockData";
import { leaveService } from "../api/apiService";
import EditLeaveModal from "../components/layout/EditLeaveModal";

const LeaveRecordsPage = ({ leaveRecords, setLeaveRecords }) => {
  const [selectedM, setSelectedM] = useState(""); // e.g. "2025-07"
  const [leaveRecordsData, setLeaveRecordsData] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  // Modal-related state
  const [editingRecord, setEditingRecord] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Split "YYYY-MM" into [year, month]
  const [year, month] = selectedM ? selectedM.split("-") : ["", ""];

  // ---------------------------------------------------------------------------
  // Fetch leave records for selected year + month
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!year || !month) {
      setLeaveRecordsData([]);
      return;
    }

    let cancelled = false;

    const fetchLeaves = async () => {
      try {
        setLoadingLeaves(true);
        setFetchError("");

        const response = await leaveService.getByYearMonth(year, month);
        const data = response?.data ?? response ?? [];

        if (!cancelled) {
          setLeaveRecordsData(data);
          // keep parent state in sync if provided
          setLeaveRecords && setLeaveRecords(data);
        }
      } catch (err) {
        if (!cancelled) {
          setFetchError(
            // err?.response?.data?.message ||
            //   err?.message ||
            //   "Failed to fetch leave records"
          );
          console.error("Error fetching leave records:", err);
        }
      } finally {
        if (!cancelled) {
          setLoadingLeaves(false);
        }
      }
    };

    fetchLeaves();

    return () => {
      cancelled = true;
    };
  }, [year, month, setLeaveRecords]);

  // Use API data if present, then parent data, otherwise fall back to mock
  const dataToShow =
    (leaveRecordsData && leaveRecordsData.length > 0 && leaveRecordsData) ||
    (leaveRecords && leaveRecords.length > 0 && leaveRecords) ||
    mockLeaveRecords;

  // ---------------------------------------------------------------------------
  // Modal handlers
  // ---------------------------------------------------------------------------
  const handleEditClick = (rec) => {
    setModalError("");
    setEditingRecord(rec);
  };

  const handleCloseModal = () => {
    setEditingRecord(null);
    setModalError("");
  };

  const handleSaveModal = async (updatedFields) => {
    if (!editingRecord) return;

    try {
  setSaving(true);
  setModalError("");

  // Call backend API
  await leaveService.update(editingRecord.userId, updatedFields);

  const updater = (prev) =>
    prev.map((item) =>
      item.userId === editingRecord.userId
        ? {
            ...item,
            userName: updatedFields.name,
            leaveBalance: updatedFields.leaveBalance,
            appliedLeaves: updatedFields.appliedLeaves,
          }
        : item
    );

  setLeaveRecordsData((prev) => updater(prev));
  setLeaveRecords && setLeaveRecords((prev) => updater(prev));

  handleCloseModal();
} catch (err) {
  // No response object => network error / backend not reachable
  if (!err?.response) {
    console.warn("Network not connected, using mock data. Original error:", err);

    setModalError(
      "Network not connected – using mock data. Changes are not saved to server."
    );

    // Use mock data as local source of truth
    const updater = (prev) =>
      prev.map((item) =>
        item.userId === editingRecord.userId
          ? {
              ...item,
              userName: updatedFields.name,
              leaveBalance: updatedFields.leaveBalance,
              appliedLeaves: updatedFields.appliedLeaves,
            }
          : item
      );

    // If we already have local data, update that; otherwise start from mocks
    setLeaveRecordsData((prev) =>
      prev && prev.length > 0 ? updater(prev) : updater(mockLeaveRecords)
    );

    setLeaveRecords &&
      setLeaveRecords((prev) =>
        prev && prev.length > 0 ? updater(prev) : updater(mockLeaveRecords)
      );

    // You can choose whether to close the modal or leave it open.
    handleCloseModal();
  } else {
    // Real backend responded with an error (4xx / 5xx)
    setModalError(
      err?.response?.data?.message ||
        err?.message ||
        "Failed to save leave data"
    );
  }

  console.error("Error updating leave record:", err);
} finally {
  setSaving(false);
}
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        Leave Records
      </h1>

      {/* Month + Year picker */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-blue-700 mb-2">
          Select Year &amp; Month
        </label>

        <div className="relative w-64">
          <MonthYearPicker value={selectedM} onChange={setSelectedM} />
        </div>
      </div>

      {fetchError && (
        <p className="text-red-600 mb-4 text-sm">{fetchError}</p>
      )}

      {year && month && (
        <>
          {loadingLeaves ? (
            <p className="text-gray-500">Loading leave records…</p>
          ) : dataToShow.length === 0 ? (
            <p className="text-gray-500">
              No leave records found for this month.
            </p>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leaves
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied Leaves
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Leaves
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {dataToShow.map((rec) => {
                    const remaining =
                      rec.leaveBalance - rec.appliedLeaves;

                    return (
                      <tr key={rec.userId}>
                        <td className="px-4 py-2">{rec.userName}</td>
                        <td className="px-4 py-2">{rec.leaveBalance}</td>
                        <td className="px-4 py-2">
                          {rec.appliedLeaves}
                        </td>
                        <td className="px-4 py-2">{remaining}</td>
                        <td className="px-4 py-2">
                          <button
                            className="px-3 py-1 text-sm rounded bg-purple-600 text-white"
                            onClick={() => handleEditClick(rec)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Edit modal overlay */}
      <EditLeaveModal
        isOpen={!!editingRecord}
        record={editingRecord}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
        saving={saving}
        error={modalError}
      />
    </div>
  );
};

export default LeaveRecordsPage;
