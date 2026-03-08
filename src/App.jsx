import { useState, useEffect, useRef, useCallback } from "react";

// ─── DATA ────────────────────────────────────────────────────────────────────

const PROGRAMS = [
  { id: "chase_ur",   name: "Chase Ultimate Rewards",    abbr: "Chase UR",   logo: "✦", cpp: 0.020 },
  { id: "amex_mr",    name: "Amex Membership Rewards",   abbr: "Amex MR",    logo: "◈", cpp: 0.018 },
  { id: "citi_ty",    name: "Citi ThankYou",             abbr: "Citi TY",    logo: "◉", cpp: 0.017 },
  { id: "capital_v",  name: "Capital One Venture",       abbr: "Cap1",       logo: "◇", cpp: 0.017 },
  { id: "united",     name: "United MileagePlus",        abbr: "United",     logo: "✈", cpp: 0.012 },
  { id: "delta",      name: "Delta SkyMiles",            abbr: "Delta",      logo: "△", cpp: 0.011 },
  { id: "american",   name: "American AAdvantage",       abbr: "AA",         logo: "★", cpp: 0.015 },
  { id: "southwest",  name: "Southwest Rapid Rewards",   abbr: "SW",         logo: "♦", cpp: 0.015 },
  { id: "alaska",     name: "Alaska Mileage Plan",       abbr: "Alaska",     logo: "❄", cpp: 0.018 },
  { id: "british",    name: "British Airways Avios",     abbr: "Avios",      logo: "◆", cpp: 0.013 },
  { id: "singapore",  name: "Singapore KrisFlyer",       abbr: "Krisflyer",  logo: "⬡", cpp: 0.018 },
  { id: "virgin",     name: "Virgin Atlantic Flying Club", abbr: "Virgin",   logo: "✺", cpp: 0.015 },
  { id: "hyatt",      name: "World of Hyatt",            abbr: "Hyatt",      logo: "▲", cpp: 0.017 },
  { id: "hilton",     name: "Hilton Honors",             abbr: "Hilton",     logo: "◑", cpp: 0.005 },
  { id: "marriott",   name: "Marriott Bonvoy",           abbr: "Bonvoy",     logo: "◐", cpp: 0.008 },
  { id: "hoteltonight", name: "HotelTonight HT Perks",  abbr: "HotelTonight", logo: "⬢", cpp: 0.010 },
  { id: "booking",    name: "Booking.com Genius",        abbr: "Booking.com", logo: "◎", cpp: 0.008 },
];

const QUICK_PROMPTS = [
  "What's my portfolio worth right now?",
  "Best way to fly business class to Tokyo?",
  "Any transfer bonuses I should know about?",
  "How should I book a flight to Europe with what I have?",
  "Which of my points are expiring or at risk?",
  "What's the best redemption I could make today?",
];

const STORAGE_KEY = "meridian_points_v1";
const HISTORY_KEY = "meridian_history_v1";
const CARDS_KEY   = "meridian_cards_v1";

const CARDS = [
  // ── CHASE ──
  { id: "csp",    name: "Sapphire Preferred",      issuer: "Chase",   abbr: "CSP",    logo: "✦", program: "chase_ur", af: 95,   earn: "3x dining/streaming, 2x travel, 1x else", sub: "60k–80k UR bonus" },
  { id: "csr",    name: "Sapphire Reserve",         issuer: "Chase",   abbr: "CSR",    logo: "✦", program: "chase_ur", af: 550,  earn: "10x hotels/car via portal, 3x travel/dining", sub: "60k UR + $300 travel credit" },
  { id: "cfu",    name: "Freedom Unlimited",        issuer: "Chase",   abbr: "CFU",    logo: "✦", program: "chase_ur", af: 0,    earn: "1.5x everything, 3x dining/drugstore", sub: "No annual fee, pairs w/ Sapphire" },
  { id: "cff",    name: "Freedom Flex",             issuer: "Chase",   abbr: "CFF",    logo: "✦", program: "chase_ur", af: 0,    earn: "5x rotating categories, 3x dining/drugstore", sub: "No annual fee, pairs w/ Sapphire" },
  { id: "ink_pref","name": "Ink Business Preferred","issuer": "Chase","abbr":"Ink Pref","logo":"✦",program:"chase_ur",af:95,    earn: "3x travel/shipping/ads/phone (up to $150k)", sub: "100k UR signup bonus" },
  { id: "ink_cash","name": "Ink Business Cash",     issuer: "Chase",   abbr: "Ink Cash",logo:"✦", program: "chase_ur", af: 0,    earn: "5x office/internet/phone, 2x gas/dining", sub: "No annual fee" },
  // ── AMEX ──
  { id: "amex_plat","name": "Platinum Card",        issuer: "Amex",    abbr: "Plat",   logo: "◈", program: "amex_mr", af: 695,  earn: "5x flights booked direct/Amex Travel, 1x else", sub: "80k–150k MR + $1,500+ credits" },
  { id: "amex_gold","name": "Gold Card",            issuer: "Amex",    abbr: "Gold",   logo: "◈", program: "amex_mr", af: 250,  earn: "4x dining/US supermarkets, 3x flights", sub: "60k–90k MR + dining credits" },
  { id: "amex_green","name":"Green Card",           issuer: "Amex",    abbr: "Green",  logo: "◈", program: "amex_mr", af: 150,  earn: "3x travel/transit/dining", sub: "40k MR signup" },
  { id: "amex_biz_plat","name":"Business Platinum", issuer:"Amex",    abbr:"Biz Plat", logo:"◈",  program: "amex_mr", af: 695,  earn: "5x flights/hotels via Amex Travel, 1.5x on $5k+ purchases", sub: "120k–250k MR bonus" },
  { id: "amex_biz_gold","name":"Business Gold",     issuer:"Amex",    abbr:"Biz Gold", logo:"◈",  program: "amex_mr", af: 375,  earn: "4x on top 2 categories each month", sub: "70k–150k MR bonus" },
  // ── CITI ──
  { id: "citi_premier","name":"Premier Card",       issuer: "Citi",    abbr: "Premier",logo: "◉", program: "citi_ty", af: 95,   earn: "3x hotels/air/restaurants/groceries/gas", sub: "60k TY pts signup" },
  { id: "citi_prestige","name":"Prestige Card",     issuer: "Citi",    abbr: "Prestige",logo:"◉", program: "citi_ty", af: 495,  earn: "5x air/dining, 3x hotels/cruises", sub: "No longer available to new applicants" },
  // ── CAPITAL ONE ──
  { id: "c1_venturex","name":"Venture X",           issuer:"Capital One",abbr:"Vtx",   logo: "◇", program: "capital_v", af: 395, earn: "10x hotels/car via C1 Travel, 5x flights, 2x else", sub: "75k miles + $300 travel credit" },
  { id: "c1_venture", "name":"Venture Rewards",     issuer:"Capital One",abbr:"Venture",logo:"◇", program: "capital_v", af: 95,  earn: "5x hotels/car via C1 Travel, 2x else", sub: "75k miles signup" },
  // ── AIRLINE COBRANDED ──
  { id: "united_exp","name":"United Explorer",      issuer: "Chase",   abbr: "United", logo: "✈", program: "united",  af: 95,   earn: "2x United/dining/hotel, 1x else", sub: "60k miles signup, 2 United Club passes/yr" },
  { id: "united_club","name":"United Club Infinite",issuer: "Chase",   abbr: "UC Inf", logo: "✈", program: "united",  af: 525,  earn: "4x United, 2x travel/dining", sub: "United Club membership included" },
  { id: "delta_gold","name":"Delta Gold Amex",      issuer: "Amex",    abbr: "Δ Gold", logo: "△", program: "delta",   af: 150,  earn: "2x Delta/dining/US supermarkets", sub: "Free checked bag, priority boarding" },
  { id: "delta_plat","name":"Delta Platinum Amex",  issuer: "Amex",    abbr: "Δ Plat", logo: "△", program: "delta",   af: 350,  earn: "3x Delta/hotels, 2x dining/supermarkets", sub: "MQM boosts, companion cert" },
  { id: "delta_reserve","name":"Delta Reserve Amex",issuer:"Amex",    abbr: "Δ Res",  logo: "△", program: "delta",   af: 650,  earn: "3x Delta, 1.5x else", sub: "Amex Centurion + Delta Sky Club access" },
  { id: "aa_aviator","name":"AAdvantage Aviator Red",issuer:"Barclays",abbr:"AA Red",  logo: "★", program: "american",af: 99,   earn: "2x American Airlines, 1x else", sub: "60k miles signup" },
  { id: "aa_citi",  "name":"Citi AAdvantage Plat",  issuer:"Citi",    abbr:"AA Citi", logo: "★", program: "american",af: 99,   earn: "2x dining/gas, 1x else", sub: "50k–75k miles signup" },
  { id: "sw_plus",  "name":"Southwest Plus",        issuer: "Chase",   abbr: "SW+",    logo: "♦", program: "southwest",af: 69,  earn: "2x Southwest, 1x else", sub: "Companion Pass progress" },
  { id: "sw_priority","name":"Southwest Priority",  issuer: "Chase",   abbr: "SW Pri", logo: "♦", program: "southwest",af: 149, earn: "3x Southwest, 2x Rapid Rewards hotels/cars", sub: "$75 travel credit, 7,500 bonus pts/yr" },
  { id: "alaska_visa","name":"Alaska Airlines Visa", issuer:"BofA",   abbr:"Alaska",  logo: "❄", program: "alaska",  af: 95,   earn: "3x Alaska, 1x else", sub: "Companion Fare annually" },
  { id: "ba_chase", "name":"British Airways Visa",  issuer: "Chase",   abbr: "BA Visa",logo: "◆", program: "british", af: 95,   earn: "3x BA/IHG, 1x else", sub: "Travel Together Ticket at $30k spend" },
  // ── HOTEL COBRANDED ──
  { id: "hyatt_card","name":"World of Hyatt Card",  issuer: "Chase",   abbr: "Hyatt",  logo: "▲", program: "hyatt",   af: 95,   earn: "4x Hyatt, 2x fitness/dining/airline/transit", sub: "Free night cert annually" },
  { id: "hilton_surpass","name":"Hilton Surpass",   issuer: "Amex",    abbr: "Hilton+",logo: "◑", program: "hilton",  af: 150,  earn: "12x Hilton, 6x dining/groceries/gas", sub: "Free weekend night at $15k spend" },
  { id: "hilton_aspire","name":"Hilton Aspire",     issuer: "Amex",    abbr: "Aspire", logo: "◑", program: "hilton",  af: 550,  earn: "14x Hilton, 7x flights/dining", sub: "Hilton Diamond, free night cert" },
  { id: "marriott_boundless","name":"Bonvoy Boundless",issuer:"Chase", abbr:"Bonvoy",  logo: "◐", program: "marriott",af: 95,   earn: "6x Marriott, 3x dining/gas/groceries", sub: "Free night cert annually (up to 35k pts)" },
  { id: "marriott_brilliant","name":"Bonvoy Brilliant",issuer:"Amex", abbr:"Brilliant",logo:"◐", program: "marriott",af: 650,  earn: "6x Marriott, 3x dining", sub: "Marriott Platinum, $300 dining credit, free night" },
];


// ─── STYLES ──────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0a0e14;
  --panel:     #0f1520;
  --border:    rgba(180,150,90,0.14);
  --border-hi: rgba(180,150,90,0.35);
  --gold:      #c8a050;
  --gold-dim:  rgba(200,160,80,0.12);
  --gold-glow: rgba(200,160,80,0.06);
  --cream:     #e8dfc8;
  --muted:     #6b7a8d;
  --text:      #c8d4df;
  --user-bg:   rgba(200,160,80,0.10);
  --ai-bg:     rgba(15,21,32,0.9);
  --danger:    #c0392b;
  --success:   rgba(46,180,100,0.85);
  --mono:      'IBM Plex Mono', monospace;
  --serif:     'Libre Baskerville', serif;
}

html, body, #root { height: 100%; overflow: hidden; }
body { background: var(--bg); font-family: var(--mono); color: var(--text); }

/* ── LAYOUT ── */
.app { display: flex; height: 100vh; overflow: hidden; }

.sidebar {
  width: 300px;
  min-width: 300px;
  background: var(--panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-collapsed { width: 52px; min-width: 52px; }

.chat-area { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: var(--bg); }

/* ── SIDEBAR HEADER ── */
.sb-header {
  padding: 18px 16px 14px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.brand-gem {
  width: 28px; height: 28px;
  border: 1px solid var(--gold);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: var(--gold);
  transform: rotate(45deg);
  flex-shrink: 0;
}
.brand-gem span { transform: rotate(-45deg); display: block; }

.brand-text { overflow: hidden; }
.brand-name { font-family: var(--serif); font-size: 15px; color: var(--cream); white-space: nowrap; }
.brand-sub { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-top: 1px; }

.collapse-btn {
  background: none; border: none; color: var(--muted); cursor: pointer;
  font-size: 14px; padding: 4px; transition: color 0.15s; flex-shrink: 0;
}
.collapse-btn:hover { color: var(--gold); }

/* ── PORTFOLIO TOTAL ── */
.sb-total {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--gold-glow);
  flex-shrink: 0;
}
.total-label { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--muted); }
.total-val { font-family: var(--serif); font-size: 24px; color: var(--gold); margin: 3px 0 1px; }
.total-sub { font-size: 9px; color: var(--muted); }

/* ── PROGRAM LIST ── */
.sb-programs { flex: 1; overflow-y: auto; padding: 10px 0; }
.sb-programs::-webkit-scrollbar { width: 3px; }
.sb-programs::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

.prog-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 16px;
  transition: background 0.15s;
  cursor: pointer;
}
.prog-row:hover { background: var(--gold-dim); }
.prog-row.editing { background: var(--gold-dim); }

.prog-icon {
  width: 26px; height: 26px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: var(--gold);
  border-radius: 2px;
  transition: border-color 0.15s;
}
.prog-row:hover .prog-icon, .prog-row.editing .prog-icon { border-color: var(--gold); }

.prog-info { flex: 1; min-width: 0; }
.prog-name { font-size: 10px; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.prog-pts { font-size: 9px; color: var(--muted); margin-top: 1px; }
.prog-pts.has-pts { color: var(--gold); }

.prog-input-wrap { padding: 4px 16px 8px; }
.prog-input {
  width: 100%;
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--gold);
  border-radius: 2px;
  padding: 6px 10px;
  color: var(--cream);
  font-family: var(--mono);
  font-size: 13px;
  letter-spacing: 0.05em;
}
.prog-input:focus { outline: none; }
.prog-input::placeholder { color: rgba(107,122,141,0.5); }

/* ── SIDEBAR FOOTER ── */
.sb-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.sb-btn {
  flex: 1; padding: 8px;
  background: none; border: 1px solid var(--border);
  color: var(--muted);
  font-family: var(--mono); font-size: 9px; letter-spacing: 0.2em;
  text-transform: uppercase; cursor: pointer; border-radius: 2px;
  transition: all 0.15s;
}
.sb-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }

/* ── CHAT HEADER ── */
.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: rgba(10,14,20,0.95);
  backdrop-filter: blur(8px);
}

.chat-header-left { display: flex; align-items: center; gap: 12px; }

.live-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border: 1px solid rgba(46,180,100,0.3);
  border-radius: 2px;
  background: rgba(46,180,100,0.08);
  font-size: 8px; letter-spacing: 0.25em; text-transform: uppercase;
  color: #2eb464;
}
.live-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #2eb464;
  box-shadow: 0 0 5px #2eb464;
  animation: livepulse 2s infinite;
}
@keyframes livepulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.chat-title { font-family: var(--serif); font-size: 16px; color: var(--cream); }
.chat-sub { font-size: 9px; color: var(--muted); letter-spacing: 0.15em; margin-top: 2px; }

.clear-btn {
  background: none; border: 1px solid var(--border);
  color: var(--muted); font-family: var(--mono); font-size: 9px;
  letter-spacing: 0.2em; text-transform: uppercase;
  padding: 6px 14px; border-radius: 2px; cursor: pointer;
  transition: all 0.15s;
}
.clear-btn:hover { border-color: rgba(192,57,43,0.4); color: #e74c3c; background: rgba(192,57,43,0.08); }

/* ── MESSAGES ── */
.messages {
  flex: 1; overflow-y: auto;
  padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
  scroll-behavior: smooth;
}
.messages::-webkit-scrollbar { width: 3px; }
.messages::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

/* ── WELCOME ── */
.welcome {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh;
  text-align: center; gap: 12px;
}
.welcome-gem {
  width: 60px; height: 60px;
  border: 1px solid rgba(200,160,80,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: var(--gold);
  transform: rotate(45deg); margin-bottom: 8px;
  animation: gemRotate 8s linear infinite;
}
.welcome-gem span { transform: rotate(-45deg); display: block; }
@keyframes gemRotate { to { transform: rotate(405deg); } }

.welcome-title { font-family: var(--serif); font-size: 26px; font-weight: 400; color: var(--cream); }
.welcome-title em { font-style: italic; color: var(--gold); }
.welcome-sub { font-size: 10px; color: var(--muted); letter-spacing: 0.15em; max-width: 360px; line-height: 1.8; }

.quick-prompts { display: flex; flex-direction: column; gap: 6px; margin-top: 16px; width: 100%; max-width: 480px; }
.qp-btn {
  background: rgba(255,255,255,0.02); border: 1px solid var(--border);
  color: var(--text); font-family: var(--mono); font-size: 11px;
  padding: 10px 16px; text-align: left; cursor: pointer; border-radius: 2px;
  transition: all 0.15s; line-height: 1.4;
}
.qp-btn:hover { border-color: var(--gold); color: var(--cream); background: var(--gold-dim); }

/* ── MESSAGE BUBBLES ── */
.msg { display: flex; gap: 12px; animation: msgIn 0.25s ease; }
@keyframes msgIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform:none; } }

.msg.user { flex-direction: row-reverse; }

.msg-avatar {
  width: 28px; height: 28px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; color: var(--gold); border-radius: 2px;
  margin-top: 2px;
}
.msg.user .msg-avatar { border-color: rgba(200,160,80,0.3); background: var(--gold-dim); }

.msg-body { max-width: 75%; display: flex; flex-direction: column; gap: 4px; }
.msg.user .msg-body { align-items: flex-end; }

.msg-bubble {
  padding: 12px 16px;
  border-radius: 3px;
  font-size: 13px; line-height: 1.75;
  border: 1px solid var(--border);
}
.msg.user .msg-bubble {
  background: var(--user-bg);
  border-color: rgba(200,160,80,0.2);
  color: var(--cream);
}
.msg.ai .msg-bubble {
  background: var(--ai-bg);
  color: var(--text);
  white-space: pre-wrap;
}

.msg-time { font-size: 8px; color: var(--muted); letter-spacing: 0.1em; padding: 0 4px; }

.search-notice {
  display: flex; align-items: center; gap: 8px;
  font-size: 9px; color: var(--gold); letter-spacing: 0.15em;
  padding: 0 4px;
}
.search-notice::before { content: ''; display: block; width: 12px; height: 1px; background: var(--gold); }

/* ── TYPING INDICATOR ── */
.typing-indicator {
  display: flex; gap: 12px; animation: msgIn 0.25s ease;
}
.typing-bubble {
  padding: 14px 18px;
  background: var(--ai-bg); border: 1px solid var(--border);
  border-radius: 3px; display: flex; align-items: center; gap: 6px;
}
.dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); animation: dotBounce 1.2s infinite; }
.dot:nth-child(2) { animation-delay: 0.15s; }
.dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes dotBounce { 0%,60%,100%{transform:translateY(0);opacity:0.4} 30%{transform:translateY(-5px);opacity:1} }

/* ── INPUT ── */
.input-area {
  padding: 16px 24px 20px;
  border-top: 1px solid var(--border);
  background: var(--panel);
  flex-shrink: 0;
}

.input-wrap {
  display: flex; gap: 10px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 4px 4px 4px 16px;
  transition: border-color 0.2s;
}
.input-wrap:focus-within { border-color: rgba(200,160,80,0.4); }

.chat-input {
  flex: 1; background: none; border: none;
  color: var(--cream); font-family: var(--mono); font-size: 13px;
  padding: 10px 0; resize: none; max-height: 120px; min-height: 42px;
  line-height: 1.5;
}
.chat-input:focus { outline: none; }
.chat-input::placeholder { color: var(--muted); }

.send-btn {
  padding: 0 18px;
  background: var(--gold); border: none; border-radius: 2px;
  color: #0a0e14; font-family: var(--mono); font-size: 11px;
  font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
}
.send-btn:hover { opacity: 0.85; }
.send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.input-hint {
  font-size: 9px; color: var(--muted); margin-top: 8px;
  display: flex; gap: 16px; align-items: center;
}
.hint-chip { letter-spacing: 0.1em; }

/* ── SHARE MODAL ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10,14,20,0.85);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200; animation: fadeIn 0.2s;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }

.modal {
  background: var(--panel); border: 1px solid var(--border-hi);
  border-radius: 3px; padding: 32px; width: 480px; max-width: 95vw;
  animation: modalIn 0.25s ease;
}
@keyframes modalIn { from{transform:translateY(16px);opacity:0} to{transform:none;opacity:1} }

.modal-title { font-family: var(--serif); font-size: 22px; color: var(--cream); margin-bottom: 4px; }
.modal-sub { font-size: 9px; color: var(--muted); letter-spacing: 0.2em; margin-bottom: 24px; }

.modal-section { margin-bottom: 20px; }
.modal-label { font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-bottom: 8px; display: block; }

.code-box {
  background: rgba(0,0,0,0.3); border: 1px solid var(--border);
  border-radius: 2px; padding: 12px; font-size: 10px;
  color: rgba(200,160,80,0.8); word-break: break-all; line-height: 1.6;
  max-height: 80px; overflow-y: auto;
}

.modal-input {
  width: 100%; background: rgba(255,255,255,0.04);
  border: 1px solid var(--border); border-radius: 2px;
  padding: 10px 12px; color: var(--cream);
  font-family: var(--mono); font-size: 11px;
}
.modal-input:focus { outline: none; border-color: var(--gold); }

.modal-btns { display: flex; gap: 10px; margin-top: 8px; }
.modal-btn {
  flex: 1; padding: 10px;
  background: none; border: 1px solid var(--border);
  color: var(--muted); font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.15em; text-transform: uppercase;
  cursor: pointer; border-radius: 2px; transition: all 0.15s;
}
.modal-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
.modal-btn.primary { background: var(--gold); color: #0a0e14; border-color: var(--gold); font-weight: 500; }
.modal-btn.primary:hover { opacity: 0.85; }

.modal-close {
  width: 100%; padding: 10px; margin-top: 4px;
  background: none; border: 1px solid rgba(192,57,43,0.2);
  color: var(--muted); font-family: var(--mono); font-size: 9px;
  letter-spacing: 0.2em; text-transform: uppercase;
  cursor: pointer; border-radius: 2px; transition: all 0.15s;
}
.modal-close:hover { border-color: rgba(192,57,43,0.5); color: #e74c3c; background: rgba(192,57,43,0.08); }

/* ── TOAST ── */
.toast {
  position: fixed; bottom: 24px; right: 24px;
  background: var(--gold); color: #0a0e14;
  padding: 10px 20px; border-radius: 2px;
  font-size: 10px; font-weight: 500; letter-spacing: 0.2em;
  z-index: 999; animation: toastIn 0.3s ease;
}
@keyframes toastIn { from{transform:translateY(10px);opacity:0} to{transform:none;opacity:1} }

/* ── TABS ── */
.chat-tabs {
  display: flex; gap: 2px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--border);
  border-radius: 2px; padding: 3px;
}
.tab-btn {
  padding: 6px 18px;
  background: none; border: none;
  color: var(--muted); font-family: var(--mono); font-size: 9px;
  letter-spacing: 0.2em; text-transform: uppercase;
  cursor: pointer; border-radius: 1px; transition: all 0.15s;
}
.tab-btn:hover { color: var(--cream); background: var(--gold-dim); }
.tab-btn.active { background: var(--gold); color: #0a0e14; font-weight: 500; }
.tab-badge {
  display: inline-block; background: rgba(200,160,80,0.2);
  color: var(--gold); border-radius: 8px;
  padding: 0px 5px; font-size: 8px; margin-left: 5px;
  vertical-align: middle;
}
.tab-btn.active .tab-badge { background: rgba(10,14,20,0.25); color: #0a0e14; }

/* ── HISTORY VIEW ── */
.history-view {
  flex: 1; overflow-y: auto; padding: 24px;
  display: flex; flex-direction: column; gap: 12px;
}
.history-view::-webkit-scrollbar { width: 3px; }
.history-view::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

.history-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 60vh; text-align: center; gap: 10px;
}
.history-empty-icon { font-size: 32px; opacity: 0.2; margin-bottom: 6px; }
.history-empty-title { font-family: var(--serif); font-size: 20px; color: var(--cream); opacity: 0.4; }
.history-empty-sub { font-size: 9px; color: var(--muted); letter-spacing: 0.15em; opacity: 0.6; }

.history-session {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--border);
  border-radius: 3px; overflow: hidden;
  transition: border-color 0.15s;
}
.history-session:hover { border-color: var(--border-hi); }

.history-session-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; cursor: pointer;
  background: rgba(255,255,255,0.01);
  transition: background 0.15s;
}
.history-session-header:hover { background: var(--gold-glow); }

.hs-meta { display: flex; flex-direction: column; gap: 3px; }
.hs-date { font-size: 11px; color: var(--cream); }
.hs-count { font-size: 9px; color: var(--muted); letter-spacing: 0.1em; }
.hs-preview { font-size: 10px; color: var(--muted); max-width: 400px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; font-style: italic; }

.hs-actions { display: flex; gap: 8px; align-items: center; }
.hs-btn {
  padding: 5px 12px; background: none;
  border: 1px solid var(--border); border-radius: 2px;
  color: var(--muted); font-family: var(--mono); font-size: 8px;
  letter-spacing: 0.15em; text-transform: uppercase;
  cursor: pointer; transition: all 0.15s;
}
.hs-btn:hover { border-color: var(--gold); color: var(--gold); background: var(--gold-dim); }
.hs-btn.danger:hover { border-color: rgba(192,57,43,0.5); color: #e74c3c; background: rgba(192,57,43,0.08); }
.hs-chevron { color: var(--muted); font-size: 10px; transition: transform 0.2s; margin-left: 4px; }
.hs-chevron.open { transform: rotate(90deg); }

.history-messages {
  border-top: 1px solid var(--border);
  padding: 16px 18px;
  display: flex; flex-direction: column; gap: 12px;
  max-height: 400px; overflow-y: auto;
}
.history-messages::-webkit-scrollbar { width: 3px; }
.history-messages::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

.hm-row { display: flex; gap: 10px; }
.hm-row.user { flex-direction: row-reverse; }
.hm-icon { width: 22px; height: 22px; flex-shrink: 0; border: 1px solid var(--border); border-radius: 2px; display: flex; align-items: center; justify-content: center; font-size: 9px; color: var(--gold); margin-top: 2px; }
.hm-row.user .hm-icon { background: var(--gold-dim); border-color: rgba(200,160,80,0.2); }
.hm-bubble { max-width: 75%; padding: 9px 13px; border-radius: 2px; font-size: 11px; line-height: 1.7; border: 1px solid var(--border); }
.hm-row.user .hm-bubble { background: var(--user-bg); border-color: rgba(200,160,80,0.2); color: var(--cream); }
.hm-row.ai .hm-bubble { background: var(--ai-bg); color: var(--text); white-space: pre-wrap; }
.hm-time { font-size: 8px; color: var(--muted); margin-top: 3px; padding: 0 2px; }

/* ── SIDEBAR VIEW TOGGLE ── */
.sb-view-toggle {
  display: flex; gap: 2px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}
.sv-btn {
  flex: 1; padding: 6px 4px;
  background: none; border: 1px solid var(--border);
  color: var(--muted); font-family: var(--mono); font-size: 8px;
  letter-spacing: 0.18em; text-transform: uppercase;
  cursor: pointer; border-radius: 2px; transition: all 0.15s;
}
.sv-btn:hover { color: var(--cream); border-color: var(--border-hi); }
.sv-btn.active { background: var(--gold-dim); border-color: var(--gold); color: var(--gold); }

/* ── CARDS LIST ── */
.sb-cards { flex: 1; overflow-y: auto; padding: 8px 0; }
.sb-cards::-webkit-scrollbar { width: 3px; }
.sb-cards::-webkit-scrollbar-thumb { background: var(--border-hi); border-radius: 2px; }

.card-issuer-label {
  font-size: 7px; letter-spacing: 0.3em; text-transform: uppercase;
  color: var(--gold); padding: 10px 16px 4px;
  border-top: 1px solid var(--border); margin-top: 4px;
}
.card-issuer-label:first-child { border-top: none; margin-top: 0; }

.card-row {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 16px; cursor: pointer; transition: background 0.15s;
  position: relative;
}
.card-row:hover { background: var(--gold-dim); }
.card-row.owned { background: rgba(200,160,80,0.06); }

.card-check {
  width: 14px; height: 14px; flex-shrink: 0;
  border: 1px solid var(--border); border-radius: 2px;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; transition: all 0.15s;
}
.card-row.owned .card-check { background: var(--gold); border-color: var(--gold); color: #0a0e14; }

.card-info { flex: 1; min-width: 0; }
.card-name { font-size: 10px; color: var(--cream); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.card-row.owned .card-name { color: var(--gold); }
.card-meta { font-size: 8px; color: var(--muted); margin-top: 1px; letter-spacing: 0.05em; }
.card-af { font-size: 8px; color: var(--muted); flex-shrink: 0; }
.card-row.owned .card-af { color: var(--gold); opacity: 0.7; }

.cards-count-badge {
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--gold-dim); border: 1px solid rgba(200,160,80,0.2);
  color: var(--gold); border-radius: 2px;
  padding: 1px 6px; font-size: 9px;
  margin: 8px 16px; letter-spacing: 0.1em;
}

/* ── COLLAPSED SIDEBAR ── */
.sidebar-collapsed .sb-total,
.sidebar-collapsed .sb-programs,
.sidebar-collapsed .sb-footer,
.sidebar-collapsed .brand-text { display: none; }
.sidebar-collapsed .sb-header { justify-content: center; padding: 18px 12px; }
.sidebar-collapsed .brand { display: none; }
`;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => n ? Number(n).toLocaleString() : "0";
const fmtUSD = (n) => n >= 1 ? "$" + Math.round(n).toLocaleString() : "<$1";

function buildSystemPrompt(points, ownedCards) {
  const active = PROGRAMS.filter(p => Number(points[p.id]) > 0);
  const portfolioStr = active.length > 0
    ? active.map(p => {
        const pts = Number(points[p.id]);
        const val = pts * p.cpp;
        return `  • ${p.name}: ${fmt(pts)} points (≈ ${fmtUSD(val)} @ ${(p.cpp*100).toFixed(1)}¢/pt)`;
      }).join("\n")
    : "  (No points entered yet)";

  const totalPts = active.reduce((s, p) => s + (Number(points[p.id])||0), 0);
  const totalVal = active.reduce((s, p) => s + (Number(points[p.id])||0) * p.cpp, 0);

  const ownedList = CARDS.filter(c => ownedCards[c.id]);
  const cardsStr = ownedList.length > 0
    ? ownedList.map(c => `  • ${c.issuer} ${c.name} ($${c.af}/yr) — earns ${c.earn}`).join("\n")
    : "  (No cards entered yet)";

  // Identify coverage gaps
  const ownedPrograms = new Set(ownedList.map(c => c.program));
  const activePrograms = new Set(active.map(p => p.id));

  return `You are Meridian, an elite travel points concierge and credit card strategist. You have deep expertise in airline/hotel loyalty programs, award redemptions, credit card earning strategies, and signup bonus optimization.

## USER'S CURRENT POINTS PORTFOLIO
${portfolioStr}
Total portfolio: ${fmt(totalPts)} points worth approximately ${fmtUSD(totalVal)}

## USER'S CREDIT CARDS
${cardsStr}

## YOUR ROLE
- You have LIVE access to current deals, transfer bonuses, and card offers via web search — use it for real-time info
- Give specific, actionable advice based on THIS user's actual portfolio and cards
- For booking questions: specify which program to use, how to book, estimated points cost, cash value comparison
- For earning questions: advise which of their CURRENT cards to use for each purchase category
- For card recommendations: only suggest cards when genuinely relevant (user asks, or there's a clear gap/opportunity). When recommending, include current signup bonus, annual fee, and why it fits their specific situation. Note any application rules (Chase 5/24, Amex once-per-lifetime, etc.)
- Identify gaps: if they have points in a program but no card earning into it, flag it
- Be direct and expert — the user is sophisticated. No hedging or generic tips
- Format responses clearly with section headers for multi-topic answers
- Today: ${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}`;
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function MeridianConcierge() {
  const [points, setPoints] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  });
  const [ownedCards, setOwnedCards] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CARDS_KEY)) || {}; } catch { return {}; }
  });
  const [sbView, setSbView] = useState("points"); // "points" | "cards"
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
  });
  const [chatView, setChatView] = useState("chat"); // "chat" | "history"
  const [expandedSession, setExpandedSession] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [importCode, setImportCode] = useState("");
  const [toast, setToast] = useState("");
  const [searchingWeb, setSearchingWeb] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(points)); } catch {}
  }, [points]);

  useEffect(() => {
    try { localStorage.setItem(CARDS_KEY, JSON.stringify(ownedCards)); } catch {}
  }, [ownedCards]);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
  }, [history]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  };

  const saveAndClear = () => {
    if (messages.length > 0) {
      const session = {
        id: Date.now(),
        savedAt: Date.now(),
        messages: messages,
      };
      setHistory(prev => [session, ...prev].slice(0, 50));
    }
    setMessages([]);
    setChatView("chat");
  };

  const deleteSession = (id) => {
    setHistory(prev => prev.filter(s => s.id !== id));
    if (expandedSession === id) setExpandedSession(null);
  };

  const loadSession = (session) => {
    saveAndClear();
    setMessages(session.messages);
    setChatView("chat");
    showToast("SESSION LOADED");
  };

  const totalPts = PROGRAMS.reduce((s, p) => s + (Number(points[p.id])||0), 0);
  const totalVal = PROGRAMS.reduce((s, p) => s + (Number(points[p.id])||0) * p.cpp, 0);

  const sendMessage = useCallback(async (text) => {
    const userText = (text || input).trim();
    if (!userText || loading) return;

    setInput("");
    const userMsg = { role: "user", content: userText, ts: Date.now() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    setSearchingWeb(false);

    const history = nextMessages.map(m => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content }));

    try {
      const systemPrompt = buildSystemPrompt(points, ownedCards);
      let conversationMessages = [...history];
      let usedSearch = false;
      let responseText = "";

      // Multi-turn loop to handle web search tool use
      for (let turn = 0; turn < 5; turn++) {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: systemPrompt,
            messages: conversationMessages,
          }),
        });

        const data = await res.json();

        if (data.error) {
          responseText = `Error: ${data.error.message}`;
          break;
        }

        const hasToolUse = data.stop_reason === "tool_use";
        const textBlocks = (data.content || []).filter(b => b.type === "text");

        if (hasToolUse) {
          usedSearch = true;
          setSearchingWeb(true);
          // Append assistant turn and tool results, then loop
          conversationMessages = [
            ...conversationMessages,
            { role: "assistant", content: data.content },
            {
              role: "user",
              content: (data.content || [])
                .filter(b => b.type === "tool_use")
                .map(b => ({
                  type: "tool_result",
                  tool_use_id: b.id,
                  content: b.input?.query ? `Search for: ${b.input.query}` : "Search executed",
                })),
            },
          ];
        } else {
          responseText = textBlocks.map(b => b.text).join("").trim();
          break;
        }
      }

      setMessages(prev => [...prev, {
        role: "ai",
        content: responseText || "I couldn't generate a response. Please try again.",
        ts: Date.now(),
        usedSearch,
      }]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: "ai",
        content: `Connection error: ${e.message}. Please try again.`,
        ts: Date.now(),
      }]);
    }

    setLoading(false);
    setSearchingWeb(false);
  }, [input, messages, loading, points]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const exportCode = () => {
    try { return btoa(JSON.stringify({ points, cards: ownedCards, v: 1 })); } catch { return ""; }
  };

  const importProfile = () => {
    try {
      const decoded = JSON.parse(atob(importCode.trim()));
      if (decoded.points) { setPoints(decoded.points); }
      if (decoded.cards) { setOwnedCards(decoded.cards); }
      if (decoded.points || decoded.cards) {
        showToast("PORTFOLIO IMPORTED"); setImportCode(""); setShowShare(false);
      } else showToast("INVALID CODE");
    } catch { showToast("INVALID CODE"); }
  };

  const ts = (ms) => new Date(ms).toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });

  return (
    <>
      <style>{CSS}</style>
      <div className="app">

        {/* ── SIDEBAR ── */}
        <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
          <div className="sb-header">
            {!collapsed && (
              <div className="brand">
                <div className="brand-gem"><span>✦</span></div>
                <div className="brand-text">
                  <div className="brand-name">Meridian</div>
                  <div className="brand-sub">Points Concierge</div>
                </div>
              </div>
            )}
            <button className="collapse-btn" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? "▶" : "◀"}
            </button>
          </div>

          {!collapsed && (
            <>
              {totalPts > 0 && sbView === "points" && (
                <div className="sb-total">
                  <div className="total-label">Portfolio Value</div>
                  <div className="total-val">{fmtUSD(totalVal)}</div>
                  <div className="total-sub">{fmt(totalPts)} pts across {PROGRAMS.filter(p=>Number(points[p.id])>0).length} programs</div>
                </div>
              )}
              {sbView === "cards" && (
                <div className="sb-total">
                  <div className="total-label">Cards in Wallet</div>
                  <div className="total-val">{CARDS.filter(c=>ownedCards[c.id]).length}</div>
                  <div className="total-sub">${CARDS.filter(c=>ownedCards[c.id]).reduce((s,c)=>s+c.af,0).toLocaleString()} total annual fees</div>
                </div>
              )}

              <div className="sb-view-toggle">
                <button className={`sv-btn ${sbView==="points"?"active":""}`} onClick={()=>setSbView("points")}>Points</button>
                <button className={`sv-btn ${sbView==="cards"?"active":""}`} onClick={()=>setSbView("cards")}>
                  Cards {CARDS.filter(c=>ownedCards[c.id]).length > 0 && `(${CARDS.filter(c=>ownedCards[c.id]).length})`}
                </button>
              </div>

              {sbView === "points" && (
                <div className="sb-programs">
                  {PROGRAMS.map(p => (
                    <div key={p.id}>
                      <div
                        className={`prog-row ${editingProg === p.id ? "editing" : ""}`}
                        onClick={() => setEditingProg(editingProg === p.id ? null : p.id)}
                      >
                        <div className="prog-icon">{p.logo}</div>
                        <div className="prog-info">
                          <div className="prog-name">{p.abbr}</div>
                          <div className={`prog-pts ${Number(points[p.id]) > 0 ? "has-pts" : ""}`}>
                            {Number(points[p.id]) > 0 ? `${fmt(points[p.id])} pts` : "tap to add"}
                          </div>
                        </div>
                      </div>
                      {editingProg === p.id && (
                        <div className="prog-input-wrap">
                          <input
                            className="prog-input"
                            type="number"
                            autoFocus
                            placeholder="Enter point balance"
                            value={points[p.id] || ""}
                            onChange={e => setPoints(prev => ({ ...prev, [p.id]: e.target.value }))}
                            onKeyDown={e => { if (e.key === "Enter") setEditingProg(null); }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {sbView === "cards" && (
                <div className="sb-cards">
                  {["Chase","Amex","Citi","Capital One","Barclays","BofA"].map(issuer => {
                    const issuerCards = CARDS.filter(c => c.issuer === issuer);
                    if (!issuerCards.length) return null;
                    return (
                      <div key={issuer}>
                        <div className="card-issuer-label">{issuer}</div>
                        {issuerCards.map(card => (
                          <div
                            key={card.id}
                            className={`card-row ${ownedCards[card.id] ? "owned" : ""}`}
                            onClick={() => setOwnedCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                          >
                            <div className="card-check">{ownedCards[card.id] ? "✓" : ""}</div>
                            <div className="card-info">
                              <div className="card-name">{card.name}</div>
                              <div className="card-meta">{card.earn.slice(0, 38)}{card.earn.length > 38 ? "…" : ""}</div>
                            </div>
                            <div className="card-af">${card.af}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="sb-footer">
                <button className="sb-btn" onClick={() => setShowShare(true)}>⬡ Share</button>
                <button className="sb-btn" onClick={saveAndClear}>↺ Clear</button>
              </div>
            </>
          )}
        </aside>

        {/* ── CHAT ── */}
        <div className="chat-area">
          <div className="chat-header">
            <div className="chat-header-left">
              <div>
                <div className="chat-title">Points Concierge</div>
                <div className="chat-sub">
                  {totalPts > 0
                    ? `${PROGRAMS.filter(p=>Number(points[p.id])>0).length} programs · ${fmt(totalPts)} pts · ${fmtUSD(totalVal)}`
                    : "Add your points in the sidebar to get started"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div className="chat-tabs">
                <button className={`tab-btn ${chatView === "chat" ? "active" : ""}`} onClick={() => setChatView("chat")}>
                  Chat
                </button>
                <button className={`tab-btn ${chatView === "history" ? "active" : ""}`} onClick={() => setChatView("history")}>
                  History
                  {history.length > 0 && <span className="tab-badge">{history.length}</span>}
                </button>
              </div>
              <div className="live-badge"><div className="live-dot" /> Live</div>
              {chatView === "chat" && messages.length > 0 && (
                <button className="clear-btn" onClick={saveAndClear}>Save & Clear</button>
              )}
            </div>
          </div>

          {/* CHAT TAB */}
          {chatView === "chat" && (
            <>
              <div className="messages">
                {messages.length === 0 && (
                  <div className="welcome">
                    <div className="welcome-gem"><span>✦</span></div>
                    <div className="welcome-title">Your <em>Points</em> Advisor</div>
                    <div className="welcome-sub">
                      {totalPts > 0
                        ? `I know your portfolio — ${fmt(totalPts)} points worth ${fmtUSD(totalVal)}. Ask me anything about maximizing them.`
                        : "Add your points balances in the sidebar, then ask me anything about flights, deals, or redemptions."}
                    </div>
                    <div className="quick-prompts">
                      {QUICK_PROMPTS.map((q, i) => (
                        <button key={i} className="qp-btn" onClick={() => sendMessage(q)}>{q}</button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`msg ${msg.role}`}>
                    <div className="msg-avatar">{msg.role === "user" ? "U" : "✦"}</div>
                    <div className="msg-body">
                      <div className="msg-bubble">{msg.content}</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div className="msg-time">{ts(msg.ts)}</div>
                        {msg.usedSearch && (
                          <div className="search-notice">searched web for live data</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="typing-indicator">
                    <div className="msg-avatar">✦</div>
                    <div className="typing-bubble">
                      {searchingWeb && <span style={{ fontSize: 9, color: "var(--gold)", letterSpacing: "0.15em", marginRight: 8 }}>SEARCHING WEB</span>}
                      <div className="dot" /><div className="dot" /><div className="dot" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="input-area">
                <div className="input-wrap">
                  <textarea
                    ref={inputRef}
                    className="chat-input"
                    rows={1}
                    placeholder="Ask about flights, deals, transfers, redemptions..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                    Send
                  </button>
                </div>
                <div className="input-hint">
                  <span className="hint-chip">↵ Send</span>
                  <span className="hint-chip">⇧↵ New line</span>
                  <span className="hint-chip" style={{ color: "var(--gold)", marginLeft: "auto" }}>✦ Live web search enabled</span>
                </div>
              </div>
            </>
          )}

          {/* HISTORY TAB */}
          {chatView === "history" && (
            <div className="history-view">
              {history.length === 0 ? (
                <div className="history-empty">
                  <div className="history-empty-icon">◎</div>
                  <div className="history-empty-title">No saved sessions yet</div>
                  <div className="history-empty-sub">Sessions are saved when you clear the chat</div>
                </div>
              ) : (
                history.map(session => {
                  const isOpen = expandedSession === session.id;
                  const userMsgs = session.messages.filter(m => m.role === "user");
                  const firstQ = userMsgs[0]?.content || "";
                  const dateStr = new Date(session.savedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
                  return (
                    <div key={session.id} className="history-session">
                      <div className="history-session-header" onClick={() => setExpandedSession(isOpen ? null : session.id)}>
                        <div className="hs-meta">
                          <div className="hs-date">{dateStr}</div>
                          <div className="hs-count">{session.messages.length} messages · {userMsgs.length} questions</div>
                          {firstQ && <div className="hs-preview">"{firstQ.slice(0, 80)}{firstQ.length > 80 ? "…" : ""}"</div>}
                        </div>
                        <div className="hs-actions">
                          <button className="hs-btn" onClick={e => { e.stopPropagation(); loadSession(session); }}>Load</button>
                          <button className="hs-btn danger" onClick={e => { e.stopPropagation(); deleteSession(session.id); }}>Delete</button>
                          <span className={`hs-chevron ${isOpen ? "open" : ""}`}>▶</span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="history-messages">
                          {session.messages.map((msg, i) => (
                            <div key={i} className={`hm-row ${msg.role}`}>
                              <div className="hm-icon">{msg.role === "user" ? "U" : "✦"}</div>
                              <div>
                                <div className="hm-bubble">{msg.content}</div>
                                <div className="hm-time">{ts(msg.ts)}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── SHARE MODAL ── */}
      {showShare && (
        <div className="modal-overlay" onClick={() => setShowShare(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Share Portfolio</div>
            <div className="modal-sub">Export or import a points profile</div>

            <div className="modal-section">
              <label className="modal-label">Your Export Code</label>
              <div className="code-box">{exportCode()}</div>
              <div className="modal-btns" style={{ marginTop: 10 }}>
                <button className="modal-btn primary" onClick={() => { navigator.clipboard.writeText(exportCode()); showToast("COPIED"); }}>
                  Copy Code
                </button>
              </div>
            </div>

            <div className="modal-section">
              <label className="modal-label">Import a Code</label>
              <input
                className="modal-input"
                placeholder="Paste export code here..."
                value={importCode}
                onChange={e => setImportCode(e.target.value)}
              />
              <div className="modal-btns" style={{ marginTop: 10 }}>
                <button className="modal-btn primary" onClick={importProfile} disabled={!importCode.trim()}>
                  Import Portfolio
                </button>
              </div>
            </div>

            <button className="modal-close" onClick={() => setShowShare(false)}>Close</button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

