import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaRupeeSign, FaSpinner } from "react-icons/fa";
import { API_BASE, RU } from "../api";

// Adjust to your env (e.g., import from config)
// export const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:4000";

export default function PayDemo() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function payNow() {
    setBusy(true); setError("");
    try {
      // 1) Create a unique Order ID (normally from your backend)
      const orderid = "PU" + Math.random().toString(36).slice(2, 12).toUpperCase();

      // 2) Create Order (server-to-server via our Express API)
      const resp = await fetch(`${API_BASE}/billdesk/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orderid,
          amount: "1.00",
          currency: "356", // INR (numeric ISO 4217 for BillDesk V2)
          ru: `${RU}` + "/api/payment/callback",
          itemcode: "DIRECT",
          additional_info: { purpose: "Application Fee" }
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Create order failed");

      const bdorderid = data.bdorderid || data.orderid || data?.data?.bdorderid;

      // Be tolerant to both shapes: top-level rdata or inside links[]
      const rdataFromLinksArray = Array.isArray(data?.links)
        ? (data.links.find(l => l?.parameters?.rdata)?.parameters?.rdata)
        : undefined;
      const rdata = data?.rdata || rdataFromLinksArray;

      if (!bdorderid || !rdata) throw new Error("Missing bdorderid/rdata in response");

      // 3) Redirect to backend "launch" (auto-submits form to embedded SDK)
      const params = new URLSearchParams({ bdorderid, rdata });
      // NOTE: path aligned with backend below (no extra /api prefix)
      window.location.href = `${API_BASE}/billdesk/launch?${params.toString()}`;
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 sm:mt-8">
      {/* <motion.button
        onClick={payNow}
        disabled={busy}
        whileHover={!busy ? { scale: 1.03, boxShadow: '0 0 30px rgba(34,197,94,0.8)' } : {}}
        whileTap={!busy ? { scale: 0.97 } : {}}
        className={`w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 ${
          busy ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        {busy ? (
          <>
            <FaSpinner className="text-xl sm:text-2xl animate-spin" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <FaRupeeSign className="text-xl sm:text-2xl" />
            <span>Pay 50.00</span>
          </>
        )}
      </motion.button> */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-sm sm:text-base mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          ⚠️ {error}
        </motion.p>
      )}
    </div>
  );
}
