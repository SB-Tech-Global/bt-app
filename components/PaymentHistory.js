import { useEffect, useState } from "react";
import apiRequest from "./utils/apiRequest";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiRequest({ endpoint: 'http://localhost:8000/payment-receipts/', method: 'GET' })
      .then(res => {
        setPayments(res.data);
        setLoading(false);
      })
      .catch(() => {
        setPayments([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-6 text-white">Payment History</h1>
      {loading ? (
        <div className="text-gray-300">Loading...</div>
      ) : payments.length === 0 ? (
        <div className="text-gray-400">No payments found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-neutral-800">
          <table className="min-w-full bg-neutral-900">
            <thead>
              <tr>
                <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Invoice #</th>
                <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Amount</th>
                <th className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-gray-200 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-neutral-800">
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{payment.record_id}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">₹{Number(payment.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td className="px-3 sm:px-4 py-2 border-b border-neutral-800 text-white">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 