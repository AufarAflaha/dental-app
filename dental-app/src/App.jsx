import { useState, useEffect, createContext, useContext } from 'react';
import api from './api/client';

// Colors
const C = {
  mint: "#00C9A7", mintDark: "#009B82", navy: "#0A1628", navyMid: "#112240",
  white: "#FFFFFF", offwhite: "#F4F9F8", gray: "#8899AA", grayLight: "#E8EFF5",
  red: "#FF5E5E", orange: "#FF9A3C", yellow: "#FFD166", blue: "#4D9EFF", purple: "#9B72CF",
};

// Auth Context
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Styles
const S = {
  screen: { flex: 1, overflowY: "auto", background: C.offwhite, paddingBottom: 80 },
  header: (bg) => ({ background: bg || `linear-gradient(135deg, ${C.navy}, ${C.navyMid})`, padding: "20px 20px 28px", color: C.white }),
  greeting: { fontSize: 13, color: C.gray, marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: 700, color: C.white },
  roleTag: (bg) => ({ background: bg || C.mint, color: C.navy, borderRadius: 20, padding: "3px 12px", fontSize: 11, fontWeight: 800 }),
  statsRow: { display: "flex", gap: 10, marginTop: 16 },
  statCard: { flex: 1, background: "rgba(255,255,255,0.08)", borderRadius: 16, padding: "12px 10px", textAlign: "center" },
  statNum: (c) => ({ fontSize: 20, fontWeight: 800, color: c || C.mint }),
  statLabel: { fontSize: 10, color: C.gray, marginTop: 2 },
  body: { padding: "16px 16px 0" },
  card: { background: C.white, borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
  btn: (c) => ({ background: c, color: C.white, border: "none", borderRadius: 14, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 8 }),
  input: { width: "100%", background: C.offwhite, border: `1.5px solid ${C.grayLight}`, borderRadius: 14, padding: "12px 16px", fontSize: 14, color: C.navy, outline: "none", boxSizing: "border-box", marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 700, color: C.navy, marginBottom: 6, display: "block" },
};

// LOGIN SCREEN
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (acc) => {
    setEmail(acc.email);
    setPassword('password123');
  };

  return (
    <div style={{ flex: 1, background: `linear-gradient(160deg, ${C.navy}, #0D2040, #0A2E1E)`, display: "flex", flexDirection: "column", padding: 24, justifyContent: "center" }}>
      <div style={{ maxWidth: 400, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: 28, background: `linear-gradient(135deg, ${C.mint}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px", boxShadow: `0 8px 30px ${C.mint}44` }}>🦷</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.white }}>DentalCare</div>
          <div style={{ fontSize: 13, color: C.gray, marginTop: 4 }}>Klinik Gigi Digital</div>
        </div>

        <div style={{ background: C.white, borderRadius: 28, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 4 }}>Masuk ke Akun</div>
          <div style={{ fontSize: 13, color: C.gray, marginBottom: 20 }}>Gunakan akun klinik kamu</div>

          <label style={S.label}>Email</label>
          <input style={S.input} type="email" placeholder="email@klinik.id" value={email} onChange={e => setEmail(e.target.value)} />

          <label style={S.label}>Password</label>
          <div style={{ position: "relative" }}>
            <input style={{ ...S.input, paddingRight: 48 }} type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
            <span style={{ position: "absolute", right: 14, top: 12, cursor: "pointer", fontSize: 18 }} onClick={() => setShowPass(v => !v)}>{showPass ? "🙈" : "👁️"}</span>
          </div>

          {error && <div style={{ fontSize: 12, color: C.red, marginTop: -4, marginBottom: 8, fontWeight: 600 }}>⚠️ {error}</div>}

          <button style={S.btn(loading ? C.gray : C.mint)} onClick={handleLogin} disabled={loading}>
            {loading ? "Memverifikasi..." : "Masuk →"}
          </button>

          <div style={{ marginTop: 20, borderTop: `1px solid ${C.grayLight}`, paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: C.gray, textAlign: "center", marginBottom: 10 }}>Demo — tap untuk isi otomatis</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { role: "Dokter", email: "anisa@klinik.id", avatar: "👩‍⚕️" },
                { role: "Admin", email: "admin@klinik.id", avatar: "👩‍💼" },
                { role: "Pasien", email: "budi@gmail.com", avatar: "👨" }
              ].map(a => (
                <button key={a.role} onClick={() => quickFill(a)} style={{ flex: 1, background: C.offwhite, border: `1.5px solid ${C.grayLight}`, borderRadius: 12, padding: "8px 4px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: C.navy }}>
                  <div style={{ fontSize: 20 }}>{a.avatar}</div>
                  <div style={{ marginTop: 3 }}>{a.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: C.gray }}>
          Backend: http://localhost:5001/api
        </div>
      </div>
    </div>
  );
}

// DASHBOARD SCREEN
function DashboardScreen() {
  const { user, logout } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [apptRes, medRes, notifRes] = await Promise.all([
        api.get('/appointments').catch(() => ({ data: [] })),
        api.get('/medicines').catch(() => ({ data: [] })),
        api.get('/notifications').catch(() => ({ data: [] }))
      ]);
      setAppointments(apptRes.data);
      setMedicines(medRes.data);
      setNotifications(notifRes.data);
    } catch (error) {
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const lowStockMeds = medicines.filter(m => m.stock <= m.minStock);

  return (
    <div style={S.screen}>
      <div style={S.header()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={S.greeting}>Selamat datang 👋</div>
            <div style={S.userName}>{user.name}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: `linear-gradient(135deg, ${C.mint}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              {user.role === 'DOKTER' ? '👩‍⚕️' : user.role === 'ADMIN' ? '👩‍💼' : '👨'}
            </div>
            <div style={S.roleTag()}>{user.role}</div>
          </div>
        </div>
        <div style={S.statsRow}>
          <div style={S.statCard}>
            <div style={S.statNum(C.mint)}>{appointments.length}</div>
            <div style={S.statLabel}>Appointments</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statNum(C.orange)}>{unreadCount}</div>
            <div style={S.statLabel}>Notifikasi</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statNum(lowStockMeds.length > 0 ? C.red : C.mint)}>{lowStockMeds.length}</div>
            <div style={S.statLabel}>Stok Kritis</div>
          </div>
        </div>
      </div>

      <div style={S.body}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: C.gray }}>Loading...</div>
        ) : (
          <>
            {/* Appointments */}
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10, marginTop: 8, textTransform: "uppercase" }}>📅 Appointments Terbaru</div>
            {appointments.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: C.gray }}>Belum ada appointment</div>
            ) : (
              appointments.slice(0, 5).map(apt => (
                <div key={apt.id} style={S.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                        {user.role === 'DOKTER' ? apt.patient?.name : user.role === 'ADMIN' ? `${apt.patient?.name} → ${apt.doctor?.name}` : apt.doctor?.name}
                      </div>
                      <div style={{ fontSize: 12, color: C.gray, marginTop: 2 }}>
                        {new Date(apt.date).toLocaleDateString('id-ID')} · {apt.time}
                      </div>
                    </div>
                    <span style={{ background: apt.status === 'CONFIRMED' ? C.mint + '22' : C.orange + '22', color: apt.status === 'CONFIRMED' ? C.mint : C.orange, borderRadius: 10, padding: "4px 10px", fontSize: 11, fontWeight: 700 }}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Medicines (Admin/Dokter only) */}
            {(user.role === 'ADMIN' || user.role === 'DOKTER') && (
              <>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10, marginTop: 16, textTransform: "uppercase" }}>💊 Stok Obat</div>
                {lowStockMeds.length > 0 && (
                  <div style={{ background: `linear-gradient(135deg, ${C.red}, ${C.orange})`, borderRadius: 18, padding: "12px 16px", marginBottom: 12, display: "flex", gap: 12, alignItems: "center", color: C.white }}>
                    <span style={{ fontSize: 24 }}>⚠️</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{lowStockMeds.length} item stok kritis!</div>
                      <div style={{ fontSize: 12, opacity: 0.9 }}>Segera lakukan pemesanan ulang</div>
                    </div>
                  </div>
                )}
                {medicines.slice(0, 5).map(med => {
                  const isLow = med.stock <= med.minStock;
                  return (
                    <div key={med.id} style={S.card}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{med.name}</div>
                          <div style={{ fontSize: 12, color: C.gray }}>{med.category}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 16, fontWeight: 800, color: isLow ? C.red : C.mint }}>{med.stock}</div>
                          <div style={{ fontSize: 11, color: C.gray }}>{med.unit}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Notifications */}
            <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 10, marginTop: 16, textTransform: "uppercase" }}>🔔 Notifikasi</div>
            {notifications.length === 0 ? (
              <div style={{ ...S.card, textAlign: "center", color: C.gray }}>Tidak ada notifikasi</div>
            ) : (
              notifications.slice(0, 5).map(notif => (
                <div key={notif.id} style={{ ...S.card, opacity: notif.isRead ? 0.6 : 1, borderLeft: `3px solid ${notif.isRead ? C.grayLight : C.mint}` }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{notif.title}</div>
                  <div style={{ fontSize: 12, color: C.gray, marginTop: 4 }}>{notif.message}</div>
                  <div style={{ fontSize: 11, color: C.gray, marginTop: 6 }}>
                    {new Date(notif.createdAt).toLocaleString('id-ID')}
                  </div>
                </div>
              ))
            )}

            {/* Logout */}
            <button style={{ ...S.btn(C.red), marginTop: 24 }} onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// MAIN APP
export default function App() {
  return (
    <AuthProvider>
      <div style={{ fontFamily: "'DM Sans', 'Nunito', sans-serif", background: C.navy, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AuthContent />
      </div>
    </AuthProvider>
  );
}

function AuthContent() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.white }}>
        <div>Loading...</div>
      </div>
    );
  }

  return user ? <DashboardScreen /> : <LoginScreen />;
}
