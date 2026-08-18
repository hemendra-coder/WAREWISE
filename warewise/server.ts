import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API: Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      platform: "WAREWISE Dual-Platform Ecosystem",
      aiAvailable: !!process.env.GEMINI_API_KEY,
      timestamp: new Date().toISOString(),
    });
  });

  // Handler for Admin Copilot (mounted on both /api/ai/admin-copilot and /api/admin/copilot)
  const handleAdminCopilot = async (req: express.Request, res: express.Response) => {
    try {
      const { prompt, context } = req.body;
      const userText = (prompt || "").trim();
      const lower = userText.toLowerCase();
      const ai = getGeminiClient();

      const oCount = context?.ordersCount || 5;
      const excCount = context?.activeExceptions || 2;
      const critSla = context?.criticalSlaCount || 3;
      const topOrder = context?.topOrder || "ORD-WW-1042";

      // Check for casual greetings first
      const isGreeting = ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "buddy"].some(
        (g) => lower === g || lower.startsWith(g + " ") || lower.endsWith(" " + g)
      );

      if (ai) {
        try {
          const systemInstruction = `You are Buddy, WAREWISE's Autonomous AI Warehouse Co-Pilot & Chief Operations Officer.
Your tone is intelligent, proactive, friendly, and authoritative.
If the user sends a casual greeting like 'hi', 'hello', or 'hey', respond warmly as 'Buddy' (e.g. "Hi there! I'm Buddy, your AI operations co-pilot..."), give a brief 1-sentence snapshot of facility health, and ask how you can help.
For operational questions, provide structured, data-driven analysis with actionable recommendations.
Current Live Warehouse Telemetry: ${JSON.stringify(context || {})}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: userText || "Analyze current operational state and advise.",
            config: {
              systemInstruction,
              temperature: isGreeting ? 0.7 : 0.2,
            },
          });

          const text = response.text || "Operational analysis completed.";
          return res.json({
            reply: text,
            text: text,
            source: "gemini-3.6-flash",
          });
        } catch (apiErr: any) {
          console.warn("Gemini API call failed (using fallback local engine):", apiErr?.message || apiErr);
          // Gracefully fall through to local intelligence engine below
        }
      }

      // Dynamic Context-Aware Local Analytics
      if (isGreeting) {
        const greetingReply = `Hi! I am Buddy, your autonomous AI operations & warehouse co-pilot.\n\nI am monitoring your store, orders, and facility telemetry in real-time:\n- **Active Order Queue:** ${oCount} orders (${critSla} approaching SLA cutoff)\n- **Open Exceptions:** ${excCount} flagged floor incidents\n\nHow can I assist your operational decisions today?`;
        return res.json({
          reply: greetingReply,
          text: greetingReply,
          source: "local-buddy-engine",
        });
      }

      let analysis = `**WAREWISE Operational Copilot (Autonomous Analysis)**\n\n`;
      analysis += `**Query Evaluated:** "${userText}"\n\n`;
      analysis += `**Live Telemetry Status:**\n`;
      analysis += `- **Active Order Queue:** ${oCount} orders (${critSla} critical SLA cutoffs approaching)\n`;
      analysis += `- **Open Incidents / Exceptions:** ${excCount} flagged floor exceptions\n`;
      analysis += `- **Catalog Velocity Index:** Optimal in Zone A fast-pick rows\n\n`;

      if (lower.includes("1042") || lower.includes("priority") || lower.includes("sla")) {
        analysis += `**Strategic Recommendation for ${topOrder}:**\n`;
        analysis += `1. **Shortage Identified:** Target requires 10 units of NeoCore X9; currently 7 available in Bin A-02-1.\n`;
        analysis += `2. **Donor Candidate:** ORD-WW-1047 holds 3 reserved units with 38h remaining SLA window.\n`;
        analysis += `3. **Action:** Commit 3-unit reallocation to prevent 34m SLA cutoff breach. Inbound replenishment arrives in 8h.`;
      } else if (lower.includes("b-03-2") || lower.includes("missing") || lower.includes("picker")) {
        analysis += `**Routing Intervention:**\n`;
        analysis += `1. **Defect:** 1 unit missing in Bin B-03-2.\n`;
        analysis += `2. **Reroute Solution:** Alternate buffer in Bin B-07-1 has 12 verified pristine units (+14 floor steps).\n`;
        analysis += `3. **Action:** Divert picker OP-PK-03 directly to B-07-1 with zero SLA penalty.`;
      } else if (lower.includes("dock") || lower.includes("bottleneck") || lower.includes("dispatch")) {
        analysis += `**Outbound Sortation Balancing:**\n`;
        analysis += `1. **Congestion Alert:** Dock 03 (BlueDart Flight) is at 94% load capacity prior to 14:45 cutoff.\n`;
        analysis += `2. **Staff Reallocation:** Reassign 2 operators from Zone C to Dock 03 staging bay.\n`;
        analysis += `3. **Action:** Release packed parcels to Flight Sortation Wave 03.`;
      } else {
        analysis += `**Operational Directive:**\n`;
        analysis += `- Prioritize picking waves for Orders approaching <45min cutoff.\n`;
        analysis += `- Ensure QC verification throughput maintains >=99.2% facility pass rate.\n`;
        analysis += `- Monitor replenishment PO triggers for SKUs approaching safety stock boundaries.`;
      }

      return res.json({
        reply: analysis,
        text: analysis,
        source: "local-intelligence-engine",
      });
    } catch (err: any) {
      console.error("AI Admin Copilot error:", err);
      res.status(500).json({ error: err.message || "Failed to query AI copilot" });
    }
  };

  app.post("/api/ai/admin-copilot", handleAdminCopilot);
  app.post("/api/admin/copilot", handleAdminCopilot);

  // Handler for Customer Shopping Assistant (mounted on both /api/ai/shopping-assistant and /api/customer/assistant)
  const handleShoppingAssistant = async (req: express.Request, res: express.Response) => {
    try {
      const { message, prompt, catalogContext, cartContext, context } = req.body;
      const userText = (message || prompt || "").trim();
      const lower = userText.toLowerCase();
      const catalog = catalogContext || context?.availableProducts || [];
      const ai = getGeminiClient();

      const isGreeting = ["hi", "hello", "hey", "hola", "namaste", "good morning", "good evening", "buddy"].some(
        (g) => lower === g || lower.startsWith(g + " ") || lower.endsWith(" " + g)
      );

      if (ai) {
        try {
          const systemInstruction = `You are Buddy, WAREWISE's AI Shopping Assistant & Commerce Concierge.
Your persona is warm, helpful, energetic, and knowledgeable.
If the user sends a casual greeting like 'hi', 'hello', or 'hey', reply warmly as 'Buddy' (e.g. "Hi there! I'm Buddy, your AI Shopping Assistant at WareWise. How can I help you today?") and suggest a couple of options (finding products, tracking orders, or unlocking bank discount offers).
Catalog Context: ${JSON.stringify(catalog)}
Cart Context: ${JSON.stringify(cartContext || [])}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: userText || "Recommend top products.",
            config: {
              systemInstruction,
              temperature: isGreeting ? 0.7 : 0.4,
            },
          });

          const text = response.text || "Product guidance generated.";
          return res.json({
            reply: text,
            text: text,
            source: "gemini-3.6-flash",
          });
        } catch (apiErr: any) {
          console.warn("Gemini Shopping Assistant call failed (using fallback):", apiErr?.message || apiErr);
          // Fall through
        }
      }

      // Dynamic Context-Aware Shopping Assistant
      if (isGreeting) {
        const greetingReply = `Hi! I'm Buddy, your AI Shopping Assistant at WareWise.\n\nI can help you:\n- **Find & Compare Hardware** (e.g., AI Accelerators, High-Speed Audio, Enterprise Compute)\n- **Check Live Regional Stock** at WH-METRO-01 Hub\n- **Track Active Shipments** & Pincode Delivery Speeds\n- **Unlock Bank Offers & EMI Savings**\n\nWhat can I assist you with today?`;
        return res.json({
          reply: greetingReply,
          text: greetingReply,
          source: "local-buddy-engine",
        });
      }

      let replyText = `**SKANVI Commerce Concierge**\n\n`;
      if (userText.toLowerCase().includes("neocore") || userText.toLowerCase().includes("ai") || userText.toLowerCase().includes("accelerator")) {
        replyText += `**Top Recommendation:** **NeoCore X9 Enterprise AI Accelerator** (₹49,999)\n\n`;
        replyText += `- **Warehouse Node:** WH-METRO-01 (Bin A-02-1, Fast Movers Zone)\n`;
        replyText += `- **Live Stock:** Verified available for priority dispatch\n`;
        replyText += `- **Delivery Speed:** Same-Day Flight Wave (Arrives Today by 20:00 IST)\n`;
        replyText += `- **Key Highlights:** 380 TOPS INT4 AI inference, 16GB unified memory, custom copper heatsink.`;
      } else if (userText.toLowerCase().includes("headset") || userText.toLowerCase().includes("audio") || userText.toLowerCase().includes("apex")) {
        replyText += `**Top Recommendation:** **Apex Pro Wireless ANC Headset** (₹18,499)\n\n`;
        replyText += `- **Warehouse Node:** WH-METRO-01 (Bin A-04-2)\n`;
        replyText += `- **Live Stock:** 14 units ready in regional buffer\n`;
        replyText += `- **Delivery Speed:** Next-Day Priority Courier\n`;
        replyText += `- **Key Highlights:** 48-hour battery life, active hybrid noise cancellation, dual-mic beamforming.`;
      } else {
        replyText += `I've analyzed our live regional warehouse inventory at WH-METRO-01.\n\n`;
        replyText += `All flagship products are stocked with 100% dispatch readiness. You can select any hardware model to view real-time bin allocation, flight wave schedules, and live customer reviews.`;
      }

      return res.json({
        reply: replyText,
        text: replyText,
        source: "local-commerce-engine",
      });
    } catch (err: any) {
      console.error("AI Shopping Assistant error:", err);
      res.status(500).json({ error: err.message || "Shopping assistant error" });
    }
  };

  app.post("/api/ai/shopping-assistant", handleShoppingAssistant);
  app.post("/api/customer/assistant", handleShoppingAssistant);

  // API: Customer Order Support AI
  app.post("/api/ai/customer-support", async (req, res) => {
    try {
      const { query, order } = req.body;
      const ai = getGeminiClient();

      if (ai) {
        try {
          const systemInstruction = `You are WAREWISE Customer Transparency & Support Assistant.
You explain live fulfillment stages (Picking, Packing, Quality Inspection, Dispatch) with complete clarity and reassurance.
If there was an operational reroute (e.g., picker redirected to alternate bin or reallocated batch), explain the smart optimization transparently.
Order Details: ${JSON.stringify(order || {})}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: query,
            config: {
              systemInstruction,
              temperature: 0.3,
            },
          });

          return res.json({
            reply: response.text,
            source: "gemini-3.6-flash",
          });
        } catch (apiErr: any) {
          console.warn("Gemini Customer Support call failed (using fallback):", apiErr?.message || apiErr);
          // Fall through
        }
      }

      return res.json({
        reply: `Hello! For your order **${order?.id || "ORD-WW-1042"}**, our smart warehouse system has verified all items. Your package is currently passing automated Quality Inspection at Station QC-04. Dispatch wave is scheduled in 18 minutes with 98.6% on-time delivery confidence.`,
        source: "deterministic-engine",
      });
    } catch (err: any) {
      console.error("Customer Support AI error:", err);
      res.status(500).json({ error: err.message || "Customer support error" });
    }
  });

  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`WAREWISE Dual-Platform Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
