// src/App.jsx
import React, { useState, useEffect } from "react";
import { authService, userDetailsService, leaveService } from "./api/apiService";

// Layout Components
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

// Auth Screen
import AuthScreen from "./components/auth/AuthScreen.jsx";

// Pages
import DashboardPage from "./pages/DashboardPage";
import LeaveRecordsPage from "./pages/LeaveRecordsPage";
import MyDetailsPage from "./pages/MyDetailsPage";
import AllUserDetailsPage from "./pages/AllUserDetailsPage.jsx";
import AssetManagementPage from "./pages/AssetManagement.jsx";
import AssetFormPage from "./pages/AssetFormPage.jsx";

// NEW IMPORTS FOR ASSET MANAGEMENT


const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const [allUserDetails, setAllUserDetails] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState(null);

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
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [leaveRecords, setLeaveRecords] = useState([]);
  const [editingLeaveId, setEditingLeaveId] = useState(null);
  const [editingLeaveData, setEditingLeaveData] = useState({
    name: "",
    leaves: 0,
    appliedLeaves: 0,
  });

  // Auth form
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });


  // Auto-login if session exists
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


  // Fetch user list when on All Users page
  useEffect(() => {
    if (isAuthenticated && currentPage === "all-details") {
      fetchAllUserDetails();
    }
  }, [isAuthenticated, currentPage]);


  // Fetch leave records automatically
  useEffect(() => {
    if (!isAuthenticated || !selectedYear || !selectedMonth) return;

    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const data = await leaveService.getByYearMonth(selectedYear, selectedMonth);
        setLeaveRecords(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [isAuthenticated, selectedYear, selectedMonth]);


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
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleAuth = async () => {
    if (!authForm.email || !authForm.password) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isLogin) {
        const response = await authService.login(authForm.email, authForm.password);

        const userDetails = await userDetailsService.getByEmail(authForm.email);
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
        await authService.register(
          authForm.name,
          authForm.email,
          authForm.password,
          authForm.confirmPassword
        );

        alert("Registration successful. Please login.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    await authService.logout();
    sessionStorage.clear();
    setIsAuthenticated(false);
    setUserEmail("");
    setUserName("");
    setCurrentUserDetails(null);
    setAllUserDetails([]);
  };


  const handleEditMyDetails = () => {
    if (currentUserDetails) {
      setFormData(currentUserDetails);
    }
    setCurrentPage("add-edit");
  };


  const handleSaveDetails = async () => {
    if (!formData.name) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);

      const payload = { ...formData };

      if (editUserEmail && editUserEmail !== userEmail) {
        await userDetailsService.updateAdmin(editUserEmail, payload);
      } else {
        await userDetailsService.updateSelf(payload);
      }

      fetchCurrentUserDetails(userEmail);
      setCurrentPage("dashboard");
      setEditUserEmail("");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteUser = async (email) => {
    if (!window.confirm("Delete user?")) return;

    try {
      setLoading(true);
      await userDetailsService.delete(email);
      fetchAllUserDetails();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };


  // ❌ FIX: AuthScreen must show when NOT authenticated
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


  // MAIN APPLICATION UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <Navbar userName={userName} handleLogout={handleLogout} />

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")}>✕</button>
          </div>
        </div>
      )}

      <div className="flex">
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleEditMyDetails={handleEditMyDetails}
          setError={setError}
        />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">

            {currentPage === "dashboard" && (
              <DashboardPage
                currentUserDetails={currentUserDetails}
                userEmail={userEmail}
                handleEditMyDetails={handleEditMyDetails}
              />
            )}

            {currentPage === "leave-records" && (
              <LeaveRecordsPage leaveRecords={leaveRecords} setLeaveRecords={setLeaveRecords} />
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
                handleEditAllDetails={(user) => {
                  setEditUserEmail(user.email);
                  setFormData(user);
                  setCurrentPage("add-edit");
                }}
                handleDeleteUser={handleDeleteUser}
              />
            )}

            {/* ✅ NEW ASSET MANAGEMENT PAGES */}
            {currentPage === "asset-management" && (
              <AssetManagementPage setCurrentPage={setCurrentPage} />
            )}

            {currentPage === "asset-form" && (
              <AssetFormPage setCurrentPage={setCurrentPage} />
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
