import React, { useState, useEffect } from "react";

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ 
    name: "", 
    price: "", 
    category: "Main Course", 
    veg: true,
    isAvailable: true,
    quantityAvailable: null,
    showQuantity: false
  });
  const [saving, setSaving] = useState(false);
  const [deletableItems, setDeletableItems] = useState(new Set());
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
        
        // Check which items can be deleted
        const deletableSet = new Set();
        for (const item of data) {
          try {
            const checkRes = await fetch(`/api/restaurants/${restaurantId}/menu/${item.id}/can-delete`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            if (checkRes.ok) {
              const checkData = await checkRes.json();
              if (checkData.canDelete) {
                deletableSet.add(item.id);
              }
            }
          } catch (err) {
            console.error(`Failed to check deletability for item ${item.id}:`, err);
          }
        }
        setDeletableItems(deletableSet);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

  function handleAdd() {
    setAddForm({ 
      name: "", 
      price: "", 
      category: "Main Course", 
      veg: true,
      isAvailable: true,
      quantityAvailable: null,
      showQuantity: false
    });
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
        body: JSON.stringify({
          name: addForm.name,
          price: parseFloat(addForm.price),
          category: addForm.category,
          veg: addForm.veg,
          isAvailable: addForm.isAvailable,
          quantityAvailable: addForm.quantityAvailable ? parseInt(addForm.quantityAvailable) : null,
          showQuantity: addForm.showQuantity
        })
      });
      if (!res.ok) throw new Error("Failed to add menu item");
      setShowAdd(false);
      setAddForm({ 
        name: "", 
        price: "", 
        category: "Main Course", 
        veg: true,
        isAvailable: true,
        quantityAvailable: null,
        showQuantity: false
      });
      fetchMenu();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
  }
  }

  async function handleAvailabilityChange(item, field, value) {
    setError("");
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${item.id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update availability");
      }
      fetchMenu();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete menu item '${item.name}'?`)) return;
    setError("");
    try {
      // First check if the item can be deleted
      const checkRes = await fetch(`/api/restaurants/${restaurantId}/menu/${item.id}/can-delete`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        if (!checkData.canDelete) {
          let reason = "Cannot delete this menu item because it is referenced by: ";
          if (checkData.hasOrderItems) reason += "existing orders, ";
          if (checkData.hasReviews) reason += "customer reviews, ";
          if (checkData.hasWishlist) reason += "wishlist items, ";
          if (checkData.hasCart) reason += "cart items, ";
          reason = reason.slice(0, -2) + ".";
          throw new Error(reason);
        }
      }
      
      // Proceed with deletion
      const res = await fetch(`/api/restaurants/${restaurantId}/menu/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to delete menu item");
      }
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
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Menu items that are referenced by existing orders, reviews, or cart items cannot be deleted and will show as "Locked". 
          This ensures data integrity and prevents issues with customer orders and reviews.
        </p>
      </div>
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
                <th className="pb-2 px-4">Status</th>
                <th className="pb-2 px-4">Quantity</th>
                <th className="pb-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {menu.map(item => (
                <tr key={item.id} className="border-t last:border-b-0 hover:bg-blue-50 transition-all duration-150">
                  <td className="py-2 px-4 font-semibold text-[#16213e]">{item.name}</td>
                  <td className="py-2 px-4">₹{item.price}</td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.isAvailable}
                          onChange={(e) => handleAvailabilityChange(item, 'isAvailable', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      <span className={`text-xs font-semibold ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                        {item.isAvailable ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={item.showQuantity}
                          onChange={(e) => handleAvailabilityChange(item, 'showQuantity', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                      {item.showQuantity && (
                        <input
                          type="number"
                          min="0"
                          className="w-16 px-2 py-1 text-xs border rounded"
                          value={item.quantityAvailable || 0}
                          onChange={(e) => handleAvailabilityChange(item, 'quantityAvailable', parseInt(e.target.value) || 0)}
                        />
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    {/* <button className="text-blue-600 hover:underline text-xs font-semibold" onClick={() => handleEdit(item)}>Edit</button> */}
                    {deletableItems.has(item.id) ? (
                      <button className="text-red-600 hover:underline text-xs font-semibold" onClick={() => handleDelete(item)}>Delete</button>
                    ) : (
                      <span className="text-gray-400 text-xs font-semibold" title="Cannot delete: Referenced by orders, reviews, or cart items">Locked</span>
                    )}
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
            <div>
              <label className="block text-gray-600 font-medium mb-1">Category</label>
              <input className="w-full px-4 py-2 border rounded-xl" name="category" value={addForm.category} onChange={e => setAddForm(f => ({ ...f, category: e.target.value }))} />
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" name="veg" checked={addForm.veg} onChange={e => setAddForm(f => ({ ...f, veg: e.target.checked }))} />
              <label className="text-gray-600 font-medium">Vegetarian</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" name="isAvailable" checked={addForm.isAvailable} onChange={e => setAddForm(f => ({ ...f, isAvailable: e.target.checked }))} />
              <label className="text-gray-600 font-medium">Available</label>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="mr-2" name="showQuantity" checked={addForm.showQuantity} onChange={e => setAddForm(f => ({ ...f, showQuantity: e.target.checked }))} />
              <label className="text-gray-600 font-medium">Show Quantity</label>
            </div>
            {addForm.showQuantity && (
              <div>
                <label className="block text-gray-600 font-medium mb-1">Quantity Available</label>
                <input className="w-full px-4 py-2 border rounded-xl" name="quantityAvailable" type="number" min="0" value={addForm.quantityAvailable || ''} onChange={e => setAddForm(f => ({ ...f, quantityAvailable: e.target.value }))} />
              </div>
            )}
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