import React from 'react'

export default function ParentForm({ parent, onChange }) {
  const handle = (key, value) => onChange({ ...parent, [key]: value })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Full Name *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="text"
            value={parent.name || ''}
            onChange={(e) => handle('name', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Phone Number *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="tel"
            value={parent.phone || ''}
            onChange={(e) => handle('phone', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Country *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="text"
            value={parent.country || ''}
            onChange={(e) => handle('country', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">City *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="text"
            value={parent.city || ''}
            onChange={(e) => handle('city', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Father Age *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="number"
            min="18"
            value={parent.father_age || ''}
            onChange={(e) => handle('father_age', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Mother Age *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="number"
            min="18"
            value={parent.mother_age || ''}
            onChange={(e) => handle('mother_age', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Married Since (years) *</label>
          <input
            className="w-full h-11 rounded-lg border border-gray-300 px-3"
            type="number"
            min="0"
            value={parent.married_since || ''}
            onChange={(e) => handle('married_since', e.target.value)}
            required
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            id="is_single_parent"
            className="h-5 w-5"
            type="checkbox"
            checked={!!parent.is_single_parent}
            onChange={(e) => handle('is_single_parent', e.target.checked)}
          />
          <label htmlFor="is_single_parent" className="text-sm text-gray-700">Single Parent?</label>
        </div>
      </div>
    </div>
  )
}
