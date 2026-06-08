import React, { useState, useEffect } from "react";
import { FiEdit2, FiPackage, FiPower, FiTrash2 } from "react-icons/fi";
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
    veg: true,
    isAvailable: true,
    quantityAvailable: "",
    showQuantity: false
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const restaurantId = localStorage.getItem("restaurantId");

  const formatPrice = (price) => {
    const amount = Number(price);
    if (Number.isNaN(amount)) return price;
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };

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
      const itemData = {
        ...newItem,
        price: parseFloat(newItem.price),
        quantityAvailable: newItem.showQuantity ? parseInt(newItem.quantityAvailable) : null
      };
      
      const data = await api.post(API_ENDPOINTS.RESTAURANT_MENU(restaurantId), itemData);
      console.log("Added menu item:", data);
      setMenuItems(prev => [...prev, data]);
      setNewItem({ 
        name: "", 
        description: "", 
        price: "", 
        category: "", 
        veg: true,
        isAvailable: true,
        quantityAvailable: "",
        showQuantity: false
      });
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

  const updateQuantity = async (item, newQuantity) => {
    try {
      const data = await api.patch(
        API_ENDPOINTS.MENU_ITEM_AVAILABILITY(restaurantId, item.id),
        { 
          quantityAvailable: newQuantity,
          showQuantity: true
        }
      );
      console.log("Updated quantity:", data);
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id ? { ...menuItem, quantityAvailable: newQuantity, showQuantity: true } : menuItem
      ));
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError(err.message);
    }
  };

  const toggleVegStatus = async (item) => {
    try {
      const data = await api.patch(
        API_ENDPOINTS.MENU_ITEM_AVAILABILITY(restaurantId, item.id),
        { veg: !item.veg }
      );
      console.log("Updated veg status:", data);
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === item.id ? { ...menuItem, veg: !menuItem.veg } : menuItem
      ));
    } catch (err) {
      console.error("Error updating veg status:", err);
      setError(err.message);
    }
  };

  const editMenuItem = async () => {
    try {
      const itemData = {
        ...editingItem,
        price: parseFloat(editingItem.price),
        quantityAvailable: editingItem.showQuantity ? parseInt(editingItem.quantityAvailable) : null
      };
      
      const data = await api.put(API_ENDPOINTS.MENU_ITEM_UPDATE(restaurantId, editingItem.id), itemData);
      console.log("Updated menu item:", data);
      setMenuItems(prev => prev.map(menuItem => 
        menuItem.id === editingItem.id ? data : menuItem
      ));
      setEditingItem(null);
      setShowEditForm(false);
    } catch (err) {
      console.error("Error updating menu item:", err);
      setError(err.message);
    }
  };

  const startEditing = (item) => {
    setEditingItem({
      ...item,
      quantityAvailable: item.quantityAvailable || ""
    });
    setShowEditForm(true);
    setShowAddForm(false);
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

  const handleEditInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingItem(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="app-page surface-panel">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="veg"
                    value="true"
                    checked={newItem.veg === true}
                    onChange={() => setNewItem(prev => ({ ...prev, veg: true }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 inline-flex items-center gap-2 text-sm text-gray-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    Vegetarian
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="veg"
                    value="false"
                    checked={newItem.veg === false}
                    onChange={() => setNewItem(prev => ({ ...prev, veg: false }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 inline-flex items-center gap-2 text-sm text-gray-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Non-Vegetarian
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Tracking</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="showQuantity"
                  checked={newItem.showQuantity}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Track quantity available</span>
              </div>
            </div>
            {newItem.showQuantity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                <input
                  type="number"
                  name="quantityAvailable"
                  value={newItem.quantityAvailable}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  min="0"
                />
              </div>
            )}
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

      {/* Edit Menu Item Form */}
      {showEditForm && editingItem && (
        <div className="mb-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-[#16213e] mb-4">Edit Menu Item</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={editingItem.name}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <input
                type="text"
                name="category"
                value={editingItem.category || ""}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Appetizer, Main Course, Dessert"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                name="price"
                value={editingItem.price}
                onChange={handleEditInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="veg"
                    value="true"
                    checked={editingItem.veg === true}
                    onChange={() => setEditingItem(prev => ({ ...prev, veg: true }))}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  />
                  <span className="ml-2 inline-flex items-center gap-2 text-sm text-gray-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    Vegetarian
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="veg"
                    value="false"
                    checked={editingItem.veg === false}
                    onChange={() => setEditingItem(prev => ({ ...prev, veg: false }))}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  />
                  <span className="ml-2 inline-flex items-center gap-2 text-sm text-gray-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    Non-Vegetarian
                  </span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={editingItem.isAvailable}
                  onChange={handleEditInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Item is available for ordering</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Tracking</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  name="showQuantity"
                  checked={editingItem.showQuantity}
                  onChange={handleEditInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Track quantity available</span>
              </div>
            </div>
            {editingItem.showQuantity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Available</label>
                <input
                  type="number"
                  name="quantityAvailable"
                  value={editingItem.quantityAvailable}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  min="0"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={editingItem.description || ""}
                onChange={handleEditInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item description"
              />
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <button
              onClick={editMenuItem}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Update Item
            </button>
            <button
              onClick={() => {
                setShowEditForm(false);
                setEditingItem(null);
              }}
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
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {menuItems.map((item) => (
            <article key={item.id} className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-xl font-bold text-neutral-950">{item.name}</h3>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      item.veg ? "bg-green-50 text-green-700 ring-1 ring-green-100" : "bg-red-50 text-red-700 ring-1 ring-red-100"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${item.veg ? "bg-green-500" : "bg-red-500"}`} />
                      {item.veg ? "Veg" : "Non-Veg"}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-neutral-500">{item.category || "Uncategorized"}</p>
                </div>
                <span className="shrink-0 text-2xl font-extrabold text-neutral-950">{formatPrice(item.price)}</span>
              </div>

              {item.description && (
                <p className="mb-5 line-clamp-2 text-sm leading-6 text-neutral-600">{item.description}</p>
              )}

              {/* Quantity Display */}
              {item.showQuantity && (
                <div className="mb-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800">
                      <FiPackage className="h-4 w-4" />
                      Quantity
                    </span>
                    <label className="flex items-center gap-2">
                      <input
                        type="number"
                        value={item.quantityAvailable || 0}
                        onChange={(e) => updateQuantity(item, parseInt(e.target.value) || 0)}
                        className="h-9 w-20 rounded-md border border-blue-200 bg-white px-2 text-sm font-semibold text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        min="0"
                      />
                      <span className="text-xs font-medium text-blue-700">units</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    item.isAvailable 
                      ? "bg-green-50 text-green-700 ring-1 ring-green-100" 
                      : "bg-red-50 text-red-700 ring-1 ring-red-100"
                  }`}>
                    {item.isAvailable ? "Available" : "Out of Stock"}
                  </span>
                  {item.showQuantity && item.quantityAvailable <= 5 && item.quantityAvailable > 0 && (
                    <span className="rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700 ring-1 ring-yellow-100">
                      Low Stock
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                  <button
                    onClick={() => startEditing(item)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-neutral-200 bg-white px-3 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => toggleVegStatus(item)}
                    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      item.veg
                        ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {item.veg ? "Make Non-Veg" : "Make Veg"}
                  </button>
                  <button
                    onClick={() => toggleAvailability(item)}
                    className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      item.isAvailable
                        ? "border border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-100"
                        : "border border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <FiPower className="h-3.5 w-3.5" />
                    {item.isAvailable ? "Mark Out" : "Restock"}
                  </button>
                  <button
                    onClick={() => deleteMenuItem(item)}
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <FiTrash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
} 
