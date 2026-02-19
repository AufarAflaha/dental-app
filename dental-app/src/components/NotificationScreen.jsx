import { useState, useEffect } from 'react';
import api from '../api/client';

const C = { 
  mint:"#00C9A7", navy:"#0A1628", white:"#FFFFFF", gray:"#8899AA", 
  grayLight:"#E8EFF5", red:"#FF5E5E", blue:"#4D9EFF", orange:"#FF9A3C",
  yellow:"#FFD166", purple:"#9B72CF", offwhite:"#F4F9F8"
};

const S = {
  screen:{ flex:1,overflowY:"auto",background:C.offwhite,paddingBottom:80 },
  header:{ background:`linear-gradient(135deg,${C.navy},#112240)`,padding:"20px 20px 28px",color:C.white },
  card:{ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  badge:(c)=>({ background:c+"22",color:c,borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700 }),
  btn:(c)=>({ background:c,color:C.white,border:"none",borderRadius:14,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginTop:8 }),
  backBtn:{ background:"rgba(255,255,255,0.15)",border:"none",borderRadius:12,padding:"8px 16px",color:C.white,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6 },
  body:{ padding:"16px 16px 0" },
  secTitle:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:10,letterSpacing:0.5,textTransform:"uppercase",marginTop:8 },
};

const NOTIF_ICONS = {
  REMINDER: '⏰',
  BOOKING: '📅',
  PAYMENT: '💰',
  STOCK: '💊',
  GENERAL: '📢'
};

const NOTIF_COLORS = {
  REMINDER: C.orange,
  BOOKING: C.blue,
  PAYMENT: C.purple,
  STOCK: C.red,
  GENERAL: C.mint
};

export default function NotificationScreen({ onBack }) {
  const [notifications,setNotifications]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    loadNotifications();
  },[]);

  const loadNotifications=async()=>{
    try{
      setLoading(true);
      const res=await api.get('/notifications');
      setNotifications(res.data);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const handleMarkRead=async(id)=>{
    try{
      await api.patch(`/notifications/${id}/read`);
      loadNotifications();
    }catch(err){
      console.error(err);
    }
  };

  const handleMarkAllRead=async()=>{
    try{
      await api.patch('/notifications/read-all');
      loadNotifications();
    }catch(err){
      console.error(err);
    }
  };

  const unreadCount=notifications.filter(n=>!n.isRead).length;

  return(
    <div style={S.screen}>
      <div style={S.header}>
        <button style={S.backBtn} onClick={onBack}>
          ← Kembali
        </button>
        <div style={{fontSize:22,fontWeight:700,marginTop:12}}>🔔 Notifikasi</div>
        <div style={{fontSize:13,color:C.gray,marginTop:4}}>
          {unreadCount} belum dibaca · {notifications.length} total
        </div>
      </div>

      <div style={S.body}>
        {unreadCount>0&&(
          <button style={S.btn(C.blue)} onClick={handleMarkAllRead}>
            ✓ Tandai Semua Sudah Dibaca
          </button>
        )}

        {loading&&<div style={S.card}>Loading...</div>}

        {!loading&&notifications.length===0&&(
          <div style={S.card}>
            <div style={{textAlign:"center",color:C.gray,padding:"40px 0"}}>
              <div style={{fontSize:50,marginBottom:10}}>🔔</div>
              <div style={{fontSize:14}}>Tidak ada notifikasi</div>
            </div>
          </div>
        )}

        {!loading&&notifications.map(notif=>(
          <div 
            key={notif.id} 
            style={{
              ...S.card,
              opacity:notif.isRead?0.6:1,
              borderLeft:`4px solid ${NOTIF_COLORS[notif.type]||C.gray}`,
              cursor:"pointer"
            }}
            onClick={()=>!notif.isRead&&handleMarkRead(notif.id)}
          >
            <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
              <span style={{fontSize:28,flexShrink:0}}>
                {NOTIF_ICONS[notif.type]||'📢'}
              </span>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:700,color:C.navy}}>
                  {notif.title}
                </div>
                <div style={{fontSize:12,color:C.gray,marginTop:4,lineHeight:1.5}}>
                  {notif.message}
                </div>
                <div style={{fontSize:11,color:C.gray,marginTop:6}}>
                  {new Date(notif.createdAt).toLocaleString('id-ID')}
                </div>
              </div>
              {!notif.isRead&&(
                <div style={{width:10,height:10,borderRadius:"50%",background:NOTIF_COLORS[notif.type],flexShrink:0}}/>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}