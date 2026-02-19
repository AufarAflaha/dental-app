import { useState } from 'react';
import api from '../api/client';

const C = { mint:"#00C9A7", navy:"#0A1628", white:"#FFFFFF", gray:"#8899AA", grayLight:"#E8EFF5", red:"#FF5E5E", orange:"#FF9A3C" };

const S = {
  card:{ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  badge:(c)=>({ background:c+"22",color:c,borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700 }),
  btn:(c)=>({ background:c,color:C.white,border:"none",borderRadius:10,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",marginTop:8 }),
  secTitle:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:10,letterSpacing:0.5,textTransform:"uppercase",marginTop:16 },
};

export default function AppointmentHistory({ appointments, onUpdate }) {
  const [cancelling,setCancelling]=useState(null);

  const handleCancel=async(id)=>{
    if(!confirm('Yakin ingin membatalkan appointment ini?')) return;
    
    try{
      setCancelling(id);
      await api.delete(`/appointments/${id}`);
      alert('✅ Appointment dibatalkan');
      if(onUpdate) onUpdate();
    }catch(err){
      alert('❌ Gagal membatalkan: '+(err.response?.data?.error||'Unknown error'));
    }finally{
      setCancelling(null);
    }
  };

  // Group appointments by status
  const grouped={
    upcoming:appointments.filter(a=>a.status==='PENDING'||a.status==='CONFIRMED'),
    completed:appointments.filter(a=>a.status==='COMPLETED'),
    cancelled:appointments.filter(a=>a.status==='CANCELLED')
  };

  return(
    <div>
      {['upcoming','completed','cancelled'].map(group=>{
        const title={upcoming:'📅 Mendatang',completed:'✅ Selesai',cancelled:'❌ Dibatalkan'}[group];
        const items=grouped[group];
        
        return items.length>0?(
          <div key={group}>
            <div style={S.secTitle}>{title}</div>
            {items.map(apt=>(
              <div key={apt.id} style={S.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{apt.doctor?.name||"Dokter"}</div>
                    <div style={{fontSize:12,color:C.gray,marginTop:2}}>
                      📅 {new Date(apt.date).toLocaleDateString('id-ID')} · ⏰ {apt.time}
                    </div>
                    {apt.treatment&&<div style={{fontSize:12,color:C.gray,marginTop:2}}>🦷 {apt.treatment}</div>}
                    {apt.notes&&<div style={{fontSize:12,color:C.gray,marginTop:4}}>📝 {apt.notes}</div>}
                  </div>
                  <span style={S.badge(
                    apt.status==='CONFIRMED'?C.mint:
                    apt.status==='PENDING'?C.orange:
                    apt.status==='COMPLETED'?C.mint:C.red
                  )}>{apt.status}</span>
                </div>
                {apt.status==='PENDING'&&(
                  <button 
                    style={S.btn(C.red)} 
                    onClick={()=>handleCancel(apt.id)} 
                    disabled={cancelling===apt.id}
                  >
                    {cancelling===apt.id?"Membatalkan...":"❌ Batalkan Appointment"}
                  </button>
                )}
              </div>
            ))}
          </div>
        ):null;
      })}

      {appointments.length===0&&(
        <div style={S.card}>
          <div style={{textAlign:"center",color:C.gray,padding:"20px 0"}}>
            <div style={{fontSize:40,marginBottom:10}}>📋</div>
            <div style={{fontSize:14}}>Belum ada riwayat appointment</div>
          </div>
        </div>
      )}
    </div>
  );
}