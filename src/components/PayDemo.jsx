import React, { useState } from "react";
import { API_BASE } from "../api";

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
          amount: "300.00",
          currency: "356",
          // RU can be your React route; backend uses RU_PUBLIC as default
          ru: window.location.origin + "/payment/result",
          itemcode: "DIRECT",
          additional_info: { purpose: "Application Fee" }
        })
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Create order failed");

      // BillDesk response (decoded JWS) is expected to include:
      // data.bdorderid and data.links.rdata
      const bdorderid = data.bdorderid || data.orderid || data?.data?.bdorderid;
      const rdata = data?.links?.rdata || data?.rdata;
      if (!bdorderid || !rdata) throw new Error("Missing bdorderid/rdata in response");

      // 3) Redirect to backend "launch" (auto-submits form to embedded SDK)
      const params = new URLSearchParams({ bdorderid, rdata });
      window.location.href = `${API_BASE}/api/billdesk/launch?${params.toString()}`;
    } catch (e) {
      setError(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button onClick={payNow} disabled={busy} style={{ padding: "10px 16px" }}>
        {busy ? "Starting…" : "Pay ₹300.00"}
      </button>
      {error && <p style={{ color: "crimson" }}>{error}</p>}
    </div>
  );
}
