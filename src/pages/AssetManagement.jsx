import React, { useEffect, useState } from "react";
import { Package, Loader2, Plus, HardDrive, Code, Edit2, Trash2 } from "lucide-react";
import { assetService } from "../api/apiService";

const AssetCategory = {
  PhysicalMachine: 1,
  ClientVDI: 2,
};

const AssetType = {
  Hardware: 1,
  Software: 2,
};

const AssetManagementPage = ({ setCurrentPage }) => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assets, filterType, filterCategory]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await assetService.getAll();
      console.debug("assetService.getAll() =>", data);
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to fetch assets");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const safeAssets = Array.isArray(assets) ? assets : [];
    const f = safeAssets.filter((asset) => {
      const matchesType = filterType === "all" || asset?.type === Number(filterType);
      const matchesCategory = filterCategory === "all" || asset?.category === Number(filterCategory);
      return matchesType && matchesCategory;
    });
    setFilteredAssets(f);
  };

  const handleEditAsset = (asset) => {
    try {
      sessionStorage.setItem("editingAsset", JSON.stringify(asset));
    } catch (e) {
      console.warn("Could not store editing asset in sessionStorage", e);
    }
    setCurrentPage("asset-form");
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;
    
    try {
      setLoading(true);
      setError("");
      
      // Fixed: Proper delete call
      await assetService.delete(id);
      
      // Refresh the list after successful delete
      await fetchAssets();
      
    } catch (err) {
      console.error("Failed to delete asset:", err);
      setError(err?.response?.data?.message || err?.message || "Failed to delete asset");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    sessionStorage.removeItem("editingAsset");
    setCurrentPage("asset-form");
  };

  const getCategoryLabel = (category) =>
    category === AssetCategory.PhysicalMachine ? "Physical Machine" : "Client VDI";

  const getTypeLabel = (type) => (type === AssetType.Hardware ? "Hardware" : "Software");

  const safeFiltered = Array.isArray(filteredAssets) ? filteredAssets : [];
  const safeAssetsLen = Array.isArray(assets) ? assets.length : 0;

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
          Asset Management
        </h1>
        <button
          onClick={handleAddNew}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Asset</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Type</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
            >
              <option value="all">All Types</option>
              <option value="1">Hardware</option>
              <option value="2">Software</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Category</label>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)} 
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 outline-none"
            >
              <option value="all">All Categories</option>
              <option value="1">Physical Machine</option>
              <option value="2">Client VDI</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : safeAssetsLen === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No assets found</p>
            <button
              onClick={handleAddNew}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Add Your First Asset
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Category</th>
                  <th className="px-6 py-4 text-left font-semibold">Type</th>
                  <th className="px-6 py-4 text-left font-semibold">Version</th>
                  <th className="px-6 py-4 text-left font-semibold">Specifications</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeFiltered.map((asset, idx) => (
                  <tr
                    key={asset?.id ?? idx}
                    className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center space-x-2">
                        {asset?.type === AssetType.Hardware ? (
                          <HardDrive className="w-5 h-5 text-purple-600" />
                        ) : (
                          <Code className="w-5 h-5 text-cyan-600" />
                        )}
                        <span>{asset?.name ?? "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          asset?.category === AssetCategory.PhysicalMachine ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {getCategoryLabel(asset?.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${asset?.type === AssetType.Hardware ? "bg-purple-100 text-purple-700" : "bg-cyan-100 text-cyan-700"}`}>
                        {getTypeLabel(asset?.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{asset?.version ?? "-"}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="max-w-xs truncate" title={asset?.specifications ?? ""}>
                        {asset?.specifications ?? "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEditAsset(asset)} 
                          className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors" 
                          title="Edit"
                          disabled={loading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteAsset(asset?.id)} 
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50" 
                          title="Delete"
                          disabled={loading}
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

export default AssetManagementPage;