"use client";
import { useEffect, useState } from 'react';
import apiRequest from './utils/apiRequest';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiEye } from 'react-icons/fi';

const transactionTypes = [
  { value: 'Item on Rent', label: 'Item on Rent' },
  { value: 'Return', label: 'Return' },
];

export default function RecordList() {
  const [records, setRecords] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    buyerId: '',
    addressIdx: '',
    transactionType: 'Sale',
    lineItems: [
      { itemId: '', quantity: '', price: '', gst: '', cess: '' },
    ],
    created_for_date: new Date().toISOString().slice(0, 10),
    days: '',
  });
  const [error, setError] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [items, setItems] = useState([]);
  const [addresses, setAddresses] = useState([]);

  const getBuyerName = (id) => {
    const buyer = buyers.find(b => b.id === id);
    return buyer ? buyer.name : 'Unknown';
  };

  // For current dummy data: calculate amount as item price × quantity
  // Transaction amount calculation removed since price is no longer available
  // If you want to show amount, update logic to use new data structure

  const handleAdd = () => {
    setIsEditMode(false);
    setForm({
      buyerId: '',
      addressIdx: '',
      transactionType: 'Sale',
      lineItems: [
        { itemId: '', quantity: '', price: '', gst: '', cess: '' },
      ],
      created_for_date: new Date().toISOString().slice(0, 10),
      days: '',
    });
    setShowModal(true);
  };

  const handleView = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setSelectedRecord(record);
    setForm({
      buyerId: record.buyer?.toString() || '',
      addressIdx: record.buyer_address?.toString() || '',
      transactionType: record.transaction_type === 'return' ? 'Return' : 'Item on Rent',
      lineItems: record.line_items?.map(li => ({
        itemId: li.item?.toString() || '',
        quantity: li.quantity?.toString() || '',
        price: li.price?.toString() || '',
        gst: li.gst?.toString() || '',
        cess: li.cess?.toString() || '',
      })) || [{ itemId: '', quantity: '', price: '', gst: '', cess: '' }],
      created_for_date: record.created_for_date || new Date().toISOString().slice(0, 10),
      days: record.days || '',
    });
    setShowModal(true);
    
    // Load addresses for the buyer when editing
    if (record.buyer) {
      apiRequest({ endpoint: 'http://localhost:8000/addresses/', method: 'GET', params: { buyer_id: record.buyer } })
        .then(res => setAddresses(res.data))
        .catch(() => setAddresses([]));
    }
  };

  const handleDelete = async (record) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await apiRequest({ 
          endpoint: `http://localhost:8000/records/${record.id}/`, 
          method: 'DELETE' 
        });
        setRecords(records.filter(r => r.id !== record.id));
      } catch (err) {
        alert('Failed to delete record');
      }
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'buyerId') {
      setForm(f => ({ ...f, addressIdx: '' })); // Reset address if buyer changes
      if (e.target.value) {
        apiRequest({ endpoint: 'http://localhost:8000/addresses/', method: 'GET', params: { buyer_id: e.target.value } })
          .then(res => setAddresses(res.data))
          .catch(() => setAddresses([]));
      } else {
        setAddresses([]);
      }
    }
  };

  const handleLineItemChange = (idx, field, value) => {
    setForm(f => {
      const newLineItems = f.lineItems.map((li, i) =>
        i === idx ? { ...li, [field]: value } : li
      );
      return { ...f, lineItems: newLineItems };
    });
  };

  // When item is selected, do not autofill price/gst/cess; leave them blank for manual entry
  const handleItemSelect = (idx, itemId) => {
    setForm(f => {
      const newLineItems = f.lineItems.map((li, i) =>
        i === idx
          ? { ...li, itemId } // only update itemId, leave price/gst/cess untouched
          : li
      );
      return { ...f, lineItems: newLineItems };
    });
  };

  const handleAddLineItem = () => {
    setForm(f => ({ ...f, lineItems: [...f.lineItems, { itemId: '', quantity: '', price: '', gst: '', cess: '' }] }));
  };

  const handleRemoveLineItem = (idx) => {
    setForm(f => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Prepare payload for backend
      const payload = {
        buyer: parseInt(form.buyerId),
        buyer_address: form.addressIdx ? parseInt(form.addressIdx) : null,
        transaction_type: form.transactionType === 'Return' ? 'return' : 'rent',
        line_items: form.lineItems.map(li => ({
          item: parseInt(li.itemId),
          quantity: parseInt(li.quantity),
          price: li.price,
          gst: li.gst,
          cess: li.cess,
        })),
        created_for_date: form.created_for_date,
        days: parseInt(form.days) || 0,
      };

      if (isEditMode) {
        // Update existing record
        const response = await apiRequest({ 
          endpoint: `http://localhost:8000/records/${selectedRecord.id}/`, 
          method: 'PUT', 
          payload 
        });
        const updated = response.data;
        setRecords(records.map(r => r.id === selectedRecord.id ? updated : r));
      } else {
        // Create new record
        const response = await apiRequest({ endpoint: 'http://localhost:8000/records/', method: 'POST', payload });
        const created = response.data;
        setRecords([created, ...records]);
      }

      setShowModal(false);
      setIsEditMode(false);
      setSelectedRecord(null);
      setForm({ buyerId: '', addressIdx: '', transactionType: 'Sale', lineItems: [{ itemId: '', quantity: '', price: '', gst: '', cess: '' }], days: '' });
    } catch (err) {
      setError('Failed to save record. Please check your input or try again.');
    }
  };

  // Fetch records from backend
  useEffect(() => {
    apiRequest({ endpoint: 'http://localhost:8000/records/', method: 'GET' })
      .then(res => setRecords(res.data))
      .catch(() => setRecords([]));
  }, []);

  // Fetch buyers and items only when add record modal is opened
  useEffect(() => {
    if (showModal) {
      apiRequest({ endpoint: 'http://localhost:8000/buyers/', method: 'GET' })
        .then(res => setBuyers(res.data))
        .catch(() => setBuyers([]));
      apiRequest({ endpoint: 'http://localhost:8000/items/', method: 'GET' })
        .then(res => setItems(res.data))
        .catch(() => setItems([]));
    }
  }, [showModal]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Records</h2>
        <button
          onClick={handleAdd}
          className="p-2 rounded-full flex items-center justify-center hover:scale-110 hover:text-blue-400 transition-all duration-150 gap-2 border border-blue-500"
          title="Add Record"
          aria-label="Add Record"
        >
          <FiPlus size={22} />
          <span className="hidden md:inline text-white font-semibold">Add Record</span>
        </button>
      </div>
      
      {/* Add Record Side Drawer */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-60">
          <div className="relative w-full max-w-4xl h-full bg-gradient-to-br from-neutral-900/90 to-blue-900/80 backdrop-blur-lg shadow-2xl p-4 md:p-10 overflow-y-auto transition-all duration-300 w-full sm:w-[95vw] md:w-[800px]">
            <button
              className="absolute top-6 right-8 text-gray-400 hover:text-white z-10"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <FiX size={28} />
            </button>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 text-white tracking-tight">
              {isEditMode ? 'Edit Record' : 'Add Record'}
            </h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
              {error && (
                <div className="text-red-400 text-sm font-semibold mb-2">{error}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <div>
                  <label className="block text-gray-200 mb-1" htmlFor="buyerId">Buyer</label>
                  <select
                    id="buyerId"
                    name="buyerId"
                    value={form.buyerId}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Buyer --</option>
                    {buyers.map(buyer => (
                      <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-200 mb-1" htmlFor="addressIdx">Buyer Address</label>
                  <select
                    id="addressIdx"
                    name="addressIdx"
                    value={form.addressIdx}
                    onChange={handleFormChange}
                    required
                    disabled={!form.buyerId}
                    className="w-full rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select Address --</option>
                    {addresses.map((addr, idx) => (
                      <option key={addr.id} value={addr.id}>{addr.location_name} ({addr.location_code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-200 mb-1" htmlFor="transactionType">Transaction Type</label>
                  <select
                    id="transactionType"
                    name="transactionType"
                    value={form.transactionType}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {transactionTypes.map(tt => (
                      <option key={tt.value} value={tt.value}>{tt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label htmlFor="created_for_date" className="block text-gray-200 mb-1">Date</label>
                    <input
                      id="created_for_date"
                      name="created_for_date"
                      type="date"
                      value={form.created_for_date}
                      onChange={handleFormChange}
                      required
                      className="w-full rounded bg-white text-black border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {form.transactionType === 'Return' && (
                    <div className="flex-1">
                      <label htmlFor="days" className="block text-gray-200 mb-1 hidden md:block">Days</label>
                      <input
                        id="days"
                        name="days"
                        type="number"
                        min="1"
                        value={form.days}
                        onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
                        placeholder="Days"
                        className="w-32 rounded bg-white text-black border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-neutral-800/70 rounded-xl p-3 md:p-6 border border-blue-900 shadow-inner">
                <label className="block text-base md:text-lg font-semibold text-blue-300 mb-3 md:mb-4">Line Items</label>
                <div className="overflow-x-auto w-full">
                  <table className="min-w-[600px] w-full bg-neutral-900/80 rounded-lg text-xs md:text-sm">
                    <thead>
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-blue-200">Item</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Quantity</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Price</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">GST %</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Cess</th>
                        <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Total</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.lineItems.map((li, idx) => {
                        const price = parseFloat(li.price) || 0;
                        const gst = parseFloat(li.gst) || 0;
                        const cess = parseFloat(li.cess) || 0;
                        const quantity = parseFloat(li.quantity) || 0;
                        const lineTotal = (price + (price * gst / 100) + (price * cess / 100)) * quantity;
                        return (
                          <tr key={idx} className="bg-neutral-900/60">
                            <td className="px-2 py-1 md:px-3 md:py-2">
                              <select
                                value={li.itemId}
                                onChange={e => handleItemSelect(idx, e.target.value)}
                                required
                                className="rounded bg-neutral-800 text-white border border-neutral-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[100px] md:min-w-[120px]"
                              >
                                <option value="">-- Select Item --</option>
                                {items.map(item => (
                                  <option key={item.id} value={item.id}>{item.item_name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-1 md:px-3 md:py-2 text-right">
                              <input
                                type="number"
                                min="1"
                                value={li.quantity}
                                onChange={e => handleLineItemChange(idx, 'quantity', e.target.value)}
                                required
                                placeholder="Qty"
                                className="w-12 md:w-16 rounded bg-neutral-800 text-white border border-neutral-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-2 py-1 md:px-3 md:py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                value={li.price}
                                onChange={e => handleLineItemChange(idx, 'price', e.target.value)}
                                required
                                placeholder="Price"
                                className="w-14 md:w-20 rounded bg-neutral-800 text-white border border-neutral-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-2 py-1 md:px-3 md:py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                value={li.gst}
                                onChange={e => handleLineItemChange(idx, 'gst', e.target.value)}
                                required
                                placeholder="GST %"
                                className="w-10 md:w-14 rounded bg-neutral-800 text-white border border-neutral-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-2 py-1 md:px-3 md:py-2 text-right">
                              <input
                                type="number"
                                min="0"
                                value={li.cess}
                                onChange={e => handleLineItemChange(idx, 'cess', e.target.value)}
                                required
                                placeholder="Cess"
                                className="w-10 md:w-14 rounded bg-neutral-800 text-white border border-neutral-700 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                              />
                            </td>
                            <td className="px-2 py-1 md:px-3 md:py-2 text-right text-blue-300 font-semibold">
                              ₹{lineTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-2 py-1 md:px-3 md:py-2 text-center">
                              {form.lineItems.length > 1 && (
                                <button
                                  type="button"
                                  className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => handleRemoveLineItem(idx)}
                                  title="Remove Line Item"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="mt-4 flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm font-semibold"
                    onClick={handleAddLineItem}
                  >
                    <FiPlus /> Add Line Item
                  </button>
                  {/* Grand Total */}
                  <div className="flex justify-end mt-6">
                    <div className="bg-blue-900/80 rounded-lg px-8 py-4 text-xl font-bold text-blue-200 shadow border border-blue-700">
                      Grand Total: ₹{
                        form.lineItems.reduce((sum, li) => {
                          const price = parseFloat(li.price) || 0;
                          const gst = parseFloat(li.gst) || 0;
                          const cess = parseFloat(li.cess) || 0;
                          const quantity = parseFloat(li.quantity) || 0;
                          const lineTotal = (price + (price * gst / 100) + (price * cess / 100)) * quantity;
                          return sum + lineTotal;
                        }, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                      }
                    </div>
                  </div>
                  {form.transactionType === 'Return' && form.days && (
                    <div className="flex justify-end mt-2">
                      <div className="bg-blue-900/80 rounded-lg px-8 py-2 text-lg font-bold text-blue-200 shadow border border-blue-700">
                        Grand Total × Days: ₹{
                          (form.lineItems.reduce((sum, li) => {
                            const price = parseFloat(li.price) || 0;
                            const gst = parseFloat(li.gst) || 0;
                            const cess = parseFloat(li.cess) || 0;
                            const quantity = parseFloat(li.quantity) || 0;
                            const lineTotal = (price + (price * gst / 100) + (price * cess / 100)) * quantity;
                            return sum + lineTotal;
                          }, 0) * parseInt(form.days)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                        }
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg text-lg tracking-wide"
                >
                  {isEditMode ? 'Update Record' : 'Add Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
          <div className="relative w-full max-w-2xl h-full bg-gradient-to-br from-neutral-900/90 to-blue-900/80 backdrop-blur-lg shadow-2xl p-6 md:p-10 overflow-y-auto transition-all duration-300 w-full sm:w-[95vw] md:w-[800px]">
            <button
              className="absolute top-6 right-8 text-gray-400 hover:text-white z-10"
              onClick={() => setShowViewModal(false)}
              aria-label="Close"
            >
              <FiX size={28} />
            </button>
            <h3 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 text-white tracking-tight">
              Record Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <p className="text-gray-200 font-semibold">Buyer:</p>
                <p className="text-white">{selectedRecord.buyer_name}</p>
              </div>
              <div>
                <p className="text-gray-200 font-semibold">Buyer Address:</p>
                <p className="text-white">{selectedRecord.buyer_address_name}</p>
              </div>
              <div>
                <p className="text-gray-200 font-semibold">Transaction Type:</p>
                <p className="text-white">{selectedRecord.transaction_type === 'return' ? 'Return' : 'Item on Rent'}</p>
              </div>
              <div>
                <p className="text-gray-200 font-semibold">Date:</p>
                <p className="text-white">{selectedRecord.created_for_date}</p>
              </div>
              {selectedRecord.transaction_type === 'return' && (
                <div>
                  <p className="text-gray-200 font-semibold">Days:</p>
                  <p className="text-white">{selectedRecord.days}</p>
                </div>
              )}
              <div>
                <p className="text-gray-200 font-semibold">Total Amount:</p>
                <p className="text-white">₹{selectedRecord.line_items ? 
                  selectedRecord.line_items.reduce((sum, li) => {
                    const price = parseFloat(li.price) || 0;
                    const gst = parseFloat(li.gst) || 0;
                    const cess = parseFloat(li.cess) || 0;
                    const quantity = parseFloat(li.quantity) || 0;
                    const lineTotal = (price + (price * gst / 100) + (price * cess / 100)) * quantity;
                    return sum + lineTotal;
                  }, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</p>
              </div>
              {selectedRecord.transaction_type === 'return' && selectedRecord.days && (
                <div>
                  <p className="text-gray-200 font-semibold">Grand Total × Days:</p>
                  <p className="text-white">₹{selectedRecord.line_items ? 
                    (selectedRecord.line_items.reduce((sum, li) => {
                      const price = parseFloat(li.price) || 0;
                      const gst = parseFloat(li.gst) || 0;
                      const cess = parseFloat(li.cess) || 0;
                      const quantity = parseFloat(li.quantity) || 0;
                      const lineTotal = (price + (price * gst / 100) + (price * cess / 100)) * quantity;
                      return sum + lineTotal;
                    }, 0) * parseInt(selectedRecord.days)).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '0.00'}</p>
                </div>
              )}
            </div>
            <div className="mt-6 bg-neutral-800/70 rounded-xl p-3 md:p-6 border border-blue-900 shadow-inner">
              <label className="block text-base md:text-lg font-semibold text-blue-300 mb-3 md:mb-4">Line Items</label>
              <div className="overflow-x-auto w-full">
                <table className="min-w-[600px] w-full bg-neutral-900/80 rounded-lg text-xs md:text-sm">
                  <thead>
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-blue-200">Item</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Quantity</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Price</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">GST %</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Cess</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-blue-200">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.line_items?.map((li, idx) => {
                      const price = parseFloat(li.price) || 0;
                      const gst = parseFloat(li.gst) || 0;
                      const cess = parseFloat(li.cess) || 0;
                      const quantity = parseFloat(li.quantity) || 0;
                      const lineTotal = (price + (price * gst / 100) + (price * cess / 100)) * quantity;
                      return (
                        <tr key={idx} className="bg-neutral-900/60">
                          <td className="px-2 py-1 md:px-3 md:py-2 text-left text-xs text-white">{li.item_name}</td>
                          <td className="px-2 py-1 md:px-3 md:py-2 text-right text-xs text-white">{li.quantity}</td>
                          <td className="px-2 py-1 md:px-3 md:py-2 text-right text-xs text-white">₹{price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td className="px-2 py-1 md:px-3 md:py-2 text-right text-xs text-white">{gst}%</td>
                          <td className="px-2 py-1 md:px-3 md:py-2 text-right text-xs text-white">₹{cess.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                          <td className="px-2 py-1 md:px-3 md:py-2 text-right text-xs text-white">₹{lineTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg text-lg tracking-wide"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Records Table with horizontal scroll */}
      <div className="overflow-x-auto rounded-lg border border-neutral-800">
        <table className="min-w-full bg-neutral-900">
          <thead>
            <tr>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Invoice ID</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Lessee</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Location</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Transaction Type</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Date</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Total Amount</th>
              <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map(record => {
              return (
                <tr key={record.id} className="hover:bg-neutral-800">
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{record.id}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{record.buyer_name}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{record.buyer_address_name}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{record.transaction_type}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{record.created_for_date}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">₹{record.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-center">
                    <div className="flex gap-1 sm:gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(record)}
                        className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-yellow-400 transition-all duration-150"
                        title="Edit"
                        aria-label={`Edit record #${record.id}`}
                      >
                        <FiEdit2 size={16} className="sm:w-4 sm:h-4" />
                      </button>
                      <button
                        onClick={() => handleView(record)}
                        className="p-1.5 sm:p-2 rounded-full inline-flex items-center justify-center hover:scale-110 hover:text-blue-400 transition-all duration-150"
                        title="View"
                        aria-label={`View record #${record.id}`}
                      >
                        <FiEye size={16} className="sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
} 