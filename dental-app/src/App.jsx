import { useState, useEffect, createContext, useContext } from 'react';
import api from './api/client';
import BookingForm from './components/BookingForm';
import AppointmentHistory from './components/AppointmentHistory';
import OdontogramEditor from './components/OdontogramEditor';
import PatientManagement from './components/PatientManagement';
import InvoiceManagement from './components/InvoiceManagement';
import NotificationScreen from './components/NotificationScreen';

// ═══════════════════════════════════════════════════════════
// COLORS & STYLES
// ═══════════════════════════════════════════════════════════
const C = {
  mint:"#00C9A7",mintDark:"#009B82",mintLight:"#E0FAF5",
  navy:"#0A1628",navyMid:"#112240",navyLight:"#1A3054",
  white:"#FFFFFF",offwhite:"#F4F9F8",
  gray:"#8899AA",grayLight:"#E8EFF5",
  red:"#FF5E5E",orange:"#FF9A3C",yellow:"#FFD166",
  blue:"#4D9EFF",purple:"#9B72CF",pink:"#FF6B9D",
};

const S = {
  screen:{ flex:1,overflowY:"auto",background:C.offwhite,paddingBottom:80 },
  header:(bg)=>({ background:bg||`linear-gradient(135deg,${C.navy},${C.navyMid})`,padding:"20px 20px 28px",color:C.white }),
  headerRow:{ display:"flex",justifyContent:"space-between",alignItems:"center" },
  greeting:{ fontSize:13,color:C.gray,marginBottom:2 },
  userName:{ fontSize:22,fontWeight:700,color:C.white },
  roleTag:(bg)=>({ background:bg||C.mint,color:C.navy,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:800,letterSpacing:0.5 }),
  avatarCircle:(bg)=>({ width:44,height:44,borderRadius:"50%",background:bg||`linear-gradient(135deg,${C.mint},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,border:"2px solid rgba(255,255,255,0.2)",flexShrink:0 }),
  statsRow:{ display:"flex",gap:10,marginTop:16 },
  statCard:{ flex:1,background:"rgba(255,255,255,0.08)",borderRadius:16,padding:"12px 10px",textAlign:"center",border:"1px solid rgba(255,255,255,0.1)" },
  statNum:(c)=>({ fontSize:20,fontWeight:800,color:c||C.mint }),
  statLabel:{ fontSize:10,color:C.gray,marginTop:2 },
  body:{ padding:"16px 16px 0" },
  secTitle:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:10,letterSpacing:0.5,textTransform:"uppercase",marginTop:8 },
  card:(x)=>({ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)",...x }),
  row:(x)=>({ display:"flex",alignItems:"center",gap:12,background:C.white,borderRadius:16,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.05)",...x }),
  badge:(c)=>({ background:c+"22",color:c,borderRadius:10,padding:"2px 8px",fontSize:11,fontWeight:700,flexShrink:0 }),
  btn:(c,x)=>({ background:c,color:C.white,border:"none",borderRadius:14,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginTop:8,...x }),
  input:{ width:"100%",background:C.offwhite,border:`1.5px solid ${C.grayLight}`,borderRadius:14,padding:"12px 16px",fontSize:14,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:12 },
  label:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:6,display:"block" },
  navbar:{ position:"fixed",bottom:0,left:0,right:0,background:C.white,borderTop:`1px solid ${C.grayLight}`,display:"flex",padding:"10px 0 18px",boxShadow:"0 -4px 20px rgba(0,0,0,0.08)",zIndex:100 },
  navItem:{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"4px 0" },
  navIcon:(a)=>({ fontSize:22,filter:a?"none":"grayscale(1) opacity(0.45)" }),
  navLabel:(a)=>({ fontSize:10,fontWeight:a?700:500,color:a?C.mint:C.gray }),
  divider:{ height:1,background:C.grayLight,margin:"8px 0" },
};

// ═══════════════════════════════════════════════════════════
// AUTH CONTEXT
// ═══════════════════════════════════════════════════════════
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user,setUser]=useState(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const token=localStorage.getItem('token');
    if(token){
      api.get('/auth/me')
        .then(res=>setUser(res.data))
        .catch(()=>{localStorage.removeItem('token');localStorage.removeItem('user');})
        .finally(()=>setLoading(false));
    }else setLoading(false);
  },[]);

  const login=async(email,password)=>{
    const {data}=await api.post('/auth/login',{email,password});
    localStorage.setItem('token',data.token);
    localStorage.setItem('user',JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout=()=>{
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return <AuthContext.Provider value={{user,loading,login,logout}}>{children}</AuthContext.Provider>;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════
function Navbar({tabs,active,setActive}){
  return(
    <div style={S.navbar}>
      {tabs.map(t=>(
        <div key={t.key} style={S.navItem} onClick={()=>setActive(t.key)}>
          <span style={S.navIcon(active===t.key)}>{t.icon}</span>
          <span style={S.navLabel(active===t.key)}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function BellBtn({count,onClick}){
  return(
    <div style={{position:"relative",cursor:"pointer"}} onClick={onClick}>
      <span style={{fontSize:24}}>🔔</span>
      {count>0&&<span style={{position:"absolute",top:-4,right:-4,background:C.red,color:C.white,borderRadius:"50%",width:18,height:18,fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center"}}>{count}</span>}
    </div>
  );
}

function ToothBox({t}){
  const colors={ok:"#1E3A5F",filling:C.yellow,crown:C.blue,missing:C.red,scaling:C.orange};
  return <div style={{width:22,height:22,borderRadius:5,background:colors[t.s]||"#1E3A5F",border:`1.5px solid ${t.s==="ok"?"#2A4A70":"transparent"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:C.white,fontWeight:700,cursor:"pointer",flexShrink:0}} title={t.n}>{t.n}</div>;
}

function StockBar({stock,min}){
  const pct=Math.min(100,Math.round((stock/(min*3))*100));
  const color=stock<=min?C.red:stock<=min*1.5?C.orange:C.mint;
  return(
    <div style={{height:6,borderRadius:10,background:C.grayLight,marginTop:6,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:10}}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════════════════════
function LoginScreen(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [showPass,setShowPass]=useState(false);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const {login}=useContext(AuthContext);

  const handleLogin=async()=>{
    try{setError('');setLoading(true);await login(email,password);}
    catch(err){setError(err.response?.data?.error||'Login failed');}
    finally{setLoading(false);}
  };

  const quickFill=(acc)=>{setEmail(acc.email);setPassword('password123');};

  return(
    <div style={{flex:1,background:`linear-gradient(160deg,${C.navy},#0D2040,#0A2E1E)`,display:"flex",flexDirection:"column",padding:24,justifyContent:"center"}}>
      <div style={{maxWidth:400,margin:"0 auto",width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:80,height:80,borderRadius:28,background:`linear-gradient(135deg,${C.mint},${C.blue})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,margin:"0 auto 16px",boxShadow:`0 8px 30px ${C.mint}44`}}>🦷</div>
          <div style={{fontSize:26,fontWeight:800,color:C.white}}>DentalCare</div>
          <div style={{fontSize:13,color:C.gray,marginTop:4}}>Klinik Gigi Digital</div>
        </div>

        <div style={{background:C.white,borderRadius:28,padding:24,boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>
          <div style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:4}}>Masuk ke Akun</div>
          <div style={{fontSize:13,color:C.gray,marginBottom:20}}>Gunakan akun klinik kamu</div>

          <label style={S.label}>Email</label>
          <input style={S.input} type="email" placeholder="email@klinik.id" value={email} onChange={e=>setEmail(e.target.value)}/>

          <label style={S.label}>Password</label>
          <div style={{position:"relative"}}>
            <input style={{...S.input,paddingRight:48}} type={showPass?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}/>
            <span style={{position:"absolute",right:14,top:12,cursor:"pointer",fontSize:18}} onClick={()=>setShowPass(v=>!v)}>{showPass?"🙈":"👁️"}</span>
          </div>

          {error&&<div style={{fontSize:12,color:C.red,marginTop:-4,marginBottom:8,fontWeight:600}}>⚠️ {error}</div>}

          <button style={S.btn(loading?C.gray:C.mint)} onClick={handleLogin} disabled={loading}>
            {loading?"Memverifikasi...":"Masuk →"}
          </button>

          <div style={{marginTop:20,borderTop:`1px solid ${C.grayLight}`,paddingTop:16}}>
            <div style={{fontSize:12,color:C.gray,textAlign:"center",marginBottom:10}}>Demo — tap untuk isi otomatis</div>
            <div style={{display:"flex",gap:8}}>
              {[
                {role:"Dokter",email:"anisa@klinik.id",avatar:"👩‍⚕️"},
                {role:"Admin",email:"admin@klinik.id",avatar:"👩‍💼"},
                {role:"Pasien",email:"budi@gmail.com",avatar:"👨"}
              ].map(a=>(
                <button key={a.role} onClick={()=>quickFill(a)} style={{flex:1,background:C.offwhite,border:`1.5px solid ${C.grayLight}`,borderRadius:12,padding:"8px 4px",cursor:"pointer",fontSize:11,fontWeight:700,color:C.navy}}>
                  <div style={{fontSize:20}}>{a.avatar}</div>
                  <div style={{marginTop:3}}>{a.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// DOCTOR SCREEN
// ═══════════════════════════════════════════════════════════
const TOOTH_UP=[{n:"18",s:"ok"},{n:"17",s:"ok"},{n:"16",s:"crown"},{n:"15",s:"ok"},{n:"14",s:"ok"},{n:"13",s:"ok"},{n:"12",s:"filling"},{n:"11",s:"ok"},{n:"21",s:"ok"},{n:"22",s:"ok"},{n:"23",s:"ok"},{n:"24",s:"missing"},{n:"25",s:"ok"},{n:"26",s:"scaling"},{n:"27",s:"ok"},{n:"28",s:"ok"}];
const TOOTH_DN=[{n:"48",s:"ok"},{n:"47",s:"filling"},{n:"46",s:"ok"},{n:"45",s:"ok"},{n:"44",s:"ok"},{n:"43",s:"ok"},{n:"42",s:"ok"},{n:"41",s:"ok"},{n:"31",s:"ok"},{n:"32",s:"ok"},{n:"33",s:"ok"},{n:"34",s:"ok"},{n:"35",s:"ok"},{n:"36",s:"crown"},{n:"37",s:"ok"},{n:"38",s:"ok"}];

function DoctorScreen(){
  const [tab,setTab]=useState("beranda");
  const [showNotif,setShowNotif]=useState(false);
  const [appointments,setAppointments]=useState([]);
  const [patients,setPatients]=useState([]);
  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);
  const {user,logout}=useContext(AuthContext);

  useEffect(()=>{
    Promise.all([
      api.get('/appointments').catch(()=>({data:[]})),
      api.get('/users?role=PASIEN').catch(()=>({data:[]})),
      api.get('/notifications').catch(()=>({data:[]}))
    ]).then(([aptRes,patRes,notifRes])=>{
      setAppointments(aptRes.data);
      setPatients(patRes.data);
      setNotifications(notifRes.data);
    }).finally(()=>setLoading(false));
  },[]);

  const handleConfirm=async(id)=>{
    try{
      await api.patch(`/appointments/${id}/status`,{status:'CONFIRMED'});
      const res=await api.get('/appointments');
      setAppointments(res.data);
      alert('✅ Appointment dikonfirmasi');
    }catch(err){
      alert('❌ Gagal konfirmasi: '+err.response?.data?.error);
    }
  };

  const tabs=[
    {key:"beranda",icon:"🏠",label:"Beranda"},
    {key:"odonto",icon:"🦷",label:"Odonto"},
    {key:"foto",icon:"📸",label:"Foto"},
    {key:"jadwal",icon:"📆",label:"Jadwal"},
  ];

  const unreadCount=notifications.filter(n=>!n.isRead).length;

  if(showNotif) return <NotificationScreen onBack={()=>setShowNotif(false)}/>;

  return(
    <div style={S.screen}>
      <div style={S.header()}>
        <div style={S.headerRow}>
          <div><div style={S.greeting}>Selamat pagi 👋</div><div style={S.userName}>{user.name}</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <BellBtn count={unreadCount} onClick={()=>setShowNotif(true)}/>
              <div style={S.avatarCircle()}>👩‍⚕️</div>
            </div>
            <div style={S.roleTag()}>DOKTER</div>
          </div>
        </div>
        <div style={S.statsRow}>
          {[[appointments.length.toString(),"Pasien Hari Ini",C.mint],[patients.length.toString(),"Total Pasien",C.blue],["4.9⭐","Rating",C.yellow]].map(([n,l,col])=>(
            <div key={l} style={S.statCard}><div style={S.statNum(col)}>{n}</div><div style={S.statLabel}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={S.body}>
        {loading?<div style={S.card()}>Loading...</div>:(
          <>
            {tab==="beranda"&&(
              <>
                <div style={S.secTitle}>⚡ Antrian Hari Ini</div>
                {appointments.length===0?<div style={S.card()}>Tidak ada antrian</div>:
                  appointments.slice(0,5).map((apt,i)=>(
                    <div key={apt.id} style={S.row()}>
                      <div style={{width:36,height:36,borderRadius:10,background:[C.mint,C.blue,C.gray,C.gray][i]+"22",color:[C.mint,C.blue,C.gray,C.gray][i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{apt.patient?.name||"Patient"}</div>
                        <div style={{fontSize:12,color:C.gray}}>{new Date(apt.date).toLocaleDateString()} · {apt.time}</div>
                      </div>
                      {apt.status==='PENDING'&&(
                        <button onClick={()=>handleConfirm(apt.id)} style={{...S.btn(C.mint,{width:"auto",padding:"6px 12px",fontSize:11,marginTop:0})}}>
                          Konfirmasi
                        </button>
                      )}
                      {apt.status==='CONFIRMED'&&<span style={S.badge(C.mint)}>Dikonfirmasi</span>}
                    </div>
                  ))
                }
                <div style={S.secTitle}>📋 Pasien Terbaru</div>
                {patients.slice(0,3).map(p=>(
                  <div key={p.id} style={S.row()}>
                    <div style={{width:38,height:38,borderRadius:"50%",background:C.blue+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>👤</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{p.name}</div>
                      <div style={{fontSize:12,color:C.gray}}>{p.email}</div>
                    </div>
                    <span style={S.badge(C.mint)}>Aktif</span>
                  </div>
                ))}
              </>
            )}

            {tab==="odonto"&&(
              <>
                <div style={S.secTitle}>🦷 Odontogram Editor</div>
                <OdontogramEditor onSave={()=>alert('Odontogram saved successfully!')}/>
              </>
            )}

            {tab==="foto"&&(
              <>
                <div style={S.secTitle}>📸 Foto Sebelum & Sesudah</div>
                <div style={S.card()}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:10}}>Budi Santoso — Tambal Gigi 12</div>
                  <div style={{display:"flex",gap:10}}>
                    {[["Sebelum","🦷",C.red],["Sesudah","✨",C.mint]].map(([lbl,emoji,col])=>(
                      <div key={lbl} style={{flex:1,background:col+"11",borderRadius:14,padding:14,textAlign:"center",border:`1.5px solid ${col}33`}}>
                        <div style={{fontSize:32}}>{emoji}</div>
                        <div style={{fontSize:11,fontWeight:700,color:col,marginTop:5}}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{fontSize:12,color:C.gray,marginTop:8}}>📝 Komposit A2, fitting sempurna</div>
                </div>
              </>
            )}

            {tab==="jadwal"&&(
              <>
                <div style={S.secTitle}>📆 Jadwal Praktik — Feb 2025</div>
                {["Senin","Selasa","Rabu","Kamis","Jumat"].map((d,i)=>(
                  <div key={d} style={S.row()}>
                    <div style={{width:36,height:36,borderRadius:10,background:[C.mint,C.blue,C.purple,C.orange,C.mint][i]+"22",color:[C.mint,C.blue,C.purple,C.orange,C.mint][i],display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800}}>{d.slice(0,2)}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{d}</div>
                      <div style={{fontSize:12,color:C.gray}}>08:00–14:00 · {[8,6,7,5,8][i]} pasien</div>
                    </div>
                    <span style={S.badge([C.mint,C.mint,C.orange,C.mint,C.blue][i])}>{["Penuh","Penuh","Sisa 2","Penuh","Sisa 1"][i]}</span>
                  </div>
                ))}
              </>
            )}

            <button style={S.btn(C.red,{marginTop:24})} onClick={logout}>Logout</button>
          </>
        )}
      </div>
      <Navbar tabs={tabs} active={tab} setActive={setTab}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ADMIN SCREEN
// ═══════════════════════════════════════════════════════════
function AdminScreen(){
  const [tab,setTab]=useState("dashboard");
  const [showNotif,setShowNotif]=useState(false);
  const [appointments,setAppointments]=useState([]);
  const [patients,setPatients]=useState([]);
  const [medicines,setMedicines]=useState([]);
  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);
  const {user,logout}=useContext(AuthContext);

  useEffect(()=>{
    Promise.all([
      api.get('/appointments').catch(()=>({data:[]})),
      api.get('/users?role=PASIEN').catch(()=>({data:[]})),
      api.get('/medicines').catch(()=>({data:[]})),
      api.get('/notifications').catch(()=>({data:[]}))
    ]).then(([aptRes,patRes,medRes,notifRes])=>{
      setAppointments(aptRes.data);
      setPatients(patRes.data);
      setMedicines(medRes.data);
      setNotifications(notifRes.data);
    }).finally(()=>setLoading(false));
  },[]);

  const tabs=[
    {key:"dashboard",icon:"📊",label:"Dashboard"},
    {key:"pasien",icon:"👥",label:"Pasien"},
    {key:"stok",icon:"💊",label:"Stok"},
    {key:"laporan",icon:"📈",label:"Laporan"},
  ];

  const unreadCount=notifications.filter(n=>!n.isRead).length;
  const lowStock=medicines.filter(m=>m.stock<=m.minStock);

  if(showNotif) return <NotificationScreen onBack={()=>setShowNotif(false)}/>;

  return(
    <div style={S.screen}>
      <div style={S.header(`linear-gradient(135deg,#1A0A2E,#2D1B4E)`)}>
        <div style={S.headerRow}>
          <div><div style={S.greeting}>Dashboard Admin ⚙️</div><div style={S.userName}>{user.name}</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <BellBtn count={unreadCount} onClick={()=>setShowNotif(true)}/>
              <div style={S.avatarCircle(`linear-gradient(135deg,${C.purple},${C.mint})`)}>👩‍💼</div>
            </div>
            <div style={S.roleTag(C.purple)}>ADMIN</div>
          </div>
        </div>
        <div style={S.statsRow}>
          {[[patients.length.toString(),"Pasien/Bulan",C.purple],["Rp18jt","Pendapatan",C.yellow],["3","Dokter Aktif",C.mint]].map(([n,l,col])=>(
            <div key={l} style={S.statCard}><div style={S.statNum(col)}>{n}</div><div style={S.statLabel}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={S.body}>
        {loading?<div style={S.card()}>Loading...</div>:(
          <>
            {tab==="dashboard"&&(
              <>
                <div style={S.secTitle}>💰 Invoice Management</div>
                <InvoiceManagement/>
              </>
            )}

            {tab==="pasien"&&(
              <>
                <div style={{...S.secTitle,marginTop:8}}>👥 Manajemen Pasien</div>
                <PatientManagement/>
              </>
            )}

            {tab==="stok"&&(
              <>
                {lowStock.length>0&&(
                  <div style={{background:`linear-gradient(135deg,${C.red},${C.orange})`,borderRadius:18,padding:"12px 16px",marginTop:8,marginBottom:12,display:"flex",gap:12,alignItems:"center",color:C.white}}>
                    <span style={{fontSize:22}}>⚠️</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:13}}>{lowStock.length} item stok kritis!</div>
                      <div style={{fontSize:12,opacity:0.9}}>Segera lakukan pemesanan ulang</div>
                    </div>
                  </div>
                )}
                <div style={S.secTitle}>💊 Semua Stok Obat</div>
                {medicines.length===0?<div style={S.card()}>Tidak ada data obat</div>:
                  medicines.map(med=>{
                    const isLow=med.stock<=med.minStock;
                    return(
                      <div key={med.id} style={S.card({marginBottom:8})}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{med.name}</div>
                            <div style={{fontSize:12,color:C.gray}}>{med.category} · Exp: {new Date(med.expiryDate).toLocaleDateString()}</div>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:16,fontWeight:800,color:isLow?C.red:C.mint}}>{med.stock}</div>
                            <div style={{fontSize:11,color:C.gray}}>{med.unit}</div>
                          </div>
                        </div>
                        <StockBar stock={med.stock} min={med.minStock}/>
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.gray,marginTop:4}}>
                          <span>Min. stok: {med.minStock} {med.unit}</span>
                          {isLow&&<span style={{color:C.red,fontWeight:700}}>⚠️ Perlu restock</span>}
                        </div>
                        {isLow&&<button style={S.btn(C.red,{marginTop:8,padding:"8px 0",fontSize:12})}>📦 Order Sekarang</button>}
                      </div>
                    );
                  })
                }
              </>
            )}

            {tab==="laporan"&&(
              <>
                <div style={S.secTitle}>📊 Laporan — Feb 2025</div>
                <div style={S.card()}>
                  {[["Tambal Gigi",75,C.mint,"24 kasus"],["Scaling",55,C.blue,"18 kasus"],["Pencabutan",35,C.orange,"11 kasus"],["Crown",25,C.purple,"8 kasus"],["Rontgen",45,C.yellow,"14 kasus"]].map(([l,p,col,cnt])=>(
                    <div key={l} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:600,color:C.navy}}>
                        <span>{l}</span><span style={{color:C.gray}}>{cnt}</span>
                      </div>
                      <StockBar stock={p} min={30}/>
                    </div>
                  ))}
                </div>
                <div style={S.card()}>
                  <div style={{fontSize:13,fontWeight:700,color:C.navy,marginBottom:8}}>💰 Ringkasan</div>
                  {[["Total Pendapatan","Rp 18.450.000"],["Pasien Baru","12 orang"],["Pasien Kembali","20 orang"],["Rating","4.85 ⭐"]].map(([l,v])=>(
                    <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:13,padding:"7px 0",borderBottom:`1px solid ${C.grayLight}`}}>
                      <span style={{color:C.gray}}>{l}</span><span style={{fontWeight:700,color:C.navy}}>{v}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <button style={S.btn(C.red,{marginTop:24})} onClick={logout}>Logout</button>
          </>
        )}
      </div>
      <Navbar tabs={tabs} active={tab} setActive={setTab}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PATIENT SCREEN
// ═══════════════════════════════════════════════════════════
const TIPS=[
  {emoji:"🪥",title:"Sikat 2x Sehari",text:"Sikat pagi & malam minimal 2 menit dengan pasta berfluoride."},
  {emoji:"🧵",title:"Flossing Malam",text:"Gunakan benang gigi tiap malam untuk sela-sela gigi."},
  {emoji:"💧",title:"Hindari Minuman Manis",text:"Batasi soda & minuman berenergi yang merusak enamel."},
  {emoji:"🦷",title:"Kontrol 6 Bulan",text:"Kunjungi dokter tiap 6 bulan untuk cek & scaling rutin."},
];

function PatientScreen(){
  const [tab,setTab]=useState("beranda");
  const [showNotif,setShowNotif]=useState(false);
  const [appointments,setAppointments]=useState([]);
  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);
  const {user,logout}=useContext(AuthContext);

  useEffect(()=>{
    Promise.all([
      api.get('/appointments').catch(()=>({data:[]})),
      api.get('/notifications').catch(()=>({data:[]}))
    ]).then(([aptRes,notifRes])=>{
      setAppointments(aptRes.data);
      setNotifications(notifRes.data);
    }).finally(()=>setLoading(false));
  },[]);

  const tabs=[
    {key:"beranda",icon:"🏠",label:"Beranda"},
    {key:"booking",icon:"📅",label:"Booking"},
    {key:"riwayat",icon:"📋",label:"Riwayat"},
    {key:"edukasi",icon:"💡",label:"Edukasi"},
  ];

  const unreadCount=notifications.filter(n=>!n.isRead).length;

  if(showNotif) return <NotificationScreen onBack={()=>setShowNotif(false)}/>;

  return(
    <div style={S.screen}>
      <div style={S.header(`linear-gradient(135deg,#003D2B,#005C40)`)}>
        <div style={S.headerRow}>
          <div><div style={S.greeting}>Halo 😊</div><div style={S.userName}>{user.name}</div></div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <BellBtn count={unreadCount} onClick={()=>setShowNotif(true)}/>
              <div style={S.avatarCircle(`linear-gradient(135deg,${C.mint},${C.yellow})`)}>👨</div>
            </div>
            <div style={S.roleTag(C.mintDark)}>PASIEN</div>
          </div>
        </div>
        <div style={S.statsRow}>
          {[[appointments.length.toString(),"Kunjungan",C.mint],["—","Kontrol Lagi",C.yellow],[unreadCount.toString(),"Reminder",C.orange]].map(([n,l,col])=>(
            <div key={l} style={S.statCard}><div style={S.statNum(col)}>{n}</div><div style={S.statLabel}>{l}</div></div>
          ))}
        </div>
      </div>

      <div style={S.body}>
        {loading?<div style={S.card()}>Loading...</div>:(
          <>
            {tab==="beranda"&&(
              <>
                {unreadCount>0&&(
                  <div style={{background:`linear-gradient(135deg,${C.orange},${C.red})`,borderRadius:18,padding:"13px 16px",marginTop:8,marginBottom:12,display:"flex",gap:12,alignItems:"center",color:C.white}}>
                    <span style={{fontSize:26}}>🔔</span>
                    <div>
                      <div style={{fontWeight:700,fontSize:14}}>Kontrol Gigi Mendekat!</div>
                      <div style={{fontSize:12,opacity:0.9}}>Ada {unreadCount} reminder untuk kamu</div>
                    </div>
                  </div>
                )}
                <div style={S.secTitle}>🩺 Dokter Kamu</div>
                <div style={S.card()}>
                  <div style={{display:"flex",gap:12,alignItems:"center"}}>
                    <span style={{fontSize:34}}>👩‍⚕️</span>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.navy}}>drg. Anisa Putri</div>
                      <div style={{fontSize:12,color:C.gray}}>Orthodonti · ⭐ 4.9</div>
                      <div style={{fontSize:12,color:C.mint,marginTop:2}}>Praktik: Senin – Jumat</div>
                    </div>
                  </div>
                </div>
                <div style={S.secTitle}>📋 Riwayat Terbaru</div>
                {appointments.length===0?<div style={S.card()}>Belum ada riwayat</div>:
                  appointments.slice(0,3).map(apt=>(
                    <div key={apt.id} style={S.row()}>
                      <span style={{fontSize:22}}>🦷</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{apt.treatment||"Konsultasi"}</div>
                        <div style={{fontSize:12,color:C.gray}}>{new Date(apt.date).toLocaleDateString()} · {apt.doctor?.name||"Dokter"}</div>
                      </div>
                      <span style={S.badge(C.mint)}>✓</span>
                    </div>
                  ))
                }
              </>
            )}

            {tab==="booking"&&(
              <>
                <div style={{...S.secTitle,marginTop:8}}>📅 Booking Online</div>
                <BookingForm onSuccess={()=>{
                  api.get('/appointments')
                    .then(res=>setAppointments(res.data))
                    .catch(console.error);
                }}/>
              </>
            )}

            {tab==="riwayat"&&(
              <>
                <div style={{...S.secTitle,marginTop:8}}>📋 Riwayat Appointment</div>
                <AppointmentHistory 
                  appointments={appointments} 
                  onUpdate={()=>{
                    api.get('/appointments')
                      .then(res=>setAppointments(res.data))
                      .catch(console.error);
                  }}
                />
              </>
            )}

            {tab==="edukasi"&&(
              <>
                <div style={{...S.secTitle,marginTop:8}}>💡 Edukasi Kesehatan Gigi</div>
                {TIPS.map(t=>(
                  <div key={t.title} style={{background:`linear-gradient(135deg,${C.mint}15,${C.blue}0A)`,border:`1px solid ${C.mint}33`,borderRadius:16,padding:13,marginBottom:10,display:"flex",gap:10}}>
                    <span style={{fontSize:22,flexShrink:0}}>{t.emoji}</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:C.navyMid,marginBottom:3}}>{t.title}</div>
                      <div style={{fontSize:12,color:C.gray,lineHeight:1.5}}>{t.text}</div>
                    </div>
                  </div>
                ))}
                <div style={S.card({background:`linear-gradient(135deg,${C.navy},${C.navyMid})`})}>
                  <div style={{fontSize:13,fontWeight:700,color:C.white,marginBottom:3}}>🎯 Skor Kesehatan Gigi</div>
                  <div style={{fontSize:38,fontWeight:800,color:C.mint,textAlign:"center",padding:"10px 0"}}>82 / 100</div>
                  <div style={{fontSize:12,color:C.gray,textAlign:"center"}}>Bagus! Terus jaga kesehatan gigi kamu 💪</div>
                </div>
              </>
            )}

            <button style={S.btn(C.red,{marginTop:24})} onClick={logout}>Logout</button>
          </>
        )}
      </div>
      <Navbar tabs={tabs} active={tab} setActive={setTab}/>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════
function MainScreen(){
  const {user}=useContext(AuthContext);
  return(
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh"}}>
      {user.role==='DOKTER'&&<DoctorScreen/>}
      {user.role==='ADMIN'&&<AdminScreen/>}
      {user.role==='PASIEN'&&<PatientScreen/>}
    </div>
  );
}

export default function App(){
  return(
    <AuthProvider>
      <div style={{fontFamily:"'DM Sans','Nunito',sans-serif",background:C.navy,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
        <AuthContent/>
      </div>
    </AuthProvider>
  );
}

function AuthContent(){
  const {user,loading}=useContext(AuthContext);
  if(loading) return <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:C.white}}>Loading...</div>;
  return user?<MainScreen/>:<LoginScreen/>;
}
