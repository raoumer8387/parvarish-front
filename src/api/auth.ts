export type UserType = 'parent' | 'child' | null;

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getUserInfo<T = any>(): T | null {
  try {
    const raw = localStorage.getItem('user_info');
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function getUserType(): UserType {
  const info = getUserInfo<any>();
  const t = info?.user_type;
  if (t === 'parent' || t === 'child') return t;
  return null;
}

export function getChildId(): number | null {
  const info = getUserInfo<any>();
  console.log('getChildId - user_info:', info);
  
  // Try multiple possible locations for child_id
  const id = info?.child_id ?? info?.child?.id ?? info?.profile?.child_id ?? info?.id;
  
  console.log('getChildId - extracted id:', id);
  
  // If no ID found in user_info, try to decode JWT token
  if (!id || typeof id !== 'number') {
    const token = getAccessToken();
    if (token) {
      try {
        // JWT tokens have 3 parts: header.payload.signature
        const payload = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payload));
        console.log('getChildId - JWT payload:', decodedPayload);
        
        // The 'sub' field in JWT usually contains the user ID
        const jwtId = decodedPayload.sub ? parseInt(decodedPayload.sub) : null;
        console.log('getChildId - from JWT sub:', jwtId);
        
        return jwtId;
      } catch (e) {
        console.error('Failed to decode JWT:', e);
      }
    }
  }
  
  return typeof id === 'number' ? id : null;
}
