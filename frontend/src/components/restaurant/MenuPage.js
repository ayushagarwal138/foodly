import React, { useState, useEffect } from "react";

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", price: "" });
  const [saving, setSaving] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMenu();
    // eslint-disable-next-line
  }, [restaurantId, token]);

    async function fetchMenu() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}/menu`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch menu");
        const data = await res.json();
        setMenu(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  function handleAdd() {
    setAddForm({ name: "", price: "" });
    setShowAdd(true);
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: addForm.name, price: parseFloat(addForm.price) })
      });
      if (!res.ok) throw new Error("Failed to add menu item");
      setShowAdd(false);
      setAddForm({ name: "", price: "" });
      fetchMenu();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
  }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete menu item '${item.name}'?`)) return;
    setError("");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete menu item");
      fetchMenu();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <h2 className="text-2xl font-bold mb-6 text-[#16213e]">Menu Management</h2>
      <button className="mb-6 bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow hover:bg-blue-700 transition-all duration-200 text-lg" onClick={handleAdd}>+ Add Item</button>
      {menu.length === 0 ? (
        <div className="text-gray-500 text-center">No menu items available.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm rounded-xl overflow-hidden">
            <thead>
              <tr className="text-left text-gray-500 font-semibold bg-gray-50">
                <th className="pb-2 px-4">Name</th>
                <th className="pb-2 px-4">Price</th>
                <th className="pb-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item.id} className="border-t last:border-b-0 hover:bg-blue-50 transition-all duration-150">
                  <td className="py-2 px-4 font-semibold text-[#16213e]">{item.name}</td>
                  <td className="py-2 px-4">₹{item.price}</td>
                  <td className="py-2 px-4 flex gap-2">
                    {/* <button className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => handleEdit(item)}>Edit</button> */}
                    <button className="text-red-600 hover:underline text-xs font-semibold" onClick={() => handleDelete(item)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Add Item Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fade-in">
          <form className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6 border border-gray-100 animate-slide-up" onSubmit={handleAddSubmit}>
            <h3 className="text-xl font-bold mb-2 text-[#16213e]">Add Menu Item</h3>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Name</label>
              <input className="w-full px-4 py-2 border rounded-xl" name="name" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-gray-600 font-medium mb-1">Price (₹)</label>
              <input className="w-full px-4 py-2 border rounded-xl" name="price" type="number" min="1" step="0.01" value={addForm.price} onChange={e => setAddForm(f => ({ ...f, price: e.target.value }))} required />
            </div>
            <div className="flex gap-4 mt-4">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow hover:bg-blue-700 transition-all duration-200" type="submit" disabled={saving}>{saving ? "Saving..." : "Add Item"}</button>
              <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-bold shadow hover:bg-gray-300 transition-all duration-200" type="button" onClick={() => setShowAdd(false)} disabled={saving}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 