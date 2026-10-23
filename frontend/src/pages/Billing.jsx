import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import {
  FiCheck,
  FiZap,
  FiShield,
  FiClock,
  FiCreditCard,
  FiArrowRight,
  FiTrendingUp,
  FiHelpCircle,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiStar,
} from "react-icons/fi";
import { GiCoins } from "react-icons/gi";
import Sidebar from "../components/Sidebar";
import api from "../utils/axios";
import {
  getBillingPlans,
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getRazorpayKey,
} from "../apis/billing.api";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { ThemeToggle } from "../context/ThemeContext";

export default function Billing({ user, setUser }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);
  const [toast, setToast] = useState(null);
  const [razorpayConfig, setRazorpayConfig] = useState({ isConfigured: false, key: null });

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.get("/api/auth/logout");
    } catch (e) {
      console.error(e);
    } finally {
      try {
        await signOut(auth);
      } catch (e) {}
      setUser(null);
      navigate("/");
    }
  };

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, historyRes, keyRes] = await Promise.all([
        getBillingPlans(),
        getPaymentHistory(),
        getRazorpayKey(),
      ]);

      if (plansRes.success) setPlans(plansRes.plans);
      if (historyRes.success) setPayments(historyRes.payments);
      if (keyRes.success) setRazorpayConfig(keyRes);
    } catch (err) {
      console.error("Error loading billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePurchase = async (plan) => {
    if (!user) {
      showToast("error", "Please sign in to your account to purchase coin packs.");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      const orderRes = await createOrder(plan.id);
      if (!orderRes.success) {
        showToast("error", orderRes.message || "Failed to initialize order");
        setProcessingPlanId(null);
        return;
      }

      // Check if simulated mode is triggered (development or missing Razorpay key)
      if (orderRes.isSimulated || !orderRes.key) {
        // Run simulated verification
        const verifyRes = await verifyPayment({
          razorpay_order_id: orderRes.order.id,
          isSimulated: true,
          planId: plan.id,
        });

        if (verifyRes.success) {
          showToast(
            "success",
            `Success! ${plan.coins} coins credited to your wallet (Dev Test Mode).`
          );
          if (verifyRes.newBalance !== undefined && verifyRes.newBalance !== null) {
            setUser((prev) => ({
              ...prev,
              interviewCoin: verifyRes.newBalance,
              interviewCoins: verifyRes.newBalance,
            }));
          } else {
            setUser((prev) => ({
              ...prev,
              interviewCoin: (prev?.interviewCoin || 0) + plan.coins,
              interviewCoins: (prev?.interviewCoins || 0) + plan.coins,
            }));
          }
          fetchData();
        } else {
          showToast("error", verifyRes.message || "Payment verification failed");
        }
        setProcessingPlanId(null);
        return;
      }

      // Real Razorpay Checkout flow
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast("error", "Failed to load Razorpay SDK. Please check your network connection.");
        setProcessingPlanId(null);
        return;
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.order.amount,
        currency: orderRes.order.currency,
        name: "InterviewPrep AI",
        description: `${plan.name} - ${plan.coins} Coins Top-Up`,
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id,
            });

            if (verifyRes.success) {
              showToast("success", `Payment Verified! ${plan.coins} coins added.`);
              if (verifyRes.newBalance !== undefined && verifyRes.newBalance !== null) {
                setUser((prev) => ({
                  ...prev,
                  interviewCoin: verifyRes.newBalance,
                  interviewCoins: verifyRes.newBalance,
                }));
              } else {
                setUser((prev) => ({
                  ...prev,
                  interviewCoin: (prev?.interviewCoin || 0) + plan.coins,
                  interviewCoins: (prev?.interviewCoins || 0) + plan.coins,
                }));
              }
              fetchData();
            } else {
              showToast("error", verifyRes.message || "Payment verification failed");
            }
          } catch (e) {
            console.error("Verification error:", e);
            showToast("error", "Error verifying payment signature");
          } finally {
            setProcessingPlanId(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            setProcessingPlanId(null);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (resp) {
        showToast("error", resp.error?.description || "Payment failed at bank gateway");
        setProcessingPlanId(null);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error("Purchase error:", err);
      showToast("error", err.message || "Unexpected error occurred during checkout");
      setProcessingPlanId(null);
    }
  };

  const currentCoins = user?.interviewCoin ?? user?.interviewCoins ?? 150;

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--cream)",
        color: "var(--ink)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* Sidebar */}
      <Sidebar
        user={user}
        onNewInterview={() => navigate("/interview")}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          marginLeft: sidebarOpen ? 250 : 64,
          transition: "margin-left 0.22s ease-in-out",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            height: 58,
            borderBottom: "1px solid var(--rule)",
            background: "var(--white)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--stone)",
              }}
            >
              BILLING & CREDITS
            </span>
            <span style={{ color: "var(--rule)" }}>/</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
              Coin Top-Ups & Subscription
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Coins Balance Badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                background: "var(--amber-bg)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                borderRadius: 9999,
              }}
            >
              <GiCoins size={16} color="var(--amber)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                {currentCoins}
              </span>
              <span style={{ fontSize: 11, color: "var(--stone)", fontWeight: 500 }}>
                Available Coins
              </span>
            </div>

            <ThemeToggle />
          </div>
        </header>

        {/* Toast Alert */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: "fixed",
                top: 70,
                right: 24,
                zIndex: 999,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                borderRadius: 12,
                background: toast.type === "success" ? "#065F46" : "#991B1B",
                color: "#FFFFFF",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {toast.type === "success" ? (
                <FiCheckCircle size={18} />
              ) : (
                <FiAlertCircle size={18} />
              )}
              <span>{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Body Content */}
        <main style={{ padding: "32px 36px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          {/* Hero Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'Space Grotesk', monospace",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 9999,
                  background: "var(--indigo-bg)",
                  color: "var(--indigo)",
                  border: "1px solid rgba(79, 70, 229, 0.2)",
                }}
              >
                PAY-AS-YOU-GO MONETIZATION
              </span>
              {!razorpayConfig.isConfigured && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    padding: "4px 10px",
                    borderRadius: 9999,
                    background: "rgba(245, 158, 11, 0.15)",
                    color: "var(--amber)",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  ⚡ Sandbox Simulation Active
                </span>
              )}
            </div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: "0 0 10px 0",
                color: "var(--ink)",
              }}
            >
              Choose Your Practice Plan
            </h1>
            <p style={{ fontSize: 14, color: "var(--stone)", margin: 0, maxWidth: 680, lineHeight: 1.6 }}>
              Top up interview coins to unlock real-time voice interviews, AI coding evaluations,
              custom ATS resume scoring, and autonomous roadmap generation.
            </p>
          </div>

          {/* Economy Highlights Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--rule)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--indigo-bg)",
                  color: "var(--indigo)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiZap size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>50 Coins</div>
                <div style={{ fontSize: 12, color: "var(--stone)" }}>Per Full-Length AI Mock Interview</div>
              </div>
            </div>

            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--rule)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--emerald-bg)",
                  color: "var(--emerald)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiShield size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>30 Coins</div>
                <div style={{ fontSize: 12, color: "var(--stone)" }}>Deep ATS Resume & GitHub Audit</div>
              </div>
            </div>

            <div
              style={{
                background: "var(--white)",
                border: "1px solid var(--rule)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: "var(--amber-bg)",
                  color: "var(--amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiClock size={20} />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)" }}>20 Coins</div>
                <div style={{ fontSize: 12, color: "var(--stone)" }}>Multi-Agent Career Roadmap</div>
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
              gap: 24,
              marginBottom: 48,
            }}
          >
            {plans.map((plan) => {
              const isPopular = plan.popular;
              const isProcessing = processingPlanId === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "var(--white)",
                    borderRadius: 18,
                    border: isPopular
                      ? "2px solid var(--indigo)"
                      : "1px solid var(--rule)",
                    padding: "32px 28px",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    boxShadow: isPopular
                      ? "0 12px 36px rgba(79, 70, 229, 0.12)"
                      : "0 4px 16px rgba(0, 0, 0, 0.03)",
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      style={{
                        position: "absolute",
                        top: -12,
                        right: 24,
                        padding: "4px 12px",
                        borderRadius: 9999,
                        background: isPopular ? "var(--indigo)" : "var(--stone)",
                        color: "#FFFFFF",
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        boxShadow: isPopular
                          ? "0 4px 12px rgba(79, 70, 229, 0.3)"
                          : "none",
                      }}
                    >
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan Name & Tagline */}
                  <div style={{ marginBottom: 18 }}>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "var(--ink)",
                        margin: "0 0 6px 0",
                      }}
                    >
                      {plan.name}
                    </h3>
                    <p style={{ fontSize: 12, color: "var(--stone)", margin: 0, minHeight: 36 }}>
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 4,
                      marginBottom: 20,
                      paddingBottom: 20,
                      borderBottom: "1px solid var(--rule)",
                    }}
                  >
                    <span style={{ fontSize: 16, fontWeight: 600, color: "var(--stone)" }}>₹</span>
                    <span
                      style={{
                        fontSize: 36,
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        color: "var(--ink)",
                      }}
                    >
                      {plan.price}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--stone)", marginLeft: 6 }}>
                      / one-time
                    </span>
                  </div>

                  {/* Coins included badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 12px",
                      background: "var(--amber-bg)",
                      borderRadius: 10,
                      marginBottom: 24,
                      border: "1px solid rgba(245, 158, 11, 0.25)",
                    }}
                  >
                    <GiCoins size={16} color="var(--amber)" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                      {plan.coins} Coins
                    </span>
                    <span style={{ fontSize: 11, color: "var(--stone)" }}>added immediately</span>
                  </div>

                  {/* Features list */}
                  <div style={{ flex: 1, marginBottom: 28 }}>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                      {plan.features.map((feat, idx) => (
                        <li
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 10,
                            fontSize: 13,
                            color: "var(--ink)",
                            lineHeight: 1.4,
                          }}
                        >
                          <FiCheck
                            size={16}
                            color={isPopular ? "var(--indigo)" : "var(--emerald)"}
                            style={{ flexShrink: 0, marginTop: 2 }}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Buy Button */}
                  <button
                    disabled={isProcessing}
                    onClick={() => handlePurchase(plan)}
                    className={isPopular ? "btn-primary" : "btn-secondary"}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "12px 18px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: isProcessing ? "not-allowed" : "pointer",
                      opacity: isProcessing ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <FiRefreshCw className="animate-spin" size={14} />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Get {plan.coins} Coins</span>
                        <FiArrowRight size={14} />
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Payment History Section */}
          <div
            style={{
              background: "var(--white)",
              borderRadius: 18,
              border: "1px solid var(--rule)",
              padding: "28px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px 0" }}>
                  Transaction Ledger
                </h3>
                <p style={{ fontSize: 12, color: "var(--stone)", margin: 0 }}>
                  Review your recent Razorpay coin orders and payment verifications.
                </p>
              </div>

              <button
                onClick={fetchData}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 8,
                  border: "1px solid var(--rule)",
                  background: "transparent",
                  color: "var(--stone)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                <FiRefreshCw size={12} />
                <span>Refresh</span>
              </button>
            </div>

            {payments.length === 0 ? (
              <div
                style={{
                  padding: "40px 20px",
                  textAlign: "center",
                  color: "var(--stone)",
                  fontSize: 13,
                }}
              >
                <FiCreditCard size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ margin: 0 }}>No payment transactions found on this account yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: "1px solid var(--rule)",
                        textAlign: "left",
                        color: "var(--stone)",
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      <th style={{ padding: "10px 12px" }}>Order ID</th>
                      <th style={{ padding: "10px 12px" }}>Plan</th>
                      <th style={{ padding: "10px 12px" }}>Coins</th>
                      <th style={{ padding: "10px 12px" }}>Amount</th>
                      <th style={{ padding: "10px 12px" }}>Status</th>
                      <th style={{ padding: "10px 12px" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const isCompleted = p.status === "completed";
                      return (
                        <tr
                          key={p._id || p.orderId}
                          style={{
                            borderBottom: "1px solid var(--rule)",
                            color: "var(--ink)",
                          }}
                        >
                          <td style={{ padding: "12px", fontFamily: "monospace", fontSize: 12 }}>
                            {p.orderId}
                          </td>
                          <td style={{ padding: "12px", fontWeight: 600 }}>{p.planName}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                color: "var(--amber)",
                                fontWeight: 700,
                              }}
                            >
                              <GiCoins size={14} /> +{p.coins}
                            </span>
                          </td>
                          <td style={{ padding: "12px", fontWeight: 600 }}>₹{p.amount}</td>
                          <td style={{ padding: "12px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 9999,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                background: isCompleted
                                  ? "var(--emerald-bg)"
                                  : "var(--amber-bg)",
                                color: isCompleted
                                  ? "var(--emerald)"
                                  : "var(--amber)",
                              }}
                            >
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: "var(--stone)", fontSize: 12 }}>
                            {new Date(p.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
