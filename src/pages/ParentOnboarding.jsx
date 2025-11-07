import React, { useEffect, useMemo, useState } from 'react'
import ParentForm from '../components/ParentForm'
import ChildForm from '../components/ChildForm'
import { parentApi } from '../api/parentApi'

export default function ParentOnboarding() {
  const [parent, setParent] = useState({
    name: '',
    phone: '',
    country: '',
    city: '',
    father_age: '',
    mother_age: '',
    married_since: '',
    is_single_parent: false,
  })
  const [children, setChildren] = useState([{ 
    name: '', 
    username: '',
    password: '',
    age: '', 
    gender: '', 
    school: '', 
    class_name: '', 
    temperament: '' 
  }])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userId, setUserId] = useState(null)
  const [parentId, setParentId] = useState(null)

  // Prefill from Google user info and call google-login API
  useEffect(() => {
    const initOnboarding = async () => {
      try {
        const info = localStorage.getItem('user_info')
        const token = localStorage.getItem('access_token')
        
        if (info && token) {
          const user = JSON.parse(info)
          setParent((p) => ({ ...p, name: user.name || p.name }))
          
          // Step 1: Call google-login API to get user_id
          try {
            const googleLoginData = {
              google_uid: user.sub || user.id || user.uid,
              email: user.email,
              name: user.name
            }
            const response = await parentApi.googleLogin(googleLoginData)
            setUserId(response.user_id)
            
            // Check if user has completed full onboarding (has parent profile AND children)
            if (!response.is_new_user && response.has_parent_profile && response.has_children) {
              // User has completed onboarding - redirect to dashboard
              localStorage.setItem('onboarding_completed', 'true')
              window.location.replace('/dashboard')
            } else {
              // New user OR incomplete onboarding - show onboarding form
              localStorage.removeItem('onboarding_completed')
            }
          } catch (err) {
            console.error('Google login API error:', err)
            setError('Failed to initialize onboarding. Please try logging in again.')
          }
        }
      } catch (err) {
        console.error('Failed to parse user info:', err)
      }
    }
    
    initOnboarding()
  }, [])

  const addChild = () => setChildren((prev) => [...prev, { name: '', username: '', password: '', age: '', gender: '', school: '', class_name: '', temperament: '' }])
  const removeChild = (idx) => setChildren((prev) => prev.filter((_, i) => i !== idx))
  const updateChild = (idx, data) => setChildren((prev) => prev.map((c, i) => (i === idx ? data : c)))

  const validate = useMemo(() => {
    const requiredParent = ['name', 'phone', 'country', 'city', 'father_age', 'mother_age', 'married_since']
    const parentValid = requiredParent.every((k) => String(parent[k] || '').trim().length > 0)
    const childrenValid = children.length > 0 && children.every((c) => c.name && c.username && c.password && c.age !== '' && c.gender && c.temperament)
    return parentValid && childrenValid && userId // Also ensure we have user_id from step 1
  }, [parent, children, userId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validate) {
      setError('Please fill all required fields (parent info and each child\'s required fields).')
      return
    }

    if (!userId) {
      setError('User ID not found. Please try logging in again.')
      return
    }

    setSubmitting(true)
    try {
      // Step 2: Register parent with user_id
      const parentData = {
        user_id: userId,
        phone: parent.phone,
        country: parent.country,
        city: parent.city,
        father_age: parseInt(parent.father_age),
        mother_age: parseInt(parent.mother_age),
        married_since: parseInt(parent.married_since),
        is_single_parent: parent.is_single_parent
      }
      
      const parentResponse = await parentApi.registerParent(parentData)
      const registeredParentId = parentResponse.parent_id
      setParentId(registeredParentId)
      
      // Step 3: Add all children with parent_id
      const childrenData = {
        parent_id: registeredParentId,
        children: children.map(child => ({
          username: child.username,
          password: child.password,
          name: child.name,
          age: parseInt(child.age),
          gender: child.gender,
          school: child.school || null,
          class_name: child.class_name || null,
          temperament: child.temperament
        }))
      }
      
      await parentApi.addChildren(childrenData)

      setSuccess('Onboarding completed successfully!')
      localStorage.setItem('onboarding_completed', 'true')
      // Redirect to dashboard route required by spec
      setTimeout(() => {
        window.location.assign('/dashboard')
      }, 1000)
    } catch (err) {
      console.error(err)
      const errorMessage = err?.response?.data?.detail || err?.response?.data?.message || err?.message || 'Failed to submit onboarding data'
      
      // Check for duplicate username error
      if (errorMessage.toLowerCase().includes('username') && errorMessage.toLowerCase().includes('exists')) {
        setError('A username you entered already exists. Please choose different usernames for your children.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8E1] to-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white/95 rounded-3xl shadow-xl p-6 md:p-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#2D5F3F]">Parent Onboarding</h1>
          <p className="text-gray-600">Tell us about your family to personalize your experience.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 border border-green-200">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-3">Parent Information</h2>
            <ParentForm parent={parent} onChange={setParent} />
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-medium text-gray-800">Children</h2>
              <button type="button" onClick={addChild} className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] text-[#2D5F3F] font-medium">+ Add Child</button>
            </div>
            <div className="space-y-4">
              {children.map((child, idx) => (
                <ChildForm key={idx} index={idx} child={child} onChange={updateChild} onRemove={removeChild} />
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-11 rounded-xl bg-gradient-to-r from-[#A8E6CF] to-[#8BD4AE] text-[#2D5F3F] font-semibold shadow-md disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Finish Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
