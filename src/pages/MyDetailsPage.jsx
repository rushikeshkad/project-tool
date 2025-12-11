import React from "react";
import { Edit2, Plus, Loader2 } from "lucide-react";

const MyDetailsPage = ({
  currentUserDetails,
  formData,
  setFormData,
  handleSaveDetails,
  handleEditMyDetails,
  loading,
  setCurrentPage,
}) => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        {currentUserDetails ? "Edit My Details" : "Add My Details"}
      </h1>
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
            <input
              type="number"
              value={formData.empId}
              onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter employee ID"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Machine IP Address</label>
            <input
              type="text"
              value={formData.machineIpAddress}
              onChange={(e) => setFormData({ ...formData, machineIpAddress: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="e.g., 192.168.1.100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Device Hostname</label>
            <input
              type="text"
              value={formData.deviceHostName}
              onChange={(e) => setFormData({ ...formData, deviceHostName: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter device hostname"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Client VPN Username</label>
            <input
              type="text"
              value={formData.clientVpnUsername}
              onChange={(e) => setFormData({ ...formData, clientVpnUsername: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter VPN username"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Asset ID</label>
            <input
              type="text"
              value={formData.assetId}
              onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter asset ID"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
            <input
              type="tel"
              value={formData.contactNo}
              onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter contact number"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">BitLocker Password</label>
            <input
              type="password"
              value={formData.bitLockerPassword}
              onChange={(e) => setFormData({ ...formData, bitLockerPassword: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter BitLocker password"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">VDI Physical Machine Location</label>
            <input
              type="text"
              value={formData.vdiPhysicalMachineLocation}
              onChange={(e) => setFormData({ ...formData, vdiPhysicalMachineLocation: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter VDI location"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Work Mode (HWFH/PWFH)</label>
            <select
              value={formData.hwfhPwfH}
              onChange={(e) => setFormData({ ...formData, hwfhPwfH: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
            >
              <option value="">Select Work Mode</option>
              <option value="HWFH">HWFH (Hybrid Work From Home)</option>
              <option value="PWFH">PWFH (Permanent Work From Home)</option>
              <option value="Office">Office</option>
            </select>
          </div>
        </div>

        <div className="mt-8 mb-4">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Balance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Planned Leave (PL)
            </label>
            <input
              type="number"
              value={formData.pl}
              onChange={(e) => setFormData({ ...formData, pl: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter planned leave"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Unplanned Leave (UL)
            </label>
            <input
              type="number"
              value={formData.ul}
              onChange={(e) => setFormData({ ...formData, ul: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter unplanned leave"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Floating Leave (FL)
            </label>
            <input
              type="number"
              value={formData.fl}
              onChange={(e) => setFormData({ ...formData, fl: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter floating leave"
              min="0"
            />
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={handleSaveDetails}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{currentUserDetails ? "Update" : "Save"} Details</span>
              </>
            )}
          </button>
          <button
            onClick={() => setCurrentPage("dashboard")}
            className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyDetailsPage;
