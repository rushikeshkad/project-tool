// src/pages/LeaveRecordsPage.jsx
import React, { useEffect } from "react";
import MonthYearPicker from "../components/layout/MonthYearPicker";
import { useState } from "react";
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

    const [selectedM, setSelectedM] = useState("");
    const [leaveRecordsData, setLeaveRecordsData] = useState([])
 const [month, year] = selectedM.split("-");
 useEffect(async() => {
    if(month && year){
        //call BE
        const response = await leaveService?.getByYearMonth(year, month)
        response?.data && setLeaveRecordsData(mockLeaveRecords)
    }
 }, [selectedM])
const mockData = mockLeaveRecords;
console.log(" selectedM ",selectedM)
console.log("Month year", month,year)

//   const monthInputValue =
//     selectedYear && selectedMonth
//       ? `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`
//       : "";

//   const readableLabel =
//     selectedYear && selectedMonth
//       ? `${monthNames[Number(selectedMonth) - 1]}, ${selectedYear}`
//       : "Select Month, Year";

//   const handleMonthChange = (e) => {
//     const value = e.target.value; // e.g. "2025-03"
//     if (!value) {
//       setSelectedYear("");
//       setSelectedMonth("");
//       return;
//     }
//     const [year, monthNum] = value.split("-");
//     setSelectedYear(year);
//     setSelectedMonth(monthNum);
//   };

//   const monthYearChosen = selectedYear && selectedMonth;

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
          {/* Custom visible box (behind) */}
          {/* <div className="border rounded-lg px-3 py-2 bg-white flex justify-between items-center">
            <span className="text-gray-700">{readableLabel}</span>
            <span className="text-gray-500">📅</span>
          </div> */}

          {/* Invisible/native month input (on top, clickable) */}
          {/* <input
            type="month"
            value={monthInputValue}
            onChange={handleMonthChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          >
            </input> */}
            <MonthYearPicker value={selectedM} onChange={setSelectedM} />
        </div>
      </div>

       {month && year && (
        <>
          {mockData?.length === 0 ? (
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
                  {mockData?.map((rec) => {
                    const remaining = rec.leaveBalance - rec.appliedLeaves;
                    const isEditing = editingLeaveId === rec.userId;

                    if (isEditing) {
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
                            {editingLeaveData.leaves -
                              editingLeaveData.appliedLeaves}
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            <button
                              className="px-3 py-1 text-sm rounded bg-green-600 text-white"
                              onClick={() => {
                                setLeaveRecords((prev) =>
                                  prev.map((r) =>
                                    r.id === rec.userId
                                      ? { ...r, ...editingLeaveData }
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
                        <td className="px-4 py-2">{rec.appliedLeaves}</td>
                        <td className="px-4 py-2">{rec.totalLeaves}</td>
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
