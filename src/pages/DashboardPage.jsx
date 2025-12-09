// src/pages/DashboardPage.jsx
import React from "react";
import { User, Mail, Monitor, Building, Phone, MapPin, Edit2 } from "lucide-react";

const DashboardPage = ({ currentUserDetails, userEmail, handleEditMyDetails }) => {
  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4">
            <User className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm font-medium">Profile Status</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {currentUserDetails ? "Complete" : "Incomplete"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 mb-4">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm font-medium">Email</p>
          <p className="text-lg font-bold text-gray-800 mt-2 truncate">{userEmail}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Information</h2>
          <button
            onClick={handleEditMyDetails}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Details</span>
          </button>
        </div>

        {currentUserDetails ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Name", value: currentUserDetails.name, icon: User },
              { label: "Employee ID", value: currentUserDetails.empId, icon: User },
              {
                label: "IP Address",
                value: currentUserDetails.machineIpAddress,
                icon: Monitor,
              },
              {
                label: "Device Hostname",
                value: currentUserDetails.deviceHostName,
                icon: Monitor,
              },
              {
                label: "VPN Username",
                value: currentUserDetails.clientVpnUsername,
                icon: User,
              },
              { label: "Asset ID", value: currentUserDetails.assetId, icon: Building },
              { label: "Contact No", value: currentUserDetails.contactNo, icon: Phone },
              { label: "Location", value: currentUserDetails.location, icon: MapPin },
              {
                label: "VDI Location",
                value: currentUserDetails.vdiPhysicalMachineLocation,
                icon: Building,
              },
              { label: "Work Mode", value: currentUserDetails.hwfhPwfH, icon: Building },
            ].map(
              (field, idx) =>
                field.value && (
                  <div
                    key={idx}
                    className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl"
                  >
                    <field.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">{field.label}</p>
                      <p className="font-semibold text-gray-800">{field.value}</p>
                    </div>
                  </div>
                )
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No details added yet</p>
            <button
              onClick={handleEditMyDetails}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Add My Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
