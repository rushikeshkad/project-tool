// src/App.jsx
import React, { useState, useEffect } from "react";
import { authService, userDetailsService } from "./api/apiService";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import AuthScreen from "./components/auth/AuthScreen.jsx";
import DashboardPage from "./pages/DashboardPage";
import LeaveRecordsPage from "./pages/LeaveRecordsPage";
import MyDetailsPage from "./pages/MyDetailsPage";
import AllUserDetailsPage from "./pages/AllUserDetailsPage.jsx";

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
  const [editUserEmail, setEditUserEmail] = useState("");

  // Leave records
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

  // Check if user already logged in
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
          (err.response?.data?.message ||
            err.message ||
            JSON.stringify(err))
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
        // LOGIN
        response = await authService.login(authForm.email, authForm.password);

        const userDetails = await userDetailsService.getByEmail(
          authForm.email
        );
        if (userDetails) {
          setUserName(userDetails.name);
          sessionStorage.setItem("userName", userDetails.name);
        }

        sessionStorage.setItem("userEmail", response.email || authForm.email);
        setUserEmail(response.email || authForm.email);
        setIsAuthenticated(true);
        setCurrentPage("dashboard");

        fetchCurrentUserDetails(response.email || authForm.email);
      } else {
        // REGISTER
        response = await authService.register(
          authForm.name,
          authForm.email,
          authForm.password,
          authForm.confirmPassword
        );

        alert("User registered successfully. Please log in.");
        setIsLogin(true);
        setAuthForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setError("");
      }
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

      const detailsData = {
        name: formData.name,
        empId: formData.empId ? parseInt(formData.empId, 10) : null,
        machineIpAddress: formData.machineIpAddress || null,
        deviceHostName: formData.deviceHostName || null,
        clientVpnUsername: formData.clientVpnUsername || null,
        assetId: formData.assetId || null,
        contactNo: formData.contactNo || null,
        bitLockerPassword: formData.bitLockerPassword || null,
        location: formData.location || null,
        vdiPhysicalMachineLocation:
          formData.vdiPhysicalMachineLocation || null,
        hwfhPwfH: formData.hwfhPwfH || null,
      };

      if (editUserEmail && editUserEmail !== userEmail) {
        await userDetailsService.updateAdmin(editUserEmail, detailsData);
      } else {
        await userDetailsService.updateSelf(detailsData);
      }

      await fetchCurrentUserDetails(userEmail);
      setEditingDetails(false);
      setCurrentPage("dashboard");
      setEditUserEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to save details"
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
        vdiPhysicalMachineLocation:
          currentUserDetails.vdiPhysicalMachineLocation || "",
        hwfhPwfH: currentUserDetails.hwfhPwfH || "",
      });
    }
    setEditingDetails(true);
    setCurrentPage("add-edit");
  };

  const handleEditAllDetails = (user) => {
    if (user) {
      setEditUserEmail(user.email);
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

  // ✅ Show auth screen when NOT authenticated
  if (isAuthenticated) {
    return (
      <AuthScreen
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        authForm={authForm}
        setAuthForm={setAuthForm}
        loading={loading}
        error={error}
        handleAuth={handleAuth}
      />
    );
  }

  // Main app layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <Navbar userName={userName} handleLogout={handleLogout} />

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          setError={setError}
          handleEditMyDetails={handleEditMyDetails}
        />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {loading && currentPage === "dashboard" ? (
              <div className="flex items-center justify-center h-64">
                {/* simple spinner; DashboardPage also has content */}
                Loading...
              </div>
            ) : (
              <>
                {currentPage === "dashboard" && (
                  <DashboardPage
                    currentUserDetails={currentUserDetails}
                    userEmail={userEmail}
                    handleEditMyDetails={handleEditMyDetails}
                  />
                )}

                {currentPage === "leave-records" && (
                  <LeaveRecordsPage
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    leaveRecords={leaveRecords}
                    editingLeaveId={editingLeaveId}
                    setEditingLeaveId={setEditingLeaveId}
                    editingLeaveData={editingLeaveData}
                    setEditingLeaveData={setEditingLeaveData}
                    setLeaveRecords={setLeaveRecords}
                  />
                )}

                {currentPage === "add-edit" && (
                  <MyDetailsPage
                    currentUserDetails={currentUserDetails}
                    formData={formData}
                    setFormData={setFormData}
                    loading={loading}
                    handleSaveDetails={handleSaveDetails}
                    goBackToDashboard={() => setCurrentPage("dashboard")}
                  />
                )}

                {currentPage === "all-details" && (
                  <AllUserDetailsPage
                    allUserDetails={allUserDetails}
                    loading={loading}
                    userEmail={userEmail}
                    handleEditAllDetails={handleEditAllDetails}
                    handleDeleteUser={handleDeleteUser}
                  />
                )}
              </>
            )}
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
