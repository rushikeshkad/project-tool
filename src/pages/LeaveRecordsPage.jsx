// src/pages/LeaveRecordsPage.jsx
import React from "react";

const LeaveRecordsPage = ({
  selectedMonth,
  setSelectedMonth,
  leaveRecords,
  editingLeaveId,
  setEditingLeaveId,
  editingLeaveData,
  setEditingLeaveData,
  setLeaveRecords,
}) => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        Leave Records
      </h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Month
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 w-64"
        >
          <option value="">-- Choose month --</option>
          <option value="jan">January</option>
          <option value="feb">February</option>
          <option value="mar">March</option>
          <option value="apr">April</option>
          <option value="may">May</option>
          <option value="jun">June</option>
          <option value="jul">July</option>
          <option value="aug">August</option>
          <option value="sep">September</option>
          <option value="oct">October</option>
          <option value="nov">November</option>
          <option value="dec">December</option>
        </select>
      </div>

      {selectedMonth && (
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
              {leaveRecords.map((rec) => {
                const remaining = rec.leaves - rec.appliedLeaves;
                const isEditing = editingLeaveId === rec.id;

                if (isEditing) {
                  return (
                    <tr key={rec.id}>
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
                        {editingLeaveData.leaves - editingLeaveData.appliedLeaves}
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="px-3 py-1 text-sm rounded bg-green-600 text-white"
                          onClick={() => {
                            setLeaveRecords((prev) =>
                              prev.map((r) =>
                                r.id === rec.id ? { ...r, ...editingLeaveData } : r
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
                  <tr key={rec.id}>
                    <td className="px-4 py-2">{rec.name}</td>
                    <td className="px-4 py-2">{rec.leaves}</td>
                    <td className="px-4 py-2">{rec.appliedLeaves}</td>
                    <td className="px-4 py-2">{remaining}</td>
                    <td className="px-4 py-2">
                      <button
                        className="px-3 py-1 text-sm rounded bg-purple-600 text-white"
                        onClick={() => {
                          setEditingLeaveId(rec.id);
                          setEditingLeaveData({
                            name: rec.name,
                            leaves: rec.leaves,
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
    </div>
  );
};

export default LeaveRecordsPage;
