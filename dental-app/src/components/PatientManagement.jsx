import { useState, useEffect } from 'react';
import api from '../api/client';

const C = { 
  mint:"#00C9A7", navy:"#0A1628", white:"#FFFFFF", gray:"#8899AA", 
  grayLight:"#E8EFF5", red:"#FF5E5E", blue:"#4D9EFF", offwhite:"#F4F9F8" 
};

const S = {
  card:{ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  row:{ display:"flex",alignItems:"center",gap:12,background:C.white,borderRadius:16,padding:"12px 14px",marginBottom:8,boxShadow:"0 2px 8px rgba(0,0,0,0.05)" },
  label:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:6,display:"block" },
  input:{ width:"100%",background:C.offwhite,border:`1.5px solid ${C.grayLight}`,borderRadius:14,padding:"12px 16px",fontSize:14,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:12 },
  btn:(c,small)=>({ background:c,color:C.white,border:"none",borderRadius:small?10:14,padding:small?"6px 12px":"13px 20px",fontSize:small?12:14,fontWeight:700,cursor:"pointer",width:small?"auto":"100%",marginTop:small?0:8 }),
  badge:(c)=>({ background:c+"22",color:c,borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700 }),
  modal:{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20 },
  modalContent:{ background:C.white,borderRadius:24,padding:24,maxWidth:500,width:"100%",maxHeight:"80vh",overflowY:"auto" },
};

export default function PatientManagement() {
  const [patients,setPatients]=useState([]);
  const [filteredPatients,setFilteredPatients]=useState([]);
  const [search,setSearch]=useState('');
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editingPatient,setEditingPatient]=useState(null);
  const [formData,setFormData]=useState({
    name:'',email:'',password:'',phone:'',birthDate:'',address:'',allergies:''
  });
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    loadPatients();
  },[]);

  useEffect(()=>{
    // Filter patients by search
    if(search){
      const filtered=patients.filter(p=>
        p.name.toLowerCase().includes(search.toLowerCase())||
        p.email.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredPatients(filtered);
    }else{
      setFilteredPatients(patients);
    }
  },[search,patients]);

  const loadPatients=async()=>{
    try{
      setLoading(true);
      const res=await api.get('/users?role=PASIEN');
      setPatients(res.data);
      setFilteredPatients(res.data);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const handleAdd=()=>{
    setEditingPatient(null);
    setFormData({name:'',email:'',password:'',phone:'',birthDate:'',address:'',allergies:''});
    setShowForm(true);
  };

  const handleEdit=(patient)=>{
    setEditingPatient(patient);
    setFormData({
      name:patient.name,
      email:patient.email,
      password:'', // Don't show password
      phone:patient.phone||'',
      birthDate:patient.patientProfile?.birthDate?new Date(patient.patientProfile.birthDate).toISOString().split('T')[0]:'',
      address:patient.patientProfile?.address||'',
      allergies:patient.patientProfile?.allergies||''
    });
    setShowForm(true);
  };

  const handleSubmit=async()=>{
    if(!formData.name||!formData.email){
      alert('Nama dan email wajib diisi');
      return;
    }

    if(!editingPatient&&!formData.password){
      alert('Password wajib diisi untuk pasien baru');
      return;
    }

    try{
      setSaving(true);
      if(editingPatient){
        // Update
        await api.patch(`/users/patients/${editingPatient.id}`,formData);
        alert('✅ Pasien berhasil diupdate');
      }else{
        // Create
        await api.post('/users/patients',formData);
        alert('✅ Pasien berhasil ditambahkan');
      }
      setShowForm(false);
      loadPatients();
    }catch(err){
      alert('❌ Gagal: '+(err.response?.data?.error||'Unknown error'));
    }finally{
      setSaving(false);
    }
  };

  const handleDelete=async(patient)=>{
    if(!confirm(`Yakin ingin menghapus ${patient.name}? Data tidak bisa dikembalikan!`)){
      return;
    }

    try{
      await api.delete(`/users/patients/${patient.id}`);
      alert('✅ Pasien berhasil dihapus');
      loadPatients();
    }catch(err){
      alert('❌ Gagal menghapus: '+(err.response?.data?.error||'Unknown error'));
    }
  };

  return(
    <div>
      {/* Header with Search and Add Button */}
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        <input 
          style={{...S.input,marginBottom:0,flex:1}} 
          placeholder="🔍 Cari pasien (nama/email)..."
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />
        <button style={S.btn(C.mint,false)} onClick={handleAdd}>
          ➕ Tambah
        </button>
      </div>

      {/* Patient List */}
      {loading&&<div style={S.card}>Loading...</div>}
      
      {!loading&&filteredPatients.length===0&&(
        <div style={S.card}>
          <div style={{textAlign:"center",color:C.gray,padding:"20px 0"}}>
            <div style={{fontSize:40,marginBottom:10}}>👥</div>
            <div style={{fontSize:14}}>
              {search?'Tidak ada pasien ditemukan':'Belum ada pasien'}
            </div>
          </div>
        </div>
      )}

      {!loading&&filteredPatients.map(p=>(
        <div key={p.id} style={S.row}>
          <div style={{width:40,height:40,borderRadius:"50%",background:C.blue+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>
            {p.avatar||"👤"}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:700,color:C.navy}}>{p.name}</div>
            <div style={{fontSize:12,color:C.gray}}>{p.email} {p.phone&&`· ${p.phone}`}</div>
            {p.patientProfile?.allergies&&(
              <div style={{fontSize:11,color:C.red,marginTop:2}}>
                ⚠️ Alergi: {p.patientProfile.allergies}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:6}}>
            <button style={S.btn(C.blue,true)} onClick={()=>handleEdit(p)}>
              ✏️ Edit
            </button>
            <button style={S.btn(C.red,true)} onClick={()=>handleDelete(p)}>
              🗑️
            </button>
          </div>
        </div>
      ))}

      {/* Add/Edit Modal */}
      {showForm&&(
        <div style={S.modal} onClick={()=>setShowForm(false)}>
          <div style={S.modalContent} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:16}}>
              {editingPatient?'✏️ Edit Pasien':'➕ Tambah Pasien Baru'}
            </h3>

            <label style={S.label}>Nama Lengkap *</label>
            <input style={S.input} value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="John Doe"/>

            <label style={S.label}>Email *</label>
            <input style={S.input} type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="john@gmail.com"/>

            {!editingPatient&&(
              <>
                <label style={S.label}>Password *</label>
                <input style={S.input} type="password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} placeholder="Min. 8 karakter"/>
              </>
            )}

            <label style={S.label}>No. Telepon</label>
            <input style={S.input} value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})} placeholder="08123456789"/>

            <label style={S.label}>Tanggal Lahir</label>
            <input style={S.input} type="date" value={formData.birthDate} onChange={e=>setFormData({...formData,birthDate:e.target.value})}/>

            <label style={S.label}>Alamat</label>
            <textarea style={{...S.input,minHeight:60,resize:"vertical"}} value={formData.address} onChange={e=>setFormData({...formData,address:e.target.value})} placeholder="Jl. Sudirman No. 123, Jakarta"/>

            <label style={S.label}>Alergi Obat</label>
            <input style={S.input} value={formData.allergies} onChange={e=>setFormData({...formData,allergies:e.target.value})} placeholder="Contoh: Penisilin, Aspirin"/>

            <div style={{display:"flex",gap:8}}>
              <button 
                style={{...S.btn(C.grayLight,false),color:C.navy,flex:1}} 
                onClick={()=>setShowForm(false)}
              >
                Batal
              </button>
              <button 
                style={{...S.btn(saving?C.gray:C.mint,false),flex:1}} 
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving?'Menyimpan...':(editingPatient?'💾 Update':'✅ Simpan')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}