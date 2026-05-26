// Incident Heatmap — Leaflet map on analytics.html.
// 1. Loads reports from Supabase. Plots any with latitude/longitude as colored markers.
// 2. "Auto-locate" button: for each report missing coords, asks Gemini to extract
//    the location text, geocodes via free OpenStreetMap Nominatim, saves the
//    result, and drops the marker on the map live.
(function () {
  const SEVERITY_COLORS = {
    1: "#9ca3af", // info / gray
    2: "#60a5fa", // low / blue
    3: "#f59e0b", // medium / amber
    4: "#ef4444", // high / red
    5: "#7c1d6f", // critical / deep magenta
  };
  const DEFAULT_CENTER = [3.1390, 101.6869]; // Kuala Lumpur, Malaysia — DHL hub area
  const DEFAULT_ZOOM = 6;

  function init() {
    const mapEl = document.getElementById("incident-map");
    if (!mapEl || !window.L) return;

    const summary  = document.getElementById("heatmap-summary");
    const feedback = document.getElementById("heatmap-feedback");
    const toggle   = document.getElementById("heatmap-toggle-mode");
    const autoBtn  = document.getElementById("heatmap-autolocate");
    const seedBtn  = document.getElementById("heatmap-seed-demo");

    // Realistic DHL Malaysia hub cities — used by the demo seed button to give
    // older text-only reports plausible coordinates so the heatmap demo isn't empty.
    const DEMO_HUBS = [
      { name: "Kuala Lumpur, Malaysia",  lat: 3.1390,  lng: 101.6869 },
      { name: "Petaling Jaya, Malaysia", lat: 3.1073,  lng: 101.6068 },
      { name: "Shah Alam, Malaysia",     lat: 3.0738,  lng: 101.5183 },
      { name: "Klang, Malaysia",         lat: 3.0449,  lng: 101.4455 },
      { name: "Penang, Malaysia",        lat: 5.4141,  lng: 100.3288 },
      { name: "Ipoh, Malaysia",          lat: 4.5975,  lng: 101.0901 },
      { name: "Johor Bahru, Malaysia",   lat: 1.4927,  lng: 103.7414 },
      { name: "Melaka, Malaysia",        lat: 2.1896,  lng: 102.2501 },
      { name: "Kuching, Malaysia",       lat: 1.5535,  lng: 110.3592 },
      { name: "Kota Kinabalu, Malaysia", lat: 5.9804,  lng: 116.0735 },
    ];

    if (!supabaseClient) {
      summary.textContent = "Map needs Supabase to load reports.";
      autoBtn.disabled = true;
      toggle.disabled = true;
      return;
    }

    const map = L.map(mapEl).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    let heatLayer = null;
    let mode = "markers"; // or "heatmap"
    let allReports = [];

    function severityColor(sev) {
      return SEVERITY_COLORS[Number(sev) || 3] || SEVERITY_COLORS[3];
    }

    function popupHtml(r) {
      const sev = Number(r.severity) || null;
      const cat = r.category || "—";
      const where = r.location_text || "Unknown location";
      const title = (r.title || "Untitled report").replace(/[<>]/g, "");
      const reason = (r.triage_reason || "").replace(/[<>]/g, "");
      return `
        <div style="font-family:Manrope,sans-serif;min-width:200px">
          <div style="font-weight:700;font-size:0.95rem;margin-bottom:4px">${title}</div>
          <div style="font-size:0.8rem;color:#6b7280">${where}</div>
          <div style="margin-top:6px;font-size:0.8rem">
            <strong>Category:</strong> ${cat}<br>
            <strong>Severity:</strong> ${sev ? "S" + sev : "—"}
          </div>
          ${reason ? `<div style="margin-top:6px;font-size:0.78rem;color:#374151">${reason}</div>` : ""}
        </div>
      `;
    }

    function plotMarker(r) {
      if (r.latitude == null || r.longitude == null) return;
      const marker = L.circleMarker([r.latitude, r.longitude], {
        radius: 6 + (Number(r.severity) || 3),
        color: severityColor(r.severity),
        weight: 2,
        fillColor: severityColor(r.severity),
        fillOpacity: 0.55,
      }).bindPopup(popupHtml(r));
      marker.addTo(markersLayer);
      return marker;
    }

    function rebuildHeat() {
      if (heatLayer) { map.removeLayer(heatLayer); heatLayer = null; }
      const points = allReports
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => [r.latitude, r.longitude, (Number(r.severity) || 3) / 5]);
      if (window.L.heatLayer && points.length) {
        heatLayer = L.heatLayer(points, { radius: 30, blur: 22, maxZoom: 12 });
      }
    }

    function applyMode() {
      if (mode === "markers") {
        if (heatLayer && map.hasLayer(heatLayer)) map.removeLayer(heatLayer);
        if (!map.hasLayer(markersLayer)) markersLayer.addTo(map);
        toggle.textContent = "Switch to heatmap";
      } else {
        if (map.hasLayer(markersLayer)) map.removeLayer(markersLayer);
        rebuildHeat();
        if (heatLayer) heatLayer.addTo(map);
        toggle.textContent = "Switch to markers";
      }
    }

    function fitToMarkers() {
      const pts = allReports
        .filter((r) => r.latitude != null && r.longitude != null)
        .map((r) => [r.latitude, r.longitude]);
      if (pts.length >= 2) {
        map.fitBounds(pts, { padding: [30, 30], maxZoom: 10 });
      } else if (pts.length === 1) {
        map.setView(pts[0], 10);
      }
    }

    function updateSummary() {
      const located = allReports.filter((r) => r.latitude != null && r.longitude != null).length;
      const total = allReports.length;
      summary.textContent = total
        ? `${located} of ${total} reports placed on the map.`
        : "No reports yet.";
      autoBtn.disabled = (total - located) === 0;
      autoBtn.textContent = (total - located) === 0
        ? "✅ All reports located"
        : `🪄 Auto-locate ${total - located} report${total - located === 1 ? "" : "s"}`;
    }

    async function loadReports() {
      const { data, error } = await supabaseClient
        .from("reports")
        .select("id, title, description, explanation, extracted_text, category, severity, triage_reason, latitude, longitude, location_text")
        .order("created_at", { ascending: false })
        .limit(500);

      if (error) {
        if (/column .* does not exist/i.test(error.message || "")) {
          summary.textContent = "Run sql/add_reports_location_columns.sql in Supabase first.";
        } else {
          summary.textContent = "Could not load reports: " + error.message;
        }
        autoBtn.disabled = true;
        return;
      }
      allReports = data || [];
      markersLayer.clearLayers();
      allReports.forEach(plotMarker);
      updateSummary();
      fitToMarkers();
    }

    toggle.addEventListener("click", () => {
      mode = mode === "markers" ? "heatmap" : "markers";
      applyMode();
    });

    // ---- Auto-locate workflow ----------------------------------------------
    async function extractLocation(report) {
      const text = [report.title, report.description, report.explanation, report.extracted_text]
        .filter(Boolean).join("\n\n").slice(0, 2500);
      if (!text.trim()) return null;
      const prompt = `Extract the most likely city and country mentioned in the report below. Return ONLY a JSON object exactly like:
{"location": "Dhaka, Bangladesh"}
If no place is mentioned, return {"location": null}. Do not add commentary.

REPORT:
${text}`;
      const raw = await window.callBackendAi(prompt);
      const m = raw.match(/\{[\s\S]*\}/);
      if (!m) return null;
      try {
        const parsed = JSON.parse(m[0]);
        return parsed.location || null;
      } catch { return null; }
    }

    async function geocode(placeText) {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeText)}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return null;
      const arr = await res.json();
      if (!Array.isArray(arr) || !arr.length) return null;
      const lat = parseFloat(arr[0].lat);
      const lon = parseFloat(arr[0].lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
      return { lat, lon };
    }

    async function locateOne(report) {
      let placeText = report.location_text;
      if (!placeText) {
        placeText = await extractLocation(report);
        if (!placeText) return { ok: false, reason: "no location in text" };
      }
      // Respect Nominatim's ~1 req/sec policy.
      await new Promise((r) => setTimeout(r, 1100));
      const coords = await geocode(placeText);
      if (!coords) return { ok: false, reason: `couldn't geocode "${placeText}"` };

      const { error } = await supabaseClient.from("reports")
        .update({ location_text: placeText, latitude: coords.lat, longitude: coords.lon })
        .eq("id", report.id);
      if (error) return { ok: false, reason: error.message };

      report.location_text = placeText;
      report.latitude = coords.lat;
      report.longitude = coords.lon;
      plotMarker(report);
      return { ok: true };
    }

    seedBtn.addEventListener("click", async () => {
      const targets = allReports.filter((r) => r.latitude == null || r.longitude == null);
      if (!targets.length) { feedback.textContent = "All reports already located."; return; }
      if (!confirm(`This will assign random demo locations (DHL Malaysia hubs) to ${targets.length} unlocated report${targets.length === 1 ? "" : "s"}. Continue?`)) return;

      seedBtn.disabled = true;
      autoBtn.disabled = true;
      let done = 0, failed = 0;
      for (let i = 0; i < targets.length; i++) {
        const r = targets[i];
        // Add a small jitter (~3km) so multiple reports in the same hub don't overlap perfectly.
        const hub = DEMO_HUBS[Math.floor(Math.random() * DEMO_HUBS.length)];
        const jitterLat = (Math.random() - 0.5) * 0.06;
        const jitterLng = (Math.random() - 0.5) * 0.06;
        const lat = hub.lat + jitterLat;
        const lng = hub.lng + jitterLng;

        feedback.textContent = `Seeding ${i + 1} of ${targets.length}… → ${hub.name}`;
        const { error } = await supabaseClient.from("reports")
          .update({ location_text: hub.name, latitude: lat, longitude: lng })
          .eq("id", r.id);
        if (error) {
          failed++;
          console.warn("[heatmap] seed update failed:", error);
        } else {
          r.location_text = hub.name;
          r.latitude = lat;
          r.longitude = lng;
          plotMarker(r);
          done++;
        }
        updateSummary();
      }
      feedback.textContent = `Demo seed done — placed ${done}, failed ${failed}.`;
      fitToMarkers();
      if (mode === "heatmap") applyMode();
      seedBtn.disabled = false;
      autoBtn.disabled = false;
    });

    autoBtn.addEventListener("click", async () => {
      const targets = allReports.filter((r) => r.latitude == null || r.longitude == null);
      if (!targets.length) { feedback.textContent = "All reports already located."; return; }
      if (typeof window.callBackendAi !== "function") {
        feedback.textContent = "AI is not configured — can't auto-locate.";
        return;
      }
      autoBtn.disabled = true;
      let done = 0, skipped = 0;
      for (const r of targets) {
        feedback.textContent = `Locating ${done + skipped + 1} of ${targets.length}… (${r.title || "untitled"})`;
        try {
          const result = await locateOne(r);
          if (result.ok) done++; else skipped++;
        } catch (e) {
          skipped++;
          console.warn("[heatmap] locate failed:", e);
        }
        updateSummary();
      }
      feedback.textContent = `Done — located ${done}, skipped ${skipped}.`;
      fitToMarkers();
      if (mode === "heatmap") applyMode(); // refresh heat layer
      autoBtn.disabled = false;
    });

    loadReports();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
