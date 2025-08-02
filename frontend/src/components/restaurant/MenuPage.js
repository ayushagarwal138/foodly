import React, { useState, useEffect } from "react";
import { api, API_ENDPOINTS } from "../../config/api";

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isAvailable: true
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");

  const fetchMenu = async () => {
    setError("");
    try {
      const data = await api.get(API_ENDPOINTS.RESTAURANT_MENU(restaurantId));
      console.log("Fetched menu:", data);
      setMenuItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching menu:", err);
      setError(err.message);
    }
  };

  const addMenuItem = async () => {
    try {
      const data = await api.post(API_ENDPOINTS.RESTAURANT_MENU(restaurantId), newItem);
      console.log("Added menu item:", data);
      setMenuItems(prev => [...prev, data]);
      setNewItem({ name: "", description: "", price: "", category: "", isAvailable: true });
      setShowAddForm(false);
    } catch (err) {
      console.error("Error adding menu item:", err);
      setError(err.message);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      const data = await api.patch(
        API_ENDPOINTS.MENU_ITEM_AVAILABILITY(restaurantId, item.id),
        { isAvailable: !item.isAvailable }
      );
      console.log("Updated availability:", data);
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id ? { ...menuItem, isAvailable: !menuItem.isAvailable } : menuItem
      ));
    } catch (err) {
      console.error("Error updating availability:", err);
      setError(err.message);
    }
  };

  const deleteMenuItem = async (item) => {
    try {
      // Check if item can be deleted
      const canDelete = await api.get(API_ENDPOINTS.MENU_ITEM_CAN_DELETE(restaurantId, item.id));
      if (!canDelete.canDelete) {
        setError("Cannot delete item - it has been ordered recently");
        return;
      }

      await api.delete(API_ENDPOINTS.MENU_ITEM_DELETE(restaurantId, item.id));
      console.log("Deleted menu item:", item.id);
      setMenuItems(prev => prev.filter(menuItem => menuItem.id !== item.id));
    } catch (err) {
      console.error("Error deleting menu item:", err);
      setError(err.message);
    }
  };

  useEffect(() => {
    async function initialFetch() {
      setLoading(true);
      await fetchMenu();
      setLoading(false);
    }
    if (restaurantId) {
      initialFetch();
    }
  }, [restaurantId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#16213e]">Restaurant Menu</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "Add Menu Item"}
        </button>
      </div>

      {/* Add Menu Item Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Add New Menu Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={newItem.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={newItem.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Appetizer, Main Course, Dessert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={newItem.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={newItem.isAvailable}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Item is available for ordering</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={newItem.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item description"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={addMenuItem}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Item
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Menu Items List */}
      {menuItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No menu items yet.</div>
          <div className="text-sm text-gray-400">Add your first menu item to get started.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-[#16213e]">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <span className="text-lg font-bold text-[#16213e]">${item.price}</span>
              </div>
              
              <p className="text-gray-700 mb-4">{item.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.isAvailable 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {item.isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      item.isAvailable
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-green-600 text-white hover:bg-green-700"
                    } transition-colors`}
                  >
                    {item.isAvailable ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item)}
                    className="px-3 py-1 rounded text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 