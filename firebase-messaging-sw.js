// Cloudflare Worker - FCM v1 Notification Sender (Single Heads-up Fixed)

const FIREBASE_PROJECT_ID = "smarthome-ad84f";
const DATABASE_URL = "https://smarthome-ad84f-default-rtdb.firebaseio.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
    }

    try {
      let body = {};
      try { body = await request.json(); } catch (e) {}

      const alertType = body.type || "default";
      const customTitle = body.title || "Nova Smart 🚨";
      const customBody = body.body || "تنبيه جديد من النظام";
      const targetUrl = "https://nvs5.github.io/NVS/index.html";

      // 1. توليد Access Token للـ Service Account
      const accessToken = await getAccessToken(env.FIREBASE_CLIENT_EMAIL, env.FIREBASE_PRIVATE_KEY);

      // 2. جلب الـ FCM Tokens من الفايربيس
      const tokensResponse = await fetch(`${DATABASE_URL}/fcm_tokens.json?access_token=${accessToken}`);
      const tokensData = await tokensResponse.json();

      if (!tokensData || tokensData.error) {
        return new Response(JSON.stringify({ error: "No tokens found or DB read failed", details: tokensData }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      const tokens = Object.values(tokensData).map(t => t.token).filter(Boolean);

      if (tokens.length === 0) {
        return new Response(JSON.stringify({ error: "No valid tokens stored" }), { 
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 3. إرسال الحمولة كـ data فقط لمنع التكرار وضمان ظهور الإشعار المنبثق
      const sendPromises = tokens.map(token => {
        return fetch(`https://fcm.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/messages:send`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: {
              token: token,
              data: {
                title: customTitle,
                body: customBody,
                type: alertType,
                url: targetUrl
              },
              android: {
                priority: "HIGH"
              },
              webpush: {
                headers: {
                  Urgency: "high"
                }
              }
            }
          })
        });
      });

      await Promise.all(sendPromises);

      return new Response(JSON.stringify({ success: true, sent_to: tokens.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};

// دالة توليد Access Token لـ Google API باستخدام JWT
async function getAccessToken(clientEmail, privateKey) {
  const cleanKey = privateKey.replace(/\\n/g, '\n');
  
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/firebase.messaging https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/firebase.database",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    await importPrivateKey(cleanKey),
    new TextEncoder().encode(signatureInput)
  );

  const jwt = `${signatureInput}.${base64url(signature)}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

function base64url(source) {
  let encoded = "";
  if (typeof source === "string") {
    encoded = btoa(unescape(encodeURIComponent(source)));
  } else {
    encoded = btoa(String.fromCharCode(...new Uint8Array(source)));
  }
  return encoded.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

async function importPrivateKey(pem) {
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = pem.substring(
    pem.indexOf(pemHeader) + pemHeader.length,
    pem.indexOf(pemFooter)
  ).replace(/\s/g, '');
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
        }
