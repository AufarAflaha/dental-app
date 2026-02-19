import { useState, useEffect } from 'react';
import api from '../api/client';

const C = { 
  mint:"#00C9A7", navy:"#0A1628", navyMid:"#112240", white:"#FFFFFF", 
  gray:"#8899AA", grayLight:"#E8EFF5", red:"#FF5E5E", orange:"#FF9A3C", 
  yellow:"#FFD166", blue:"#4D9EFF" 
};

const S = {
  card:{ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  label:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:6,display:"block" },
  input:{ width:"100%",background:"#F4F9F8",border:`1.5px solid ${C.grayLight}`,borderRadius:14,padding:"12px 16px",fontSize:14,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:12 },
  btn:(c)=>({ background:c,color:C.white,border:"none",borderRadius:14,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginTop:8 }),
  modal:{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20 },
  modalContent:{ background:C.white,borderRadius:24,padding:24,maxWidth:400,width:"100%",maxHeight:"80vh",overflowY:"auto" },
};

const TOOTH_COLORS = {
  ok: "#1E3A5F",
  filling: C.yellow,
  crown: C.blue,
  missing: C.red,
  scaling: C.orange
};

const TOOTH_LABELS = {
  ok: "Normal",
  filling: "Tambal",
  crown: "Crown",
  missing: "Cabut",
  scaling: "Scaling"
};

// FDI tooth numbering
const TEETH_UPPER = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const TEETH_LOWER = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

export default function OdontogramEditor({ patientId, onSave }) {
  const [odontogram,setOdontogram]=useState({});
  const [diagnosis,setDiagnosis]=useState('');
  const [treatment,setTreatment]=useState('');
  const [notes,setNotes]=useState('');
  const [selectedTooth,setSelectedTooth]=useState(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [patients,setPatients]=useState([]);
  const [selectedPatient,setSelectedPatient]=useState(patientId||'');

  useEffect(()=>{
    // Load patient list
    api.get('/users?role=PASIEN')
      .then(res=>setPatients(res.data))
      .catch(console.error);
  },[]);

  useEffect(()=>{
    if(selectedPatient){
      setLoading(true);
      api.get(`/medical/odontogram/${selectedPatient}`)
        .then(res=>{
          setOdontogram(res.data.odontogram||{});
          setDiagnosis(res.data.diagnosis||'');
          setNotes(res.data.notes||'');
        })
        .catch(err=>console.error(err))
        .finally(()=>setLoading(false));
    }
  },[selectedPatient]);

  const handleToothClick=(toothNum)=>{
    setSelectedTooth(toothNum);
  };

  const handleStatusChange=(status)=>{
    setOdontogram(prev=>({...prev,[selectedTooth]:status}));
    setSelectedTooth(null);
  };

  const handleSave=async()=>{
    if(!selectedPatient){
      alert('Pilih pasien terlebih dahulu');
      return;
    }

    try{
      setSaving(true);
      await api.post('/medical/odontogram',{
        patientId:selectedPatient,
        odontogram,
        diagnosis,
        treatment,
        notes,
        cost:0
      });
      alert('✅ Odontogram berhasil disimpan!');
      if(onSave) onSave();
    }catch(err){
      alert('❌ Gagal menyimpan: '+(err.response?.data?.error||'Unknown error'));
    }finally{
      setSaving(false);
    }
  };

  const ToothBox=({num})=>{
    const status=odontogram[num.toString()]||'ok';
    return(
      <div 
        onClick={()=>handleToothClick(num.toString())} 
        style={{
          width:24,height:24,borderRadius:6,
          background:TOOTH_COLORS[status],
          border:`2px solid ${status==='ok'?'#2A4A70':'transparent'}`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:8,color:C.white,fontWeight:700,
          cursor:"pointer",flexShrink:0,
          transition:"transform 0.2s",
        }}
        onMouseEnter={e=>e.target.style.transform='scale(1.2)'}
        onMouseLeave={e=>e.target.style.transform='scale(1)'}
        title={`Gigi ${num} - ${TOOTH_LABELS[status]}`}
      >
        {num}
      </div>
    );
  };

  return(
    <div>
      {/* Patient Selector */}
      {!patientId&&(
        <div style={S.card}>
          <label style={S.label}>Pilih Pasien</label>
          <select style={S.input} value={selectedPatient} onChange={e=>setSelectedPatient(e.target.value)}>
            <option value="">-- Pilih Pasien --</option>
            {patients.map(p=>(
              <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
            ))}
          </select>
        </div>
      )}

      {loading&&<div style={S.card}>Loading odontogram...</div>}

      {!loading&&selectedPatient&&(
        <>
          {/* Odontogram Chart */}
          <div style={{background:C.navyMid,borderRadius:16,padding:16,marginBottom:12}}>
            <div style={{fontSize:11,color:C.gray,marginBottom:8,textAlign:"center"}}>← KANAN | RAHANG ATAS | KIRI →</div>
            <div style={{display:"flex",justifyContent:"center",gap:3,marginBottom:6}}>
              {TEETH_UPPER.map(t=><ToothBox key={t} num={t}/>)}
            </div>
            <div style={{borderTop:"1px dashed rgba(255,255,255,0.15)",margin:"6px 0"}}/>
            <div style={{display:"flex",justifyContent:"center",gap:3}}>
              {TEETH_LOWER.map(t=><ToothBox key={t} num={t}/>)}
            </div>
            <div style={{fontSize:11,color:C.gray,marginTop:4,textAlign:"center"}}>← KANAN | RAHANG BAWAH | KIRI →</div>
            
            {/* Legend */}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12,justifyContent:"center"}}>
              {Object.entries(TOOTH_LABELS).map(([key,label])=>(
                <div key={key} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.gray}}>
                  <div style={{width:12,height:12,borderRadius:3,background:TOOTH_COLORS[key]}}/>
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis & Notes */}
          <div style={S.card}>
            <label style={S.label}>Diagnosis</label>
            <textarea 
              style={{...S.input,minHeight:80,resize:"vertical"}} 
              placeholder="Contoh: Karies gigi 12, Crown lama gigi 16 perlu diganti..."
              value={diagnosis}
              onChange={e=>setDiagnosis(e.target.value)}
            />

            <label style={S.label}>Tindakan</label>
            <input 
              style={S.input}
              placeholder="Contoh: Tambal komposit, scaling..."
              value={treatment}
              onChange={e=>setTreatment(e.target.value)}
            />

            <label style={S.label}>Catatan (Alergi, dll)</label>
            <textarea 
              style={{...S.input,minHeight:60,resize:"vertical"}} 
              placeholder="Contoh: Alergi Penisilin, tekanan darah tinggi..."
              value={notes}
              onChange={e=>setNotes(e.target.value)}
            />

            <button style={S.btn(saving?C.gray:C.mint)} onClick={handleSave} disabled={saving}>
              {saving?"Menyimpan...":"💾 Simpan Odontogram"}
            </button>
          </div>
        </>
      )}

      {/* Tooth Status Modal */}
      {selectedTooth&&(
        <div style={S.modal} onClick={()=>setSelectedTooth(null)}>
          <div style={S.modalContent} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:16}}>
              🦷 Gigi {selectedTooth}
            </h3>
            <p style={{fontSize:13,color:C.gray,marginBottom:16}}>Pilih status gigi:</p>
            
            {Object.entries(TOOTH_LABELS).map(([key,label])=>(
              <button
                key={key}
                onClick={()=>handleStatusChange(key)}
                style={{
                  width:"100%",
                  background:TOOTH_COLORS[key],
                  color:C.white,
                  border:"none",
                  borderRadius:12,
                  padding:"12px 16px",
                  fontSize:14,
                  fontWeight:700,
                  cursor:"pointer",
                  marginBottom:8,
                  display:"flex",
                  alignItems:"center",
                  gap:10
                }}
              >
                <div style={{width:16,height:16,borderRadius:4,background:"rgba(255,255,255,0.3)"}}/>
                {label}
              </button>
            ))}

            <button
              onClick={()=>setSelectedTooth(null)}
              style={{
                width:"100%",
                background:C.grayLight,
                color:C.navy,
                border:"none",
                borderRadius:12,
                padding:"10px",
                fontSize:13,
                fontWeight:600,
                cursor:"pointer",
                marginTop:8
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}