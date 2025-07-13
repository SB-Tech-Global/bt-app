"use client";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { parseISO, isAfter, isBefore, isEqual, subMonths, format } from "date-fns";
import apiRequest from "./utils/apiRequest";
import { FiCreditCard } from 'react-icons/fi';

export default function DashboardSummary() {
  const [fromDate, setFromDate] = useState(format(subMonths(new Date(), 1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [counts, setCounts] = useState({ buyers: 0, items: 0, records: 0 });
  const [loading, setLoading] = useState(true);
  const [saleStats, setSaleStats] = useState({ total_sales: 0, payment_pending: 0 });
  const [saleLoading, setSaleLoading] = useState(true);
  const [buyersWithPending, setBuyersWithPending] = useState([]);
  const [buyersLoading, setBuyersLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBuyer, setPaymentBuyer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRecordId, setPaymentRecordId] = useState('');
  const [buyerInvoices, setBuyerInvoices] = useState([]);
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    setLoading(true);
    apiRequest({ endpoint: 'http://localhost:8000/dashboard-count/', method: 'GET' })
      .then(res => {
        setCounts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setCounts({ buyers: 0, items: 0, records: 0 });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!fromDate || !toDate) return;
    setSaleLoading(true);
    apiRequest({ endpoint: 'http://localhost:8000/sales-payment/', method: 'GET', params: { start_date: fromDate, end_date: toDate } })
      .then(res => {
        setSaleStats(res.data);
        setSaleLoading(false);
      })
      .catch(() => {
        setSaleStats({ total_sales: 0, payment_pending: 0 });
        setSaleLoading(false);
      });
  }, [fromDate, toDate]);

  useEffect(() => {
    setBuyersLoading(true);
    apiRequest({ endpoint: 'http://localhost:8000/dashboard-buyer-list/', method: 'GET' })
      .then(res => {
        setBuyersWithPending(res.data || []);
        setBuyersLoading(false);
      })
      .catch(() => {
        setBuyersWithPending([]);
        setBuyersLoading(false);
      });
  }, []);

  function isWithinRange(recordDate) {
    if (!fromDate && !toDate) return true;
    const date = parseISO(recordDate);
    if (fromDate && toDate) {
      return (
        (isAfter(date, parseISO(fromDate)) || isEqual(date, parseISO(fromDate))) &&
        (isBefore(date, parseISO(toDate)) || isEqual(date, parseISO(toDate)))
      );
    }
    if (fromDate) return isAfter(date, parseISO(fromDate)) || isEqual(date, parseISO(fromDate));
    if (toDate) return isBefore(date, parseISO(toDate)) || isEqual(date, parseISO(toDate));
    return true;
  }

  function getFilteredRecords() {
    return records.filter(record => isWithinRange(record.date));
  }

  const handleUpdatePayment = (buyer) => {
    setPaymentBuyer(buyer);
    setPaymentAmount('');
    setPaymentRecordId('');
    setPaymentError('');
    // Fetch unpaid invoices for this buyer
    apiRequest({ endpoint: 'http://localhost:8000/records/', method: 'GET', params: { buyer_id: buyer.id, inv_status: 'unpaid', transaction_type:'return' } })
      .then(res => setBuyerInvoices(res.data))
      .catch(() => setBuyerInvoices([]));
    setShowPaymentModal(true);
  };

  return (
    <>
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">From:</span>
          <Input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="bg-white text-black"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold">To:</span>
          <Input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="bg-white text-black"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-white">{loading ? '...' : counts.buyers}</span>
          <span className="text-gray-200 mt-2">Total Lessee's</span>
        </div>
        <div className="bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-white">{loading ? '...' : counts.items}</span>
          <span className="text-gray-200 mt-2">Total Items</span>
        </div>
        <div className="bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-white">{loading ? '...' : counts.records}</span>
          <span className="text-gray-200 mt-2">Total Records</span>
        </div>
        <div className="bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-white">₹{saleLoading ? '...' : Number(saleStats.total_sales).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span className="text-gray-200 mt-2">Total Sales</span>
        </div>
        <div className="bg-neutral-900 rounded-lg shadow p-6 flex flex-col items-center">
          <span className="text-3xl font-bold text-white">₹{saleLoading ? '...' : Number(saleStats.payment_pending).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          <span className="text-gray-200 mt-2">Pending Payments</span>
        </div>
      </div>
      {buyersWithPending.length > 0 && (
        <div className="bg-neutral-900 rounded-lg shadow p-6 mb-8">
          <h4 className="text-lg font-semibold text-white mb-4">Pending Payments by Lessee</h4>
          {buyersLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <ul className="divide-y divide-neutral-800">
              {buyersWithPending.map(buyer => (
                <li key={buyer.id} className="flex justify-between items-center py-2 gap-2">
                  <span className="text-white">{buyer.name}</span>
                  <span className="text-red-400 font-bold">₹{Number(buyer.pending_amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  <button
                    className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow text-sm font-semibold ml-2"
                    onClick={() => handleUpdatePayment(buyer)}
                  >
                    <FiCreditCard className="inline-block" />
                    Update Payment
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-60">
          <div className="bg-neutral-900 rounded-lg shadow-lg p-8 w-full max-w-md border border-blue-900">
            <h3 className="text-xl font-bold mb-4 text-white">Update Payment for {paymentBuyer?.name}</h3>
            <div className="mb-4">
              <label className="block text-blue-200 mb-1">Invoice</label>
              <select
                value={paymentRecordId}
                onChange={e => setPaymentRecordId(e.target.value)}
                className="w-full border border-blue-700 rounded px-3 py-2 bg-neutral-800 text-white"
              >
                <option value="">Select Invoice</option>
                {buyerInvoices.map(inv => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.id} - ₹{Number(inv.total).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-blue-200 mb-1">Amount</label>
              <input
                type="number"
                min="1"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                className="w-full border border-blue-700 rounded px-3 py-2 bg-neutral-800 text-white"
              />
            </div>
            {paymentError && <div className="text-red-400 mb-2">{paymentError}</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-neutral-700 text-white rounded hover:bg-neutral-800"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={async () => {
                  setPaymentError('');
                  if (!paymentRecordId || !paymentAmount) {
                    setPaymentError('Please select an invoice and enter an amount.');
                    return;
                  }
                  try {
                    await apiRequest({
                      endpoint: `http://localhost:8000/update-payment/${paymentRecordId}/`,
                      method: 'POST',
                      payload: { amount: paymentAmount }
                    });
                    setShowPaymentModal(false);
                    // Refresh buyersWithPending and saleStats
                    setBuyersLoading(true);
                    apiRequest({ endpoint: 'http://localhost:8000/dashboard-buyer-list/', method: 'GET' })
                      .then(res => {
                        setBuyersWithPending(res.data || []);
                        setBuyersLoading(false);
                      })
                      .catch(() => {
                        setBuyersWithPending([]);
                        setBuyersLoading(false);
                      });
                    setSaleLoading(true);
                    apiRequest({ endpoint: 'http://localhost:8000/sales-payment/', method: 'GET', params: { start_date: fromDate, end_date: toDate } })
                      .then(res => {
                        setSaleStats(res.data);
                        setSaleLoading(false);
                      })
                      .catch(() => {
                        setSaleStats({ total_sales: 0, payment_pending: 0 });
                        setSaleLoading(false);
                      });
                  } catch (err) {
                    setPaymentError(err?.response?.data?.error || 'Failed to update payment.');
                  }
                }}
              >
                Submit Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 