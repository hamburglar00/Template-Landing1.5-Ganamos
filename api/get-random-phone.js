// /api/get-random-phone.js
export default async function handler(req, res) {
  /************ CONFIG POR LANDING ************/
  const AGENCIES = [
    { id: "TU_AGENCY_ID", name: "NAME" }, // Escribir número sin comillas "".
    // { id: "OTRA_AGENCY_ID", name: "OtraAgency" },
  ];

  const BRAND_NAME = "NAME";       // ← Escribir Nombre 
  const FALLBACK_PHONE = "549";    // ← Telefono de fallback
  /*******************************************/

  const mode = String(req.query.mode || "normal").toLowerCase();

  try {
    // 1️⃣ Elegimos agency al azar
    const agency = AGENCIES[Math.floor(Math.random() * AGENCIES.length)];
    if (!agency?.id) throw new Error("No hay agencies configuradas");

    const API_URL = `https://api.asesadmin.com/api/v1/agency/${agency.id}/random-contact`;

    const response = await fetch(API_URL, {
      headers: { "Cache-Control": "no-store" },
    });

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}`);
    }

    const data = await response.json();

    // 2️⃣ Elegimos lista según modo
    const list =
      mode === "ads"
        ? (data?.ads?.whatsapp || [])
        : (data?.whatsapp || []);

    if (!Array.isArray(list) || list.length === 0) {
      throw new Error(`No hay números disponibles para mode=${mode}`);
    }

    // 3️⃣ Elegimos número al azar
    let phone = String(list[Math.floor(Math.random() * list.length)] || "")
      .replace(/\D+/g, "");

    // Normalización AR básica
    if (phone.length === 10) phone = "54" + phone;
    if (!phone || phone.length < 8) throw new Error("Número inválido");

    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).json({
      number: phone,
      name: mode === "ads" ? `${BRAND_NAME}_ADS` : BRAND_NAME, // si querés, lo hacemos también fijo
      weight: 1,
      mode,
      agency_id: agency.id,
    });
  } catch (err) {
    res.setHeader("Cache-Control", "no-store, max-age=0");

    return res.status(200).json({
      number: String(FALLBACK_PHONE).replace(/\D+/g, ""),
      name: "Fallback",
      weight: 1,
      mode,
      fallback: true,
      error: err?.message || "unknown_error",
    });
  }
}
