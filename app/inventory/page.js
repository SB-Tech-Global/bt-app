"use client";
import { useEffect, useState } from "react";
import { FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import apiRequest from '../../components/utils/apiRequest';
import { items } from "../../data/items";

const tabs = [
  { key: "own", label: "Own Inventory" },
  { key: "buyer", label: "Lessee's Inventory" },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState("own");
  const [selectedBuyerId, setSelectedBuyerId] = useState("");
  const [ownInventory, setOwnInventory] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [buyerInventory, setBuyerInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buyers, setBuyers] = useState([]);

  // Fetch own inventory on mount or when switching to own tab
  useEffect(() => {
    if (activeTab === "own") {
      setLoading(true);
      apiRequest({ endpoint: "http://localhost:8000/inventories/", method: "GET" })
        .then(res => setOwnInventory(res.data))
        .catch(() => setOwnInventory([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab]);

  // Fetch buyer inventory when buyer is selected
  useEffect(() => {
    if (activeTab === "buyer" && selectedBuyerId) {
      setLoading(true);
      apiRequest({ endpoint: `http://localhost:8000/inventories/`, method: "GET", params: { buyer_id: selectedBuyerId } })
        .then(res => setBuyerInventory(res.data))
        .catch(() => setBuyerInventory([]))
        .finally(() => setLoading(false));
    }
  }, [activeTab, selectedBuyerId]);

  // Fetch buyers from backend
  useEffect(() => {
    apiRequest({ endpoint: 'http://localhost:8000/buyers/', method: 'GET' })
      .then(res => setBuyers(res.data))
      .catch(() => setBuyers([]));
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-white mb-6">Inventory</h1>
      
      {/* Mobile-friendly tabs */}
      <div className="mb-6">
        <div className="flex gap-1 sm:gap-2 border-b border-neutral-700 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 sm:px-4 py-2 font-semibold text-sm rounded-t transition-colors duration-150 focus:outline-none whitespace-nowrap flex-shrink-0
                ${activeTab === tab.key ? "bg-neutral-900 text-blue-400 border-b-2 border-blue-400" : "bg-neutral-800 text-gray-300 hover:text-blue-400"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === "own" && (
          <div>
            {loading && <div className="text-gray-400">Loading...</div>}
            {error && <div className="text-red-400">{error}</div>}
            
            {/* Table container with horizontal scroll */}
            <div className="overflow-x-auto rounded-lg border border-neutral-800">
              <table className="min-w-full bg-neutral-900">
                <thead>
                  <tr>
                    <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Item Name</th>
                    <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Quantity</th>
                    <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ownInventory.length > 0 ? ownInventory.map((inv, idx) => {
                    const item = items.find((i) => i.id === inv.item);
                    const isEditing = editIdx === idx;
                    return (
                      <tr key={inv.id} className="hover:bg-neutral-800">
                        <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{inv ? inv.item_name : "Unknown"}</td>
                        <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editValue}
                              onChange={e => setEditValue(e.target.value)}
                              className="w-20 sm:w-24 rounded bg-neutral-800 text-white border border-blue-500 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            inv.quantity
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-center">
                          {isEditing ? (
                            <div className="flex gap-1 sm:gap-2 justify-center">
                              <button
                                className="p-1.5 sm:p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                                title="Save"
                                onClick={async () => {
                                  setLoading(true);
                                  setError("");
                                  try {
                                    const response = await apiRequest({ endpoint: `http://localhost:8000/inventories/${inv.id}/`, method: 'PUT', payload: { quantity: parseInt(editValue, 10) || 0 } });
                                    const updated = response.data;
                                    setOwnInventory(ownInventory.map((row, i) => i === idx ? updated : row));
                                    setEditIdx(null);
                                  } catch (err) {
                                    setError('Failed to update inventory.');
                                  } finally {
                                    setLoading(false);
                                  }
                                }}
                              >
                                <FiCheck size={14} className="sm:w-4 sm:h-4" />
                              </button>
                              <button
                                className="p-1.5 sm:p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                                title="Cancel"
                                onClick={() => setEditIdx(null)}
                              >
                                <FiX size={14} className="sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              className="p-1.5 sm:p-2 rounded-full bg-neutral-700 text-white hover:bg-blue-500"
                              title="Edit"
                              onClick={() => {
                                setEditIdx(idx);
                                setEditValue(inv.quantity);
                              }}
                            >
                              <FiEdit2 size={14} className="sm:w-4 sm:h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="3" className="px-3 sm:px-4 py-6 text-center text-gray-400">No inventory found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === "buyer" && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-200 mb-2" htmlFor="buyer-select">Select Lessee</label>
              <select
                id="buyer-select"
                className="w-full rounded bg-neutral-800 text-white border border-neutral-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
              >
                <option value="">-- Select Lessee --</option>
                {buyers.map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                ))}
              </select>
            </div>
            
            {selectedBuyerId ? (
              loading ? (
                <div className="text-gray-400">Loading...</div>
              ) : buyerInventory.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-neutral-800">
                  <table className="min-w-full bg-neutral-900">
                    <thead>
                      <tr>
                        <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Item Name</th>
                        <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buyerInventory.map((inv) => {
                        const item = items.find(i => i.id === inv.item);
                        return (
                          <tr key={inv.id} className="hover:bg-neutral-800">
                            <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{inv ? inv.item_name : "Unknown"}</td>
                            <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{inv.quantity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-gray-400">No inventory found for this Lessee.</div>
              )
            ) : (
              <div className="text-gray-400">Please select a lessee to view their inventory.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 