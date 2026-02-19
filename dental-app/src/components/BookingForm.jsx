import { useState, useEffect } from 'react';
import api from '../api/client';

const C = { mint:"#00C9A7", navy:"#0A1628", white:"#FFFFFF", offwhite:"#F4F9F8", gray:"#8899AA", grayLight:"#E8EFF5", red:"#FF5E5E" };

const S = {
  card:{ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  label:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:6,display:"block" },
  input:{ width:"100%",background:C.offwhite,border:`1.5px solid ${C.grayLight}`,borderRadius:14,padding:"12px 16px",fontSize:14,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:12 },
  btn:(c)=>({ background:c,color:C.white,border:"none",borderRadius:14,padding:"13px 20px",fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",marginTop:8 }),
  timeSlot:(active,booked)=>({ 
    background:booked?C.grayLight:active?C.mint:C.white,
    color:booked?C.gray:active?C.white:C.navy,
    border:`1.5px solid ${booked?C.grayLight:active?C.mint:C.grayLight}`,
    borderRadius:10,padding:"8px 0",fontSize:12,fontWeight:600,
    cursor:booked?"not-allowed":"pointer",textAlign:"center",
    opacity:booked?0.5:1
  }),
};

export default function BookingForm({ onSuccess }) {
  const [doctors,setDoctors]=useState([]);
  const [selectedDoctor,setSelectedDoctor]=useState('');
  const [date,setDate]=useState('');
  const [availableSlots,setAvailableSlots]=useState([]);
  const [bookedSlots,setBookedSlots]=useState([]);
  const [selectedTime,setSelectedTime]=useState('');
  const [notes,setNotes]=useState('');
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [success,setSuccess]=useState('');

  useEffect(()=>{
    api.get('/users?role=DOKTER')
      .then(res=>setDoctors(res.data))
      .catch(err=>console.error(err));
  },[]);

  useEffect(()=>{
    if(selectedDoctor&&date){
      api.get(`/appointments/slots/available?doctorId=${selectedDoctor}&date=${date}`)
        .then(res=>{
          setAvailableSlots(res.data.availableSlots||[]);
          setBookedSlots(res.data.bookedSlots||[]);
          setSelectedTime(''); // Reset selection
        })
        .catch(err=>console.error(err));
    }
  },[selectedDoctor,date]);

  const handleSubmit=async()=>{
    setError('');setSuccess('');

    if(!selectedDoctor||!date||!selectedTime){
      setError('Mohon lengkapi semua field');
      return;
    }

    try{
      setLoading(true);
      await api.post('/appointments',{
        doctorId:selectedDoctor,
        date,
        time:selectedTime,
        notes
      });
      setSuccess('✅ Booking berhasil! Menunggu konfirmasi dokter.');
      setSelectedDoctor('');
      setDate('');
      setSelectedTime('');
      setNotes('');
      setAvailableSlots([]);
      if(onSuccess) onSuccess();
    }catch(err){
      setError(err.response?.data?.error||'Booking gagal. Silakan coba lagi.');
    }finally{
      setLoading(false);
    }
  };

  return(
    <div>
      <div style={S.card}>
        <label style={S.label}>Pilih Dokter</label>
        <select style={S.input} value={selectedDoctor} onChange={e=>setSelectedDoctor(e.target.value)}>
          <option value="">-- Pilih Dokter --</option>
          {doctors.map(d=>(
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>

        <label style={S.label}>Tanggal</label>
        <input style={S.input} type="date" value={date} onChange={e=>setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}/>

        {availableSlots.length>0&&(
          <>
            <label style={S.label}>Pilih Waktu</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[...availableSlots,...bookedSlots].sort().map(t=>{
                const isBooked=bookedSlots.includes(t);
                const isSelected=selectedTime===t;
                return(
                  <div key={t} onClick={()=>!isBooked&&setSelectedTime(t)} style={S.timeSlot(isSelected,isBooked)}>
                    {t} {isBooked&&"❌"}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <label style={S.label}>Catatan (opsional)</label>
        <textarea style={{...S.input,minHeight:80,resize:"vertical"}} placeholder="Keluhan atau catatan tambahan..." value={notes} onChange={e=>setNotes(e.target.value)}/>

        {error&&<div style={{fontSize:12,color:C.red,marginBottom:8,fontWeight:600}}>⚠️ {error}</div>}
        {success&&<div style={{fontSize:12,color:C.mint,marginBottom:8,fontWeight:600}}>{success}</div>}

        <button style={S.btn(loading?C.gray:C.mint)} onClick={handleSubmit} disabled={loading||!selectedDoctor||!date||!selectedTime}>
          {loading?"Memproses...":"✅ Konfirmasi Booking"}
        </button>
      </div>
    </div>
  );
}