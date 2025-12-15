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
    pl: 0,
    ul: 0,
    fl: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");

  // Leave records
  const [leaveRecords, setLeaveRecords] = useState([]);

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
          pl: data.pl || 0,
          ul: data.ul || 0,
          fl: data.fl || 0,
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

    // Registration validation
    if (!isLogin) {
      if (!authForm.name) {
        setError("Name is required for registration");
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

      if (isLogin) {
        // ✅ LOGIN - Use authService
        console.log("Attempting login with:", authForm.email);
        
        const response = await authService.login(authForm.email, authForm.password);
        console.log("Login response:", response);

        // ✅ Store in session storage
        sessionStorage.setItem("userEmail", authForm.email);
        
        // Fetch user details to get the name
        try {
          const userDetails = await userDetailsService.getByEmail(authForm.email);
          if (userDetails && userDetails.name) {
            setUserName(userDetails.name);
            sessionStorage.setItem("userName", userDetails.name);
          } else {
            // Fallback to email if name not found
            setUserName(authForm.email.split('@')[0]);
            sessionStorage.setItem("userName", authForm.email.split('@')[0]);
          }
          setCurrentUserDetails(userDetails);
        } catch (detailsErr) {
          console.warn("Could not fetch user details:", detailsErr);
          // Use email as fallback
          setUserName(authForm.email.split('@')[0]);
          sessionStorage.setItem("userName", authForm.email.split('@')[0]);
        }

        setUserEmail(authForm.email);
        setIsAuthenticated(true);
        setCurrentPage("dashboard");

        // Clear auth form
        setAuthForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });

      } else {
        // ✅ REGISTRATION
        console.log("Attempting registration with:", authForm.email);
        
        await authService.register(
          authForm.name,
          authForm.email,
          authForm.password,
          authForm.confirmPassword
        );

        alert("Registration successful! Please login with your credentials.");
        setIsLogin(true);
        
        // Clear form after successful registration
        setAuthForm({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
    
    // Clear session storage
    sessionStorage.removeItem("userEmail");
    sessionStorage.removeItem("userName");
    sessionStorage.clear();
    
    // Reset state
    setIsAuthenticated(false);
    setUserEmail("");
    setUserName("");
    setCurrentUserDetails(null);
    setAllUserDetails([]);
    setCurrentPage("dashboard");
    
    // Clear auth form
    setAuthForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleEditMyDetails = () => {
    if (currentUserDetails) {
      setFormData({
        ...currentUserDetails,
        pl: currentUserDetails.pl || 0,
        ul: currentUserDetails.ul || 0,
        fl: currentUserDetails.fl || 0,
      });
    }
    setEditUserEmail("");
    setCurrentPage("add-edit");
  };

  const handleSaveDetails = async () => {
    if (!formData.name) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const payload = { ...formData };

      if (editUserEmail && editUserEmail !== userEmail) {
        // Admin editing another user
        await userDetailsService.updateAdmin(editUserEmail, payload);
        fetchAllUserDetails();
      } else {
        // User editing their own details
        await userDetailsService.updateSelf(payload);
        fetchCurrentUserDetails(userEmail);
      }

      setCurrentPage(editUserEmail ? "all-details" : "dashboard");
      setEditUserEmail("");
    } catch (err) {
      console.error("Save details error:", err);
      setError(err.response?.data?.message || err.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm(`Are you sure you want to delete user: ${email}?`)) return;

    try {
      setLoading(true);
      setError("");
      await userDetailsService.delete(email);
      await fetchAllUserDetails();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  // Show auth screen when NOT authenticated
  if (!isAuthenticated) {
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
              <LeaveRecordsPage 
                leaveRecords={leaveRecords} 
                setLeaveRecords={setLeaveRecords}
                userEmail={userEmail}
              />
            )}

            {currentPage === "add-edit" && (
              <MyDetailsPage
                currentUserDetails={currentUserDetails}
                formData={formData}
                setFormData={setFormData}
                loading={loading}
                handleSaveDetails={handleSaveDetails}
                goBackToDashboard={() => {
                  if (editUserEmail) {
                    setCurrentPage("all-details");
                  } else {
                    setCurrentPage("dashboard");
                  }
                  setEditUserEmail("");
                }}
              />
            )}

            {currentPage === "all-details" && (
              <AllUserDetailsPage
                allUserDetails={allUserDetails}
                loading={loading}
                userEmail={userEmail}
                handleEditAllDetails={(user) => {
                  setEditUserEmail(user.email);
                  setFormData({
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
                    pl: user.pl || 0,
                    ul: user.ul || 0,
                    fl: user.fl || 0,
                  });
                  setCurrentPage("add-edit");
                }}
                handleDeleteUser={handleDeleteUser}
              />
            )}

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