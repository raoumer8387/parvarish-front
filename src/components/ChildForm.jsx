import React from 'react'

const TEMPERAMENTS = ['Calm', 'Active', 'Aggressive', 'Shy', 'Curious', 'Sensitive']

export default function ChildForm({ index, child, onChange, onRemove, hideHeader = false }) {
  const handle = (key, value) => onChange(index, { ...child, [key]: value })

  return (
    <div className="p-4 border border-gray-200 rounded-xl bg-white">
      {!hideHeader && (
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-gray-700 font-medium">Child {index + 1}</h4>
          {onRemove && <button type="button" onClick={() => onRemove(index)} className="text-red-600 text-sm">− Remove</button>}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Name *</label>
          <input className="w-full h-11 rounded-lg border border-gray-300 px-3" value={child.name || ''} onChange={(e) => handle('name', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Username *</label>
          <input 
            className="w-full h-11 rounded-lg border border-gray-300 px-3" 
            placeholder="e.g., ali_child" 
            value={child.username || ''} 
            onChange={(e) => handle('username', e.target.value)} 
            autoComplete="off"
            required 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Password *</label>
          <input 
            type="password" 
            className="w-full h-11 rounded-lg border border-gray-300 px-3" 
            placeholder="Child login password" 
            value={child.password || ''} 
            onChange={(e) => handle('password', e.target.value)} 
            autoComplete="new-password"
            required 
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Age *</label>
          <input type="number" min="0" className="w-full h-11 rounded-lg border border-gray-300 px-3" value={child.age || ''} onChange={(e) => handle('age', e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Gender *</label>
          <select className="w-full h-11 rounded-lg border border-gray-300 px-3" value={child.gender || ''} onChange={(e) => handle('gender', e.target.value)} required>
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">School</label>
          <input className="w-full h-11 rounded-lg border border-gray-300 px-3" value={child.school || ''} onChange={(e) => handle('school', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Class</label>
          <input className="w-full h-11 rounded-lg border border-gray-300 px-3" value={child.class_name || ''} onChange={(e) => handle('class_name', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Temperament *</label>
          <select className="w-full h-11 rounded-lg border border-gray-300 px-3" value={child.temperament || ''} onChange={(e) => handle('temperament', e.target.value)} required>
            <option value="">Select</option>
            {TEMPERAMENTS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
