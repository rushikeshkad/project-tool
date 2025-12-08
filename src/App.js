import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  LayoutDashboard,
  FileEdit,
  List,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Phone,
  Monitor,
  MapPin,
  Building,
  CalendarDays,
} from "lucide-react";
import { authService, userDetailsService } from "./api/apiService";

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [allUserDetails, setAllUserDetails] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    machineIpAddress: "",
    deviceHostName: "",
    clientVpnUsername: "",
    assetId: "",
    contactNo: "",
    bitLockerPassword: "",
    location: "",
    vdiPhysicalMachineLocation: "",
    hwfhPwfH: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // Leave records state
  const [selectedMonth, setSelectedMonth] = useState("");
  const [leaveRecords, setLeaveRecords] = useState([
    { id: 1, name: "John Doe", leaves: 12, appliedLeaves: 3 },
    { id: 2, name: "Jane Smith", leaves: 10, appliedLeaves: 4 },
  ]);

  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [editingLeaveData, setEditingLeaveData] = useState({
    name: "",
    leaves: 0,
    appliedLeaves: 0,
  });


  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Check if user is already logged in on mount
  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    const name = sessionStorage.getItem("userName");
    if (email && name) {
      setUserEmail(email);
      setUserName(name);
      setIsAuthenticated(true);
      fetchCurrentUserDetails(email);
    }
  }, []);

  // Fetch all user details when on "All Details" page
  useEffect(() => {
    if (isAuthenticated && currentPage === "all-details") {
      fetchAllUserDetails();
    }
  }, [isAuthenticated, currentPage]);

  const fetchCurrentUserDetails = async (email) => {
    try {
      const data = await userDetailsService.getByEmail(email);
      setCurrentUserDetails(data);
      if (data) {
        setFormData({
          name: data.name || "",
          empId: data.empId || "",
          machineIpAddress: data.machineIpAddress || "",
          deviceHostName: data.deviceHostName || "",
          clientVpnUsername: data.clientVpnUsername || "",
          assetId: data.assetId || "",
          contactNo: data.contactNo || "",
          bitLockerPassword: data.bitLockerPassword || "",
          location: data.location || "",
          vdiPhysicalMachineLocation: data.vdiPhysicalMachineLocation || "",
          hwfhPwfH: data.hwfhPwfH || "",
        });
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      // It's okay if there are no details yet
    }
  };

  const fetchAllUserDetails = async () => {
    try {
      setLoading(true);
      const data = await userDetailsService.getAll();
      setAllUserDetails(data);
      setError("");
    } catch (err) {
      setError(
        "Failed to fetch user details: " +
        (err.response?.data?.message || err.message || JSON.stringify(err))
      );
      console.error("Error fetching all user details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) {
      setError("Please fill in all required fields");
      return;
    }
    if (!isLogin) {
      if (!authForm.name) {
        setError("Please enter your name");
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      let response;
      if (isLogin) {
        response = await authService.login(authForm.email, authForm.password);
      } else {
        response = await authService.register(
          authForm.name,
          authForm.email,
          authForm.password,
          authForm.confirmPassword
        );
      }

      // Store user info in session storage
      sessionStorage.setItem("userEmail", response.email || authForm.email);
      sessionStorage.setItem("userName", response.name || authForm.name);
      setUserEmail(response.email || authForm.email);
      setUserName(response.name || authForm.name);
      setIsAuthenticated(true);
      setCurrentPage("dashboard");
      setAuthForm({ name: "", email: "", password: "", confirmPassword: "" });

      // Fetch user details after login
      fetchCurrentUserDetails(response.email || authForm.email);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Authentication failed"
      );
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userName");
      setIsAuthenticated(false);
      setIsLogin(true);
      setUserEmail("");
      setUserName("");
      setCurrentUserDetails(null);
      setAllUserDetails([]);
      setFormData({
        name: "",
        empId: "",
        machineIpAddress: "",
        deviceHostName: "",
        clientVpnUsername: "",
        assetId: "",
        contactNo: "",
        bitLockerPassword: "",
        location: "",
        vdiPhysicalMachineLocation: "",
        hwfhPwfH: "",
      });
    }
  };

  const handleSaveDetails = async () => {
    if (!formData.name) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Prepare data - convert empty strings to null for optional fields
      const detailsData = {
        name: formData.name,
        empId: formData.empId ? parseInt(formData.empId, 10) : null,
        machineIpAddress: formData.machineIpAddress || null,
        deviceHostName: formData.deviceHostName || null,
        clientVpnUsername: formData.clientVpnUsername || null,
        assetId: formData.assetId || null,
        contactNo: formData.contactNo ? formData.contactNo : null,
        bitLockerPassword: formData.bitLockerPassword || null,
        location: formData.location || null,
        vdiPhysicalMachineLocation: formData.vdiPhysicalMachineLocation || null,
        hwfhPwfH: formData.hwfhPwfH || null,
      };

      if (currentUserDetails) {
        // Update existing details
        await userDetailsService.update(userEmail, detailsData);
      } else {
        // Create new details
        await userDetailsService.create(detailsData);
      }

      // Refresh user details
      await fetchCurrentUserDetails(userEmail);
      setEditingDetails(false);
      setCurrentPage("dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data || "Failed to save details"
      );
      console.error("Error saving details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMyDetails = () => {
    if (currentUserDetails) {
      setFormData({
        name: currentUserDetails.name || "",
        empId: currentUserDetails.empId || "",
        machineIpAddress: currentUserDetails.machineIpAddress || "",
        deviceHostName: currentUserDetails.deviceHostName || "",
        clientVpnUsername: currentUserDetails.clientVpnUsername || "",
        assetId: currentUserDetails.assetId || "",
        contactNo: currentUserDetails.contactNo || "",
        bitLockerPassword: currentUserDetails.bitLockerPassword || "",
        location: currentUserDetails.location || "",
        vdiPhysicalMachineLocation: currentUserDetails.vdiPhysicalMachineLocation || "",
        hwfhPwfH: currentUserDetails.hwfhPwfH || "",
      });
    }
    setEditingDetails(true);
    setCurrentPage("add-edit");
  };
  const [editUserEmail, setEditUserEmail] = useState("");
  const handleEditAllDetails = (user) => {
    if (user) {
      setEditUserEmail(user.email);  // <-- important line

      setFormData({
        email: user.email || "",
        name: user.name || "",
        empId: user.empId || "",
        machineIpAddress: user.machineIpAddress || "",
        deviceHostName: user.deviceHostName || "",
        clientVpnUsername: user.clientVpnUsername || "",
        assetId: user.assetId || "",
        contactNo: user.contactNo || "",
        bitLockerPassword: user.bitLockerPassword || "",
        location: user.location || "",
        vdiPhysicalMachineLocation: user.vdiPhysicalMachineLocation || "",
        hwfhPwfH: user.hwfhPwfH || "",
      });
    }

    setEditingDetails(true);
    setCurrentPage("add-edit");
  };



  const handleDeleteUser = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user's details?")) {
      return;
    }

    try {
      setLoading(true);
      await userDetailsService.delete(email);
      await fetchAllUserDetails();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user details");
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl transform rotate-3" />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500 ${isLogin ? "translate-x-0" : "translate-x-full"
                }`}
            />
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 transition-transform duration-500 ${isLogin ? "rotate-0" : "rotate-180"
                    }`}
                >
                  <User className="w-10 h-10 text-white" />
                </div>

                <h2
                  className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500 ${isLogin ? "opacity-100 relative" : "opacity-0 absolute"
                    }`}
                >
                  {isLogin ? "Welcome Back" : ""}
                </h2>

                <h2
                  className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500 ${!isLogin ? "opacity-100 relative" : "opacity-0 absolute"
                    }`}
                >
                  {!isLogin ? "Create Account" : ""}
                </h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  />
                </div>

                {!isLogin && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={authForm.confirmPassword}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, confirmPassword: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                    />
                  </div>
                )}

                <button
                  onClick={handleAuth}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Sign In" : "Sign Up"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-purple-600 font-semibold hover:text-cyan-600 transition-colors duration-300"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                User Dashboard
              </span>
              <span className="ml-4 text-gray-600 text-sm">Welcome, {userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="w-64 bg-white shadow-xl min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "add-edit", icon: FileEdit, label: "My Details" },
              { id: "all-details", icon: List, label: "All User Details" },
              { id: "leave-records", icon: CalendarDays, label: "Leave Records" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setError("");
                  if (item.id === "add-edit") {
                    handleEditMyDetails();
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentPage === item.id
                    ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg transform scale-105"
                    : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {loading && currentPage === "dashboard" ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {currentPage === "dashboard" && (
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
                          ].map((field, idx) =>
                            field.value ? (
                              <div key={idx} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl">
                                <field.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-600">{field.label}</p>
                                  <p className="font-semibold text-gray-800">{field.value}</p>
                                </div>
                              </div>
                            ) : null
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
                )}

                {currentPage === "leave-records" && (
                  <div className="animate-fadeIn">
                    <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Leave Records
                    </h1>

                    {/* Month dropdown */}
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











                    {currentPage === "add-edit" && (
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
                    )}

                    {currentPage === "all-details" && (
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
                                    <th className="px-6 py-4 text-center font-semibold">Edit</th>
                                    <th className="px-6 py-4 text-center font-semibold">Delete</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {allUserDetails.map((user, idx) => (
                                    <tr key={idx} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                      <td className="px-6 py-4 font-medium text-gray-800">{user.email}</td>
                                      <td className="px-6 py-4 text-gray-700">{user.name || "-"}</td>
                                      <td className="px-6 py-4 text-gray-700">{user.empId || "-"}</td>
                                      <td className="px-6 py-4 text-gray-700">{user.machineIpAddress || "-"}</td>
                                      <td className="px-6 py-4 text-gray-700">{user.location || "-"}</td>
                                      <td className="px-6 py-4">
                                        <span
                                          className={`px-3 py-1 rounded-full text-sm font-medium ${user.hwfhPwfH === "HWFH"
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

                                          {/* ✏ Edit Button */}
                                          <button
                                            onClick={() => handleEditAllDetails(user)}
                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                            title="Edit"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="w-4 h-4"
                                              fill="none"
                                              viewBox="0 0 24 24"
                                              stroke="currentColor"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 5h2m-1-1v2m-1 8h2m-1-1v2m-1-8h2m-1-1v2M4 17v2h2l11-11c.78-.78.78-2.05 0-2.83l-1.17-1.17c-.78-.78-2.05-.78-2.83 0L4 14z"
                                              />
                                            </svg>
                                          </button>

                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                          <button
                                            onClick={() => handleDeleteUser(user.email)}
                                            disabled={loading || user.email === userEmail}
                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={user.email === userEmail ? "Cannot delete your own account" : "Delete"}
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
                    )}

                  </>

                )}

              </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default App;
