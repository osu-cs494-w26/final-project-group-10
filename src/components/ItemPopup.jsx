// Popup grid for picking a held item.

import React, { useState } from 'react';
import { ITEMS } from '../utils/constants.js';

export default function ItemPopup({ onClose, onSelect, selectedItem }) {
  const [search, setSearch] = useState('');
  const filtered = ITEMS.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:300 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'var(--grey-900)', border:'1px solid var(--border-lt)', width:'360px', maxHeight:'500px', display:'flex', flexDirection:'column', animation:'popIn 0.25s ease both' }}>
        <div style={{ borderBottom:'1px solid var(--border)', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'16px', letterSpacing:'0.1em', textTransform:'uppercase' }}>Select Item</span>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--grey-500)', cursor:'pointer', fontSize:'18px' }}>x</button>
        </div>
        <div style={{ padding:'10px', borderBottom:'1px solid var(--border)' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." autoFocus style={{ width:'100%', background:'var(--grey-800)', border:'1px solid var(--border-mid)', padding:'8px 10px', color:'var(--white)', fontSize:'13px', fontFamily:'var(--font-mono)', outline:'none' }} />
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {filtered.map(item => {
            const isSel = selectedItem?.name === item.name || selectedItem === item.name;
            return (
              <div key={item.name} onClick={() => { onSelect(item); onClose(); }} style={{ padding:'10px 16px', cursor:'pointer', borderBottom:'1px solid var(--border)', background: isSel ? 'var(--grey-700)' : 'transparent', transition:'background 0.1s' }}
                onMouseEnter={e => { if(!isSel) e.currentTarget.style.background = 'var(--grey-800)'; }}
                onMouseLeave={e => { if(!isSel) e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:'14px' }}>{item.name}</span>
                  {isSel && <span style={{ fontFamily:'var(--font-mono)', fontSize:'10px', color:'var(--grey-300)' }}>selected</span>}
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:'11px', color:'var(--grey-500)', marginTop:'3px' }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
