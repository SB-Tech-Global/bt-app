"use client";
import { useEffect, useState } from 'react';
import apiRequest from './utils/apiRequest';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiMapPin, FiEye } from 'react-icons/fi';

export default function BuyerList() {
  const [buyers, setBuyers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone_no: '',
    contact_person_name: '',
    contact_person_number: '',
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [drawerBuyer, setDrawerBuyer] = useState(null);
  const [addressForm, setAddressForm] = useState({
    locationName: '',
    locationCode: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [editAddressIdx, setEditAddressIdx] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState('');

  // Fetch buyers from backend
  useEffect(() => {
    apiRequest({ endpoint: '/buyers/', method: 'GET' })
      .then(res => setBuyers(res.data))
      .catch(() => setBuyers([]));
  }, []);

  const openAddModal = () => {
    setForm({ name: '', email: '', phone_no: '', contact_person_name: '', contact_person_number: '' });
    setIsEdit(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (buyer) => {
    setForm({
      name: buyer.name,
      email: buyer.email,
      phone_no: buyer.phone_no,
      contact_person_name: buyer.contact_person_name,
      contact_person_number: buyer.contact_person_number,
    });
    setIsEdit(true);
    setEditId(buyer.id);
    setShowModal(true);
  };

  const openDeleteModal = (buyer) => {
    setDeleteTarget(buyer);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (deleteTarget) {
      await apiRequest({ endpoint: `/buyers/${deleteTarget.id}/`, method: 'DELETE' });
      setBuyers(buyers.filter((b) => b.id !== deleteTarget.id));
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
        const response = await apiRequest({ endpoint: `/buyers/${editId}/`, method: 'PUT', payload: form });
        const updated = response.data;
        setBuyers(buyers.map((buyer) =>
          buyer.id === editId
            ? updated
            : buyer
        ));
      } else {
        const response = await apiRequest({ endpoint: '/buyers/', method: 'POST', payload: form });
        const created = response.data;
        setBuyers([...buyers, created]);
      }
      setShowModal(false);
      setForm({ name: '', email: '', phone_no: '', contact_person_name: '', contact_person_number: '' });
      setIsEdit(false);
      setEditId(null);
    } catch (err) {
      setError('Failed to save buyer. Please check your input or try again.');
    }
  };

  // Fetch addresses for a buyer
  const fetchAddresses = async (buyerId) => {
    try {
      const res = await apiRequest({ endpoint: `/addresses/`, method: 'GET', params: { buyer_id: buyerId } });
      return res.data;
    } catch {
      return [];
    }
  };

  // Side drawer close handler
  const closeDrawer = () => setDrawerBuyer(null);

  // Address form handlers
  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const handleAddAddressClick = () => {
    setAddressForm({ location_name: '', location_code: '', address: '', city: '', state: '', pincode: '' });
    setEditAddressIdx(null);
    setShowAddressForm(true);
  };

  const handleAddOrUpdateAddress = async () => {
    if (!drawerBuyer) return;
    if (editAddressIdx !== null) {
      // Edit address
      const addr = addresses[editAddressIdx];
      await apiRequest({ endpoint: `/addresses/${addr.id}/`, method: 'PUT', payload: addressForm });
    } else {
      // Create address
      await apiRequest({ endpoint: `/addresses/`, method: 'POST', payload: { ...addressForm, buyer: drawerBuyer.id } });
    }
    const updatedAddresses = await fetchAddresses(drawerBuyer.id);
    setAddresses(updatedAddresses); // Ensure UI updates
    setDrawerBuyer({ ...drawerBuyer, addresses: updatedAddresses });
    setAddressForm({ location_name: '', location_code: '', address: '', city: '', state: '', pincode: '' });
    setEditAddressIdx(null);
    setShowAddressForm(false);
  };

  const handleEditAddress = (idx) => {
    if (!drawerBuyer) return;
    const addr = addresses[idx];
    setAddressForm({ ...addr });
    setEditAddressIdx(idx);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (idx) => {
    if (!drawerBuyer) return;
    const addr = addresses[idx];
    await apiRequest({ endpoint: `/addresses/${addr.id}/`, method: 'DELETE' });
    const updatedAddresses = await fetchAddresses(drawerBuyer.id);
    setAddresses(updatedAddresses); // Ensure UI updates
    setDrawerBuyer({ ...drawerBuyer, addresses: updatedAddresses });
    setEditAddressIdx(null);
    setAddressForm({ location_name: '', location_code: '', address: '', city: '', state: '', pincode: '' });
    setShowAddressForm(false);
  };

  // Fetch addresses when opening drawer
  const [addresses, setAddresses] = useState([]);
  const openDrawerWithAddresses = async (buyer) => {
    const fetched = await fetchAddresses(buyer.id);
    setAddresses(fetched);
    setDrawerBuyer({ ...buyer, addresses: fetched });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Lessee's</h2>
        <button
          onClick={openAddModal}
          className="p-2 rounded-full flex items-center justify-center hover:scale-110 hover:text-blue-400 transition-all duration-150 gap-2 border border-blue-500"
          title="Add Lessee"
          aria-label="Add Lessee"
        >
          <FiPlus size={22} />
          <span className="hidden md:inline text-white font-semibold">Add Lessee</span>
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
            <h3 className="text-xl font-bold mb-4 text-white">{isEdit ? 'Edit Lessee' : 'Add Lessee'}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="text-red-400 text-sm font-semibold mb-2">{error}</div>
              )}
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone"
                name="phone_no"
                value={form.phone_no}
                onChange={handleChange}
                required
              />
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact Person Name"
                name="contact_person_name"
                value={form.contact_person_name}
                onChange={handleChange}
                required
              />
              <input
                className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contact Person Number"
                name="contact_person_number"
                value={form.contact_person_number}
                onChange={handleChange}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
              >
                {isEdit ? 'Update Lessee' : 'Add Lessee'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Confirm Delete</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to delete {deleteTarget?.name}?</p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded shadow flex-1"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded shadow flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Side Drawer for Addresses */}
      {drawerBuyer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-60">
          <div className="relative w-full max-w-2xl h-full bg-gradient-to-br from-neutral-900/90 to-blue-900/80 backdrop-blur-lg shadow-2xl p-6 md:p-10 overflow-y-auto transition-all duration-300 w-full sm:w-[95vw] md:w-[800px]">
            <button
              className="absolute top-6 right-8 text-gray-400 hover:text-white z-10"
              onClick={closeDrawer}
              aria-label="Close"
            >
              <FiX size={28} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Lessee Details</h3>
            <div className="space-y-4">
              <div>
                <span className="block text-gray-400 text-sm">Lessee Name</span>
                <span className="block text-lg text-white font-semibold">{drawerBuyer.name}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-sm">Email</span>
                <span className="block text-lg text-white font-semibold">{drawerBuyer.email}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-sm">Phone</span>
                <span className="block text-lg text-white font-semibold">{drawerBuyer.phone_no}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-sm">Contact Person</span>
                <span className="block text-lg text-white font-semibold">{drawerBuyer.contact_person_name}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-sm">Contact Person No</span>
                <span className="block text-lg text-white font-semibold">{drawerBuyer.contact_person_number}</span>
              </div>
              <div>
                <span className="block text-gray-400 text-sm">Addresses</span>
                <button
                  className="mt-2 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow"
                  onClick={handleAddAddressClick}
                  type="button"
                  disabled={showAddressForm}
                >
                  Add Address
                </button>
                {/* Address List */}
                {addresses && addresses.length > 0 ? (
                  <div className="space-y-4 mt-2">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="p-4 bg-neutral-800 rounded-lg border border-neutral-700 mb-2 flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FiMapPin className="text-blue-400" />
                            <span className="text-white font-semibold">{addr.location_name}</span>
                            <span className="text-xs text-gray-400 ml-2">({addr.location_code})</span>
                          </div>
                          <div className="text-gray-200 text-sm mb-2">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</div>
                        </div>
                        <div className="flex gap-2 ml-4 mt-1">
                          <button
                            className="p-2 rounded-full bg-transparent hover:bg-yellow-500/20 hover:text-yellow-400 transition-colors"
                            onClick={() => handleEditAddress(idx)}
                            title="Edit Address"
                            aria-label="Edit Address"
                          >
                            <FiEdit2 size={18} />
                          </button>
                          <button
                            className="p-2 rounded-full bg-transparent hover:bg-red-600/20 hover:text-red-500 transition-colors"
                            onClick={() => handleDeleteAddress(idx)}
                            title="Delete Address"
                            aria-label="Delete Address"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm mt-2">No addresses added yet.</div>
                )}
                {/* Address Form (only show when adding or editing) */}
                {showAddressForm && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-2">{editAddressIdx !== null ? 'Edit Address' : 'Add Address'}</h4>
                    <div className="grid grid-cols-1 gap-3">
                      <input
                        className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Location Name"
                        name="location_name"
                        value={addressForm.location_name}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Location Code"
                        name="location_code"
                        value={addressForm.location_code}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Address"
                        name="address"
                        value={addressForm.address}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="City"
                        name="city"
                        value={addressForm.city}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="State"
                        name="state"
                        value={addressForm.state}
                        onChange={handleAddressChange}
                        required
                      />
                      <input
                        className="rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Pincode"
                        name="pincode"
                        value={addressForm.pincode}
                        onChange={handleAddressChange}
                        required
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded shadow w-full"
                        onClick={handleAddOrUpdateAddress}
                        type="button"
                      >
                        {editAddressIdx !== null ? 'Update Address' : 'Add Address'}
                      </button>
                      <button
                        className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-2 rounded shadow w-full"
                        onClick={() => { setEditAddressIdx(null); setAddressForm({ location_name: '', location_code: '', address: '', city: '', state: '', pincode: '' }); setShowAddressForm(false); }}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Buyers Table with horizontal scroll */}
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full bg-neutral-900">
          <thead>
            <tr>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Name</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Email</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Phone</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Contact Person</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Contact Person No</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map(buyer => (
              <tr key={buyer.id} className="hover:bg-neutral-800">
                <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{buyer.name}</td>
                <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{buyer.email}</td>
                <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{buyer.phone_no}</td>
                <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{buyer.contact_person_name}</td>
                <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{buyer.contact_person_number}</td>
                <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-center">
                  <div className="flex gap-1 sm:gap-2 justify-center">
                    <button
                      onClick={() => openDrawerWithAddresses(buyer)}
                      className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-blue-400 transition-all duration-150"
                      title="View"
                      aria-label={`View ${buyer.name}`}
                    >
                      <FiEye size={16} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => openEditModal(buyer)}
                      className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-yellow-400 transition-all duration-150"
                      title="Edit"
                      aria-label={`Edit ${buyer.name}`}
                    >
                      <FiEdit2 size={16} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(buyer)}
                      className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-red-500 transition-all duration-150"
                      title="Delete"
                      aria-label={`Delete ${buyer.name}`}
                    >
                      <FiTrash2 size={16} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 