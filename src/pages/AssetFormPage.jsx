// src/pages/AssetFormPage.jsx
import React, { useEffect, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { assetService } from "../api/apiService";

const AssetCategory = {
  PhysicalMachine: 1,
  ClientVDI: 2,
};

const AssetType = {
  Hardware: 1,
  Software: 2,
};

const AssetFormPage = ({ setCurrentPage }) => {
  const [assetForm, setAssetForm] = useState({
    name: "",
    category: AssetCategory.PhysicalMachine,
    type: AssetType.Hardware,
    version: "",
    specifications: "",
  });

  const [editingAsset, setEditingAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load editing asset from sessionStorage (if any)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("editingAsset");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setEditingAsset(parsed);
          setAssetForm({
            name: parsed.name || "",
            category: parsed.category ?? AssetCategory.PhysicalMachine,
            type: parsed.type ?? AssetType.Hardware,
            version: parsed.version || "",
            specifications: parsed.specifications || "",
          });
        }
      }
    } catch (err) {
      console.warn("Could not load editingAsset from sessionStorage:", err);
    }
  }, []);

  const resetForm = () => {
    setEditingAsset(null);
    setAssetForm({
      name: "",
      category: AssetCategory.PhysicalMachine,
      type: AssetType.Hardware,
      version: "",
      specifications: "",
    });
    try {
      sessionStorage.removeItem("editingAsset");
    } catch (e) {}
  };

  const handleSaveAsset = async () => {
    if (!assetForm.name || assetForm.name.trim() === "") {
      setError("Asset name is required");
      return;
    }

    setError("");
    setLoading(true);

    const payload = {
      name: assetForm.name.trim(),
      category: Number(assetForm.category),
      type: Number(assetForm.type),
      version: assetForm.version?.trim() || null,
      specifications: assetForm.specifications?.trim() || null,
    };

    try {
      if (
        editingAsset &&
        editingAsset.id !== undefined &&
        editingAsset.id !== null
      ) {
        await assetService.update(editingAsset.id, payload);
      } else {
        await assetService.create(payload);
      }

      resetForm();
      setCurrentPage("assets");
    } catch (err) {
      console.error("Failed to save asset:", err);
      setError(
        err?.response?.data?.message || err?.message || "Failed to save asset"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
        {editingAsset ? "Edit Asset" : "Add New Asset"}
      </h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Asset Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={assetForm.name}
              onChange={(e) =>
                setAssetForm({ ...assetForm, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter asset name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <select
              value={assetForm.category}
              onChange={(e) =>
                setAssetForm({ ...assetForm, category: Number(e.target.value) })
              }
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
            >
              <option value={AssetCategory.PhysicalMachine}>
                Physical Machine
              </option>
              <option value={AssetCategory.ClientVDI}>Client VDI</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type
            </label>
            <select
              value={assetForm.type}
              onChange={(e) =>
                setAssetForm({ ...assetForm, type: Number(e.target.value) })
              }
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
            >
              <option value={AssetType.Hardware}>Hardware</option>
              <option value={AssetType.Software}>Software</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Version{" "}
              {assetForm.type === AssetType.Software && (
                <span className="text-gray-500">(for software)</span>
              )}
            </label>
            <input
              type="text"
              value={assetForm.version}
              onChange={(e) =>
                setAssetForm({ ...assetForm, version: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="e.g., v2.0.1"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Specifications{" "}
              {assetForm.type === AssetType.Hardware && (
                <span className="text-gray-500">(for hardware)</span>
              )}
            </label>
            <textarea
              value={assetForm.specifications}
              onChange={(e) =>
                setAssetForm({ ...assetForm, specifications: e.target.value })
              }
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              placeholder="Enter detailed specifications..."
            />
          </div>
        </div>

        <div className="mt-8 flex space-x-4">
          <button
            onClick={handleSaveAsset}
            disabled={loading}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{editingAsset ? "Update" : "Save"} Asset</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              resetForm();
              setCurrentPage("asset-management"); // ← Redirect to AssetManagement.jsx
            }}
            className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetFormPage;
