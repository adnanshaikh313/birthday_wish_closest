import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import "./index.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const BIRTHDAY_TS = new Date("2026-10-14T00:00:00+05:30").getTime();

const CONFETTI_COLORS = ["#f5c96b", "#e8a0b4", "#b76e79", "#ffd98e", "#fff3d6"];

/* ---------------- Sparkles ---------------- */
function Sparkles({ count = 45 }) {
  const [sparks] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      dur: 2.5 + Math.random() * 3,
    }))
  );
  return (
    <div className="sparkles" aria-hidden="true">
      {sparks.map((s) => (
        <span
          key={s.id}
          className="spark"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Balloons ---------------- */
const BALLOONS = [
  { left: "4%", color: "#e8a0b4", delay: "0s", dur: "11s", size: 1 },
  { left: "12%", color: "#f5c96b", delay: "2s", dur: "13s", size: 0.8 },
  { left: "22%", color: "#b76e79", delay: "5s", dur: "10s", size: 1.1 },
  { left: "78%", color: "#f5c96b", delay: "1s", dur: "12s", size: 0.9 },
  { left: "88%", color: "#e8a0b4", delay: "4s", dur: "10s", size: 1 },
  { left: "94%", color: "#b76e79", delay: "7s", dur: "14s", size: 0.75 },
];

function Balloons() {
  return (
    <div className="balloons" aria-hidden="true">
      {BALLOONS.map((b, i) => (
        <div
          key={i}
          className="balloon"
          style={{
            left: b.left,
            ["--bcolor"]: b.color,
            animationDelay: b.delay,
            animationDuration: b.dur,
            transform: `scale(${b.size})`,
          }}
        >
          <div className="balloon-knot" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Staggered glowing title ---------------- */
function GlowTitle({ text }) {
  return (
    <h1 className="glow-title" aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className="glow-letter"
          aria-hidden="true"
          style={{ animationDelay: `${0.4 + i * 0.055}s` }}
        >
          {ch === " " ? "\u00A0" : ch}
        </span>
      ))}
    </h1>
  );
}

/* ---------------- Countdown ---------------- */
function pad(n) {
  return String(n).padStart(2, "0");
}

function Countdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = BIRTHDAY_TS - now;

  if (diff <= 0) {
    return (
      <section className="section countdown-section">
        <div className="today-card">
          <div className="today-emoji">It&rsquo;s today!</div>
          <p className="today-text">
            The candles are lit, the stars are out —<br />
            today the world celebrates <strong>Nisha</strong>.
          </p>
        </div>
      </section>
    );
  }

  const units = [
    { label: "days", value: Math.floor(diff / 86400000) },
    { label: "hours", value: Math.floor(diff / 3600000) % 24 },
    { label: "minutes", value: Math.floor(diff / 60000) % 60 },
    { label: "seconds", value: Math.floor(diff / 1000) % 60 },
  ];

  return (
    <section className="section countdown-section">
      <h2 className="section-title">Counting down to 14 October</h2>
      <div className="countdown">
        {units.map((u) => (
          <div className="count-box" key={u.label}>
            <span className="count-num">{pad(u.value)}</span>
            <span className="count-label">{u.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------------- Letter ---------------- */
function Letter() {
  return (
    <section className="section">
      <h2 className="section-title">A letter for you</h2>
      <article className="letter-card">
        <p className="letter-salutation">Dear Nisha,</p>
        <p>
          On your birthday, I just want you to know how grateful I am that
          you&rsquo;re in my life. You make ordinary days feel special and
          hard days feel lighter — and that is a rare kind of magic.
        </p>
        <p>
          I hope this year brings you everything you quietly dream of: the
          laughter that makes your cheeks hurt, the people who feel like home,
          and the courage to chase every little thing your heart wants.
        </p>
        <p>
          Blow out the candles, make a big wish, and know that somewhere out
          there, someone is cheering for you louder than anyone else.
        </p>
        <p className="letter-closing">
          Happiest of birthdays, my dear girl.
          <span className="letter-sign">— Aman</span>
        </p>
      </article>
    </section>
  );
}

/* ---------------- Wish wall ---------------- */
function WishWall() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`${API_BASE}/api/wishes`)
      .then((res) => {
        if (!res.ok) throw new Error(`server responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (alive) {
          setWishes(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setError("Could not load wishes right now — please try again later.");
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setFormError(null);
    const n = name.trim();
    const m = message.trim();
    if (!n || !m) {
      setFormError("Please add both your name and a message.");
      return;
    }
    if (n.length > 60 || m.length > 500) {
      setFormError("Name must be under 60 characters, message under 500.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/wishes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, message: m }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `server responded ${res.status}`);
      }
      const created = await res.json();
      setWishes((prev) => [created, ...prev]);
      setName("");
      setMessage("");
    } catch (err) {
      setFormError(err.message || "Could not send your wish — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="section">
      <h2 className="section-title">The wish wall</h2>
      <p className="section-sub">
        Leave a birthday wish for Nisha — she&rsquo;ll read every single one.
      </p>

      <form className="wish-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
          aria-label="Your name"
        />
        <textarea
          placeholder="Write your wish for Nisha…"
          value={message}
          maxLength={500}
          rows={4}
          onChange={(e) => setMessage(e.target.value)}
          aria-label="Your wish"
        />
        {formError && <p className="form-error">{formError}</p>}
        <button type="submit" className="btn" disabled={sending}>
          {sending ? "Sending…" : "Send wish"}
        </button>
      </form>

      <div className="wishes">
        {loading && <p className="muted">Loading wishes…</p>}
        {!loading && error && <p className="muted">{error}</p>}
        {!loading && !error && wishes.length === 0 && (
          <p className="muted">No wishes yet — be the first to write one.</p>
        )}
        {!loading &&
          !error &&
          wishes.map((w, i) => (
            <div className="wish-card" key={w.id || i}>
              <p className="wish-message">&ldquo;{w.message}&rdquo;</p>
              <p className="wish-name">— {w.name}</p>
            </div>
          ))}
      </div>
    </section>
  );
}

/* ---------------- Cake + confetti ---------------- */
function Cake() {
  return (
    <div className="cake" aria-hidden="true">
      <div className="candles">
        {[0, 1, 2].map((i) => (
          <div className="candle" key={i} style={{ animationDelay: `${i * 0.3}s` }}>
            <div className="flame" />
            <div className="wick" />
            <div className="candle-body" />
          </div>
        ))}
      </div>
      <div className="cake-top">
        <div className="icing" />
      </div>
      <div className="cake-middle" />
      <div className="cake-bottom" />
      <div className="plate" />
    </div>
  );
}

function MakeAWish() {
  const celebrate = () => {
    confetti({
      particleCount: 160,
      spread: 110,
      origin: { y: 0.6 },
      colors: CONFETTI_COLORS,
    });
    setTimeout(
      () =>
        confetti({
          particleCount: 90,
          angle: 60,
          spread: 60,
          origin: { x: 0, y: 0.7 },
          colors: CONFETTI_COLORS,
        }),
      250
    );
    setTimeout(
      () =>
        confetti({
          particleCount: 90,
          angle: 120,
          spread: 60,
          origin: { x: 1, y: 0.7 },
          colors: CONFETTI_COLORS,
        }),
      400
    );
  };

  return (
    <section className="section wish-section">
      <h2 className="section-title">Make a wish</h2>
      <p className="section-sub">Close your eyes, think of something wonderful…</p>
      <Cake />
      <button className="btn btn-big" onClick={celebrate}>
        Make a wish
      </button>
    </section>
  );
}

/* ---------------- App ---------------- */
export default function App() {
  return (
    <div className="page">
      <header className="hero">
        <Sparkles />
        <Balloons />
        <div className="hero-inner">
          <p className="hero-kicker">14 October</p>
          <GlowTitle text="Happy Birthday Nisha" />
          <p className="hero-sub">Today, the stars shine a little brighter — just for you.</p>
        </div>
        <div className="scroll-hint" aria-hidden="true">
          <span />
        </div>
      </header>

      <main>
        <Countdown />
        <Letter />
        <WishWall />
        <MakeAWish />
      </main>

      <footer className="footer">
        <p>
          Made with love by <span className="footer-name">Aman</span>
        </p>
      </footer>
    </div>
  );
}
