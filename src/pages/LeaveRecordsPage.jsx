// src/pages/LeaveRecordsPage.jsx
import React, { useEffect, useState } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { mockLeaveRecords } from "../utils/mockData";
import { leaveService } from "../api/apiService";

const LeaveRecordsPage = ({
  leaveRecords,
  editingLeaveId,
  setEditingLeaveId,
  editingLeaveData,
  setEditingLeaveData,
  setLeaveRecords,
}) => {
  const [selectedM, setSelectedM] = useState("");          // e.g. "2025-03"
  const [leaveRecordsData, setLeaveRecordsData] = useState([]);
  const [fetchError, setFetchError] = useState("");
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const [year, month] = selectedM ? selectedM.split("-") : ["", ""];

 
  useEffect(() => {
    // If nothing selected yet, clear data & exit
    if (!year || !month) {
      setLeaveRecordsData([]);
      return;
    }

    let cancelled = false; // to avoid setting state after unmount

    const fetchLeaves = async () => {
      try {
        setLoadingLeaves(true);
        setFetchError("");

        const response = await leaveService.getByYearMonth(year, month);

        // Depending on your API shape, this might be response.data or response
        const data = response?.data ?? response ?? [];

        if (!cancelled) {
          setLeaveRecordsData(data);
          // also push up to parent if you want parent state in sync
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
      // cleanup: mark as cancelled so we don't set state on unmounted component
      cancelled = true;
    };
  }, [year, month, setLeaveRecords]);

  // Use API data if present, otherwise fall back to mock data
  const dataToShow =
    leaveRecordsData && leaveRecordsData.length > 0
      ? leaveRecordsData
      : mockLeaveRecords;

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
                    const remaining = rec.leaveBalance - rec.appliedLeaves;
                    const isEditing = editingLeaveId === rec.userId;

                    if (isEditing) {
                      const editedRemaining =
                        editingLeaveData.leaves -
                        editingLeaveData.appliedLeaves;

                      return (
                        <tr key={rec.userId}>
                          <td className="px-4 py-2">
                            <input
                              className="border rounded px-2 py-1 w-full"
                              value={editingLeaveData.name}
                              onChange={(e) =>
                                setEditingLeaveData((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="border rounded px-2 py-1 w-24"
                              value={editingLeaveData.leaves}
                              onChange={(e) =>
                                setEditingLeaveData((prev) => ({
                                  ...prev,
                                  leaves: Number(e.target.value),
                                }))
                              }
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              className="border rounded px-2 py-1 w-24"
                              value={editingLeaveData.appliedLeaves}
                              onChange={(e) =>
                                setEditingLeaveData((prev) => ({
                                  ...prev,
                                  appliedLeaves: Number(e.target.value),
                                }))
                              }
                            />
                          </td>
                          <td className="px-4 py-2">
                            {editedRemaining}
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            <button
                              className="px-3 py-1 text-sm rounded bg-green-600 text-white"
                              onClick={() => {
                                setLeaveRecords((prev) =>
                                  prev.map((r) =>
                                    r.userId === rec.userId
                                      ? {
                                          ...r,
                                          userName: editingLeaveData.name,
                                          leaveBalance:
                                            editingLeaveData.leaves,
                                          appliedLeaves:
                                            editingLeaveData.appliedLeaves,
                                        }
                                      : r
                                  )
                                );
                                setEditingLeaveId(null);
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="px-3 py-1 text-sm rounded bg-gray-300 text-gray-800"
                              onClick={() => setEditingLeaveId(null)}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    }

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
                            onClick={() => {
                              setEditingLeaveId(rec.userId);
                              setEditingLeaveData({
                                name: rec.userName,
                                leaves: rec.leaveBalance,
                                appliedLeaves: rec.appliedLeaves,
                              });
                            }}
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
    </div>
  );
};

export default LeaveRecordsPage;
