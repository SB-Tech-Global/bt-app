"use client";
import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import apiRequest from './utils/apiRequest';

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    item_name: '',
    item_code: '',
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [error, setError] = useState('');

  // Fetch items from backend
  useEffect(() => {
    apiRequest({ endpoint: '/items/', method: 'GET' })
      .then(response => setItems(response.data))
      .catch(() => setItems([]));
  }, []);

  const openAddModal = () => {
    setForm({ item_name: '', item_code: '' });
    setIsEdit(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setForm({
      item_name: item.item_name,
      item_code: item.item_code,
    });
    setIsEdit(true);
    setEditId(item.id);
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setDeleteTarget(item);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await apiRequest({ endpoint: `/items/${deleteTarget.id}/`, method: 'DELETE' });
      setItems(items.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      setShowDeleteModal(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        const response = await apiRequest({ endpoint: `/items/${editId}/`, method: 'PUT', payload: form });
        const updated = response.data;
        setItems(items.map((item) =>
          item.id === editId
            ? updated
            : item
        ));
      } else {
        const response = await apiRequest({ endpoint: '/items/', method: 'POST', payload: form });
        const created = response.data;
        setItems([...items, created]);
      }
      setShowModal(false);
      setForm({ item_name: '', item_code: '' });
      setIsEdit(false);
      setEditId(null);
    } catch (err) {
      setError('Failed to save item. Please check your input or try again.');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Items</h2>
        <button
          onClick={openAddModal}
          className="p-2 rounded-full flex items-center justify-center hover:scale-110 hover:text-blue-400 transition-all duration-150 gap-2 border border-blue-500"
          title="Add Item"
          aria-label="Add Item"
        >
          <FiPlus size={22} />
          <span className="hidden md:inline text-white font-semibold">Add Item</span>
        </button>
      </div>
      
      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FiX size={22} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">{isEdit ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="text-red-400 text-sm font-semibold mb-2">{error}</div>
              )}
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Name"
                name="item_name"
                type="text"
                value={form.item_name}
                onChange={handleChange}
                required
              />
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Item Code"
                name="item_code"
                type="text"
                value={form.item_code}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
              >
                {isEdit ? 'Update Item' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowDeleteModal(false)}
              aria-label="Close"
            >
              <FiX size={22} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-white">Delete Item</h3>
            <p className="text-gray-200 mb-6">Are you sure you want to delete <span className="font-semibold text-red-400">{deleteTarget.item_name}</span>?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-700 text-gray-200 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 font-semibold shadow"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Items Table with horizontal scroll */}
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full bg-neutral-900">
          <thead>
            <tr>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Name</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Code</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map(item => (
                <tr key={item.id} className="hover:bg-neutral-800">
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{item.item_name}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{item.item_code}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-center">
                    <div className="flex gap-1 sm:gap-2 justify-center">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-yellow-400 transition-all duration-150"
                        title="Edit"
                        aria-label={`Edit ${item.item_name}`}
                      >
                        <FiEdit2 size={16} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-red-500 transition-all duration-150"
                        title="Delete"
                        aria-label={`Delete ${item.item_name}`}
                      >
                        <FiTrash2 size={16} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="px-3 sm:px-4 py-6 text-center text-gray-400">No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 