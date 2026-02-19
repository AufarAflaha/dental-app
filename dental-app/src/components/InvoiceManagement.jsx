import { useState, useEffect } from 'react';
import api from '../api/client';

const C = { 
  mint:"#00C9A7", navy:"#0A1628", white:"#FFFFFF", gray:"#8899AA", 
  grayLight:"#E8EFF5", red:"#FF5E5E", blue:"#4D9EFF", offwhite:"#F4F9F8",
  yellow:"#FFD166", purple:"#9B72CF"
};

const S = {
  card:{ background:C.white,borderRadius:20,padding:16,marginBottom:12,boxShadow:"0 2px 12px rgba(0,0,0,0.06)" },
  label:{ fontSize:12,fontWeight:700,color:C.navy,marginBottom:6,display:"block" },
  input:{ width:"100%",background:C.offwhite,border:`1.5px solid ${C.grayLight}`,borderRadius:14,padding:"12px 16px",fontSize:14,color:C.navy,outline:"none",boxSizing:"border-box",marginBottom:12 },
  btn:(c,small)=>({ background:c,color:C.white,border:"none",borderRadius:small?10:14,padding:small?"6px 12px":"13px 20px",fontSize:small?12:14,fontWeight:700,cursor:"pointer",width:small?"auto":"100%",marginTop:small?0:8 }),
  badge:(c)=>({ background:c+"22",color:c,borderRadius:10,padding:"4px 10px",fontSize:11,fontWeight:700 }),
  modal:{ position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20 },
  modalContent:{ background:C.white,borderRadius:24,padding:24,maxWidth:600,width:"100%",maxHeight:"80vh",overflowY:"auto" },
};

const TREATMENT_PRESETS = [
  { name: "Tambal Gigi", price: 350000 },
  { name: "Konsultasi", price: 75000 },
  { name: "Scaling", price: 200000 },
  { name: "Cabut Gigi", price: 250000 },
  { name: "Rontgen", price: 120000 },
  { name: "Crown", price: 2500000 },
  { name: "Bleaching", price: 1500000 },
];

export default function InvoiceManagement() {
  const [invoices,setInvoices]=useState([]);
  const [patients,setPatients]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showCreateForm,setShowCreateForm]=useState(false);
  const [showPrintView,setShowPrintView]=useState(false);
  const [selectedInvoice,setSelectedInvoice]=useState(null);
  const [formData,setFormData]=useState({
    patientId:'',
    items:[]
  });
  const [newItem,setNewItem]=useState({ name:'',description:'',price:'' });
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    loadData();
  },[]);

  const loadData=async()=>{
    try{
      setLoading(true);
      const [invoicesRes,patientsRes]=await Promise.all([
        api.get('/invoices'),
        api.get('/users?role=PASIEN')
      ]);
      setInvoices(invoicesRes.data);
      setPatients(patientsRes.data);
    }catch(err){
      console.error(err);
    }finally{
      setLoading(false);
    }
  };

  const handleAddItem=()=>{
    if(!newItem.name||!newItem.price){
      alert('Nama dan harga item wajib diisi');
      return;
    }
    setFormData({
      ...formData,
      items:[...formData.items,{...newItem,price:parseFloat(newItem.price)}]
    });
    setNewItem({ name:'',description:'',price:'' });
  };

  const handleRemoveItem=(index)=>{
    const updated=[...formData.items];
    updated.splice(index,1);
    setFormData({...formData,items:updated});
  };

  const handlePresetClick=(preset)=>{
    setNewItem({name:preset.name,description:'',price:preset.price.toString()});
  };

  const handleSubmit=async()=>{
    if(!formData.patientId){
      alert('Pilih pasien terlebih dahulu');
      return;
    }
    if(formData.items.length===0){
      alert('Tambahkan minimal 1 item');
      return;
    }

    try{
      setSaving(true);
      await api.post('/invoices',formData);
      alert('✅ Invoice berhasil dibuat!');
      setShowCreateForm(false);
      setFormData({patientId:'',items:[]});
      loadData();
    }catch(err){
      alert('❌ Gagal: '+(err.response?.data?.error||'Unknown error'));
    }finally{
      setSaving(false);
    }
  };

  const handleMarkPaid=async(id)=>{
    if(!confirm('Tandai invoice ini sebagai sudah dibayar?')){
      return;
    }
    try{
      await api.patch(`/invoices/${id}/paid`);
      alert('✅ Invoice ditandai sudah dibayar');
      loadData();
    }catch(err){
      alert('❌ Gagal: '+(err.response?.data?.error||'Unknown error'));
    }
  };

  const handlePrint=async(id)=>{
    try{
      const res=await api.get(`/invoices/${id}`);
      setSelectedInvoice(res.data);
      setShowPrintView(true);
    }catch(err){
      alert('❌ Gagal load invoice');
    }
  };

  const totalAmount=formData.items.reduce((sum,item)=>sum+item.price,0);

  return(
    <div>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{fontSize:12,color:C.gray}}>
          Total: {invoices.length} invoice | Unpaid: {invoices.filter(i=>!i.isPaid).length}
        </div>
        <button style={S.btn(C.mint,false)} onClick={()=>setShowCreateForm(true)}>
          ➕ Buat Invoice
        </button>
      </div>

      {/* Invoice List */}
      {loading&&<div style={S.card}>Loading...</div>}

      {!loading&&invoices.length===0&&(
        <div style={S.card}>
          <div style={{textAlign:"center",color:C.gray,padding:"20px 0"}}>
            <div style={{fontSize:40,marginBottom:10}}>💰</div>
            <div style={{fontSize:14}}>Belum ada invoice</div>
          </div>
        </div>
      )}

      {!loading&&invoices.map(inv=>(
  <div key={inv.id} style={S.card}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{inv.invoiceNumber}</div>
        <div style={{fontSize:12,color:C.gray,marginTop:2}}>
          {inv.patient?.name} · {new Date(inv.createdAt).toLocaleDateString('id-ID')}
        </div>
      </div>
      <span style={S.badge(inv.isPaid?C.mint:C.orange)}>
        {inv.isPaid?'✓ Lunas':'💳 Belum Bayar'}
      </span>
    </div>
    
    <div style={{fontSize:16,fontWeight:800,color:C.mint,marginTop:6}}>
      Rp {inv.total.toLocaleString('id-ID')}
    </div>

    {inv.isPaid&&inv.paidAt&&(
      <div style={{fontSize:11,color:C.gray,marginTop:4}}>
        Dibayar: {new Date(inv.paidAt).toLocaleDateString('id-ID')}
      </div>
    )}

    <div style={{display:"flex",gap:6,marginTop:8}}>
      <button style={S.btn(C.blue,true)} onClick={()=>handlePrint(inv.id)}>
        🖨️ Print
      </button>
      {!inv.isPaid&&(
        <button style={S.btn(C.mint,true)} onClick={()=>handleMarkPaid(inv.id)}>
          ✓ Tandai Lunas
        </button>
      )}
    </div>
  </div>
))}
      

      {/* Create Invoice Modal */}
      {showCreateForm&&(
        <div style={S.modal} onClick={()=>setShowCreateForm(false)}>
          <div style={S.modalContent} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:18,fontWeight:800,color:C.navy,marginBottom:16}}>
              ➕ Buat Invoice Baru
            </h3>

            <label style={S.label}>Pilih Pasien *</label>
            <select style={S.input} value={formData.patientId} onChange={e=>setFormData({...formData,patientId:e.target.value})}>
              <option value="">-- Pilih Pasien --</option>
              {patients.map(p=>(
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            {/* Treatment Presets */}
            <label style={S.label}>Quick Add (Klik untuk isi otomatis)</label>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {TREATMENT_PRESETS.map(preset=>(
                <button
                  key={preset.name}
                  onClick={()=>handlePresetClick(preset)}
                  style={{
                    background:C.offwhite,
                    border:`1px solid ${C.grayLight}`,
                    borderRadius:10,
                    padding:"6px 12px",
                    fontSize:11,
                    fontWeight:600,
                    color:C.navy,
                    cursor:"pointer"
                  }}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Add Item Form */}
            <label style={S.label}>Tambah Item</label>
            <input 
              style={{...S.input,marginBottom:6}} 
              placeholder="Nama treatment (contoh: Tambal Gigi)"
              value={newItem.name}
              onChange={e=>setNewItem({...newItem,name:e.target.value})}
            />
            <input 
              style={{...S.input,marginBottom:6}} 
              placeholder="Deskripsi (opsional)"
              value={newItem.description}
              onChange={e=>setNewItem({...newItem,description:e.target.value})}
            />
            <input 
              style={{...S.input,marginBottom:6}} 
              type="number"
              placeholder="Harga (contoh: 350000)"
              value={newItem.price}
              onChange={e=>setNewItem({...newItem,price:e.target.value})}
            />
            <button style={S.btn(C.blue,false)} onClick={handleAddItem}>
              ➕ Tambah ke Invoice
            </button>

            {/* Items List */}
            {formData.items.length>0&&(
              <>
                <div style={{...S.label,marginTop:16,marginBottom:8}}>Items ({formData.items.length}):</div>
                {formData.items.map((item,idx)=>(
                  <div key={idx} style={{background:C.offwhite,borderRadius:10,padding:10,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:C.navy}}>{item.name}</div>
                      {item.description&&<div style={{fontSize:11,color:C.gray}}>{item.description}</div>}
                      <div style={{fontSize:12,color:C.mint,fontWeight:700,marginTop:2}}>
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <button 
                      onClick={()=>handleRemoveItem(idx)}
                      style={{background:C.red,color:C.white,border:"none",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:700,cursor:"pointer"}}
                    >
                      🗑️
                    </button>
                  </div>
                ))}

                <div style={{background:C.navy,color:C.white,borderRadius:10,padding:12,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:700}}>TOTAL</span>
                  <span style={{fontSize:18,fontWeight:800}}>Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
              </>
            )}

            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button 
                style={{...S.btn(C.grayLight,false),color:C.navy,flex:1}} 
                onClick={()=>setShowCreateForm(false)}
              >
                Batal
              </button>
              <button 
                style={{...S.btn(saving?C.gray:C.mint,false),flex:1}} 
                onClick={handleSubmit}
                disabled={saving||!formData.patientId||formData.items.length===0}
              >
                {saving?'Membuat...':'✅ Buat Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print View Modal */}
      {showPrintView&&selectedInvoice&&(
        <div style={S.modal} onClick={()=>setShowPrintView(false)}>
          <div style={{...S.modalContent,maxWidth:800}} onClick={e=>e.stopPropagation()}>
            <div id="invoice-print-area" style={{padding:20,background:C.white}}>
              {/* Header */}
              <div style={{textAlign:"center",marginBottom:20,borderBottom:`2px solid ${C.navy}`,paddingBottom:16}}>
                <h1 style={{fontSize:28,fontWeight:800,color:C.navy,marginBottom:4}}>🦷 DentalCare Clinic</h1>
                <p style={{fontSize:12,color:C.gray}}>Jl. Sudirman No. 123, Jakarta | Tel: (021) 12345678</p>
              </div>

              {/* Invoice Info */}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                <div>
                  <div style={{fontSize:11,color:C.gray}}>Invoice To:</div>
                  <div style={{fontSize:15,fontWeight:700,color:C.navy}}>{selectedInvoice.patient?.name}</div>
                  <div style={{fontSize:12,color:C.gray}}>{selectedInvoice.patient?.email}</div>
                  {selectedInvoice.patient?.phone&&<div style={{fontSize:12,color:C.gray}}>{selectedInvoice.patient.phone}</div>}
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:16,fontWeight:800,color:C.navy}}>{selectedInvoice.invoiceNumber}</div>
                  <div style={{fontSize:11,color:C.gray}}>Tanggal: {new Date(selectedInvoice.createdAt).toLocaleDateString('id-ID')}</div>
                  <div style={{marginTop:4}}>
                    <span style={S.badge(selectedInvoice.isPaid?C.mint:C.orange)}>
                      {selectedInvoice.isPaid?'✓ LUNAS':'BELUM BAYAR'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table style={{width:"100%",borderCollapse:"collapse",marginBottom:20}}>
                <thead>
                  <tr style={{background:C.navy,color:C.white}}>
                    <th style={{padding:10,textAlign:"left",fontSize:12}}>Item</th>
                    <th style={{padding:10,textAlign:"left",fontSize:12}}>Deskripsi</th>
                    <th style={{padding:10,textAlign:"right",fontSize:12}}>Harga</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item,idx)=>(
                    <tr key={idx} style={{borderBottom:`1px solid ${C.grayLight}`}}>
                      <td style={{padding:10,fontSize:13,fontWeight:600}}>{item.name}</td>
                      <td style={{padding:10,fontSize:12,color:C.gray}}>{item.description||'-'}</td>
                      <td style={{padding:10,fontSize:13,textAlign:"right"}}>Rp {item.price.toLocaleString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div style={{textAlign:"right",marginBottom:20}}>
                <div style={{fontSize:14,color:C.gray,marginBottom:4}}>Subtotal: Rp {selectedInvoice.total.toLocaleString('id-ID')}</div>
                <div style={{fontSize:20,fontWeight:800,color:C.navy}}>
                  TOTAL: Rp {selectedInvoice.total.toLocaleString('id-ID')}
                </div>
              </div>

              {/* Footer */}
              <div style={{borderTop:`1px solid ${C.grayLight}`,paddingTop:12,fontSize:11,color:C.gray,textAlign:"center"}}>
                Terima kasih atas kepercayaan Anda. Semoga lekas sembuh! 🙏
              </div>
            </div>

            <div style={{display:"flex",gap:8,marginTop:16}}>
              <button 
                style={{...S.btn(C.grayLight,false),color:C.navy,flex:1}} 
                onClick={()=>setShowPrintView(false)}
              >
                Tutup
              </button>
              <button 
                style={{...S.btn(C.blue,false),flex:1}} 
                onClick={()=>window.print()}
              >
                🖨️ Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}