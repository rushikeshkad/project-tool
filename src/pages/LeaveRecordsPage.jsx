// src/pages/LeaveRecordsPage.jsx
import React, { useEffect, useState } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { mockLeaveRecords } from "../utils/mockData";
import { leaveService } from "../api/apiService";
import LeaveModal from "../components/layout/LeaveModal";

const LeaveRecordsPage = ({ leaveRecords, setLeaveRecords }) => {
  const [selectedM, setSelectedM] = useState(""); // e.g. "2025-07"
  const [leaveRecordsData, setLeaveRecordsData] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  // Modal state (single modal for apply + edit)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("apply"); // "apply" | "edit"
  const [activeRecord, setActiveRecord] = useState(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // For delete / list-level actions
  const [listSaving, setListSaving] = useState(false);

  // Split "YYYY-MM" into [year, month]
  const [year, month] = selectedM ? selectedM.split("-") : ["", ""];

  // ---------------------------------------------------------------------------
  // Helper: fetch/refresh leaves from backend for current year+month
  // ---------------------------------------------------------------------------
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
      // You can show a nicer message if you want
      setFetchError("");
      // If backend is down, you can still show mock data
      setLeaveRecordsData([]);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Fetch leave records when year/month change
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!year || !month) {
      setLeaveRecordsData([]);
      return;
    }
    refreshLeaves(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // Use API data if present, then parent data, otherwise fall back to mock
  const dataToShow =
    (leaveRecordsData && leaveRecordsData.length > 0 && leaveRecordsData) ||
    (leaveRecords && leaveRecords.length > 0 && leaveRecords) ||
    mockLeaveRecords;

  // Build unique users list for modal user dropdown
  const usersForModal = Object.values(
    dataToShow.reduce((acc, rec) => {
      acc[rec.userId] = {
        userId: rec.userId,
        userName: rec.userName,
        email: rec.email,
        leaveBalance: rec.leaveBalance,
        appliedLeaves: rec.appliedLeaves,
      };
      return acc;
    }, {})
  );

  // ---------------------------------------------------------------------------
  // Modal handlers
  // ---------------------------------------------------------------------------
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
        // ---------------- APPLY MODE ----------------
        let createdRecord;

        try {
          const response = await leaveService.applyLeave(payload);
          createdRecord = response?.data ?? response;
          // ✅ After successful backend save, re-fetch fresh list:
          await refreshLeaves();
          handleCloseModal();
          return;
        } catch (err) {
          console.error("Error applying leave:", err);
          const isNetworkError = !err.response;

          if (isNetworkError) {
            setModalError(
              "Network not connected – using mock data (changes not saved to server)."
            );

            // Build a fake record based on payload
            createdRecord = {
              id: Date.now(),
              userId: payload.userId,
              userName: payload.userName,
              email: payload.email,
              year: payload.year,
              month: payload.month,
              leaveType: payload.leaveType,
              fromDate: payload.fromDate,
              toDate: payload.toDate,
              appliedLeaves:
                (payload.appliedLeaves ?? 0) + payload.days,
              leaveBalance:
                (payload.leaveBalance ?? 0) - payload.days,
            };

            const addRec = (prev) => [...prev, createdRecord];
            setLeaveRecordsData((prev) => addRec(prev));
            setLeaveRecords && setLeaveRecords((prev) => addRec(prev));
            handleCloseModal();
            return;
          } else {
            setModalError(
              err.response?.data?.message ||
                err.message ||
                "Failed to apply leave"
            );
            return;
          }
        }
      } else {
        // ---------------- EDIT MODE ----------------
        if (!activeRecord) return;

        let updatedRecord;
        try {
          const response = await leaveService.update(
            activeRecord.userId,
            payload
          );
          updatedRecord = response?.data ?? response;

          // ✅ Re-fetch from backend to ensure we see latest data
          await refreshLeaves();
          handleCloseModal();
          return;
        } catch (err) {
          console.error("Error updating leave record:", err);
          const isNetworkError = !err.response;

          if (isNetworkError) {
            setModalError(
              "Network not connected – updating locally (not saved to server)."
            );

            updatedRecord = {
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
            setModalError(
              err.response?.data?.message ||
                err.message ||
                "Failed to update leave"
            );
            return;
          }
        }
      }
    } finally {
      setModalSaving(false);
    }
  };

  // ------------------
  // Delete handler
  // ------------------
  const handleDeleteClick = async (rec) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete leave record for "${rec.userName}"?`
    );
    if (!confirmDelete) return;

    try {
      setListSaving(true);
      setFetchError("");

      await leaveService.delete(rec.userId, year, month);

      // ✅ After real delete, re-fetch latest data
      await refreshLeaves();
    } catch (err) {
      if (!err?.response) {
        console.warn(
          "Network not connected, deleting only in mock/local data. Error:",
          err
        );
        setFetchError(
          "Network not connected – deleted locally in mock data. Not saved to server."
        );

        const filterFn = (list) =>
          (list || []).filter((item) => item.userId !== rec.userId);

        setLeaveRecordsData((prev) =>
          prev && prev.length > 0 ? filterFn(prev) : filterFn(mockLeaveRecords)
        );
        setLeaveRecords &&
          setLeaveRecords((prev) =>
            prev && prev.length > 0 ? filterFn(prev) : filterFn(mockLeaveRecords)
          );
      } else {
        setFetchError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to delete leave record"
        );
      }
    } finally {
      setListSaving(false);
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

      {/* Month + Year picker + Apply Leave button */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-blue-700 mb-2">
          Select Year &amp; Month
        </label>

        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <MonthYearPicker value={selectedM} onChange={setSelectedM} />
          </div>

          <button
            type="button"
            className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
            onClick={openApplyModal}
            disabled={!year || !month}
            title={!year || !month ? "Select a month & year first" : "Apply Leave"}
          >
            Apply Leave
          </button>
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
                        <td className="px-4 py-2 space-x-2">
                          <button
                            className="px-3 py-1 text-sm rounded bg-purple-600 text-white"
                            onClick={() => handleEditClick(rec)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-1 text-sm rounded bg-red-600 text-white disabled:opacity-50"
                            onClick={() => handleDeleteClick(rec)}
                            disabled={listSaving}
                          >
                            Delete
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

      {/* Unified Leave modal (Apply + Edit) */}
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
