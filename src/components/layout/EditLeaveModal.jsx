import React, { useEffect, useState } from "react";

const EditLeaveModal = ({ isOpen, record, onClose, onSave, saving, error }) => {
  const [form, setForm] = useState({
    name: "",
    leaves: 0,
    appliedLeaves: 0,
  });

  // When record changes (or modal opens), initialize form
  useEffect(() => {
    if (record) {
      setForm({
        name: record.userName,
        leaves: record.leaveBalance,
        appliedLeaves: record.appliedLeaves,
      });
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const remaining = form.leaves - form.appliedLeaves;

  const handleChange = (field) => (e) => {
    const value =
      field === "leaves" || field === "appliedLeaves"
        ? Number(e.target.value)
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveClick = () => {
    onSave({
      name: form.name,
      leaveBalance: form.leaves,
      appliedLeaves: form.appliedLeaves,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white w-96 p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Edit Leave Record</h2>

        {error && (
          <p className="text-red-600 mb-3 text-sm">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.name}
              onChange={handleChange("name")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Leave Balance</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.leaves}
              onChange={handleChange("leaves")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Applied Leaves</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mt-1"
              value={form.appliedLeaves}
              onChange={handleChange("appliedLeaves")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Remaining</label>
            <div className="mt-1 font-bold">
              {remaining < 0 ? (
                <span className="text-red-600">{remaining}</span>
              ) : (
                remaining
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
            onClick={handleSaveClick}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditLeaveModal;
