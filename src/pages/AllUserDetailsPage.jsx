import React from "react";
import { Loader2, Trash2, Edit2 } from "lucide-react";

const AllUserDetailsPage = ({
  allUserDetails,
  loading,
  userEmail,
  handleEditAllDetails,
  handleDeleteUser,
}) => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        All User Details
      </h1>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : allUserDetails.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-lg">No user details found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Emp ID</th>
                  <th className="px-6 py-4 text-left font-semibold">IP Address</th>
                  <th className="px-6 py-4 text-left font-semibold">Location</th>
                  <th className="px-6 py-4 text-left font-semibold">Work Mode</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUserDetails.map((user, idx) => (
                  <tr
                    key={idx}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {user.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {user.empId || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {user.machineIpAddress || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {user.location || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          user.hwfhPwfH === "HWFH"
                            ? "bg-blue-100 text-blue-700"
                            : user.hwfhPwfH === "PWFH"
                            ? "bg-green-100 text-green-700"
                            : user.hwfhPwfH === "Office"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.hwfhPwfH || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditAllDetails(user)}
                          className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Edit"
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.email)}
                          disabled={loading || user.email === userEmail}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title={
                            user.email === userEmail
                              ? "Cannot delete your own account"
                              : "Delete"
                          }
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
        )}
      </div>
    </div>
  );
};

export default AllUserDetailsPage;