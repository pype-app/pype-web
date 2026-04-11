import { useAuthStore } from '@/store/auth'
import { renderHook, act } from '@testing-library/react'
import { TenantPlan, UserRole } from '@/types'

// Mock da API
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}))

describe('AuthStore', () => {
  const mockTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    subdomain: 'test-tenant',
    plan: TenantPlan.Pro,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    limits: {
      maxUsers: 10,
      maxPipelines: 50,
      maxExecutionsPerMonth: 10000,
    },
  }

  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout()
    jest.clearAllMocks()
  })

  it('should have initial state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.tenant).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.refreshToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should set tokens correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    
    act(() => {
      result.current.setTokens('access-token', 'refresh-token', '2024-12-31T23:59:59Z')
    })
    
    expect(result.current.accessToken).toBe('access-token')
    expect(result.current.refreshToken).toBe('refresh-token')
    expect(result.current.expiresAt).toBe('2024-12-31T23:59:59Z')
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should set user correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.User,
      emailConfirmed: true,
      createdAt: '2024-01-01T00:00:00Z',
      tenant: mockTenant,
    }
    
    act(() => {
      result.current.setUser(mockUser)
    })
    
    expect(result.current.user).toEqual(mockUser)
  })

  it('should clear error', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set an error first
    act(() => {
      result.current.logout()
      // Manually set error for testing
      useAuthStore.setState({ error: 'Some error' })
    })
    
    expect(result.current.error).toBe('Some error')
    
    act(() => {
      result.current.clearError()
    })
    
    expect(result.current.error).toBeNull()
  })

  it('should logout correctly', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set some state first
    act(() => {
      result.current.setTokens('access-token', 'refresh-token', '2024-12-31T23:59:59Z')
      result.current.setUser({
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.User,
        emailConfirmed: true,
        createdAt: '2024-01-01T00:00:00Z',
        tenant: mockTenant,
      })
    })
    
    // Logout
    act(() => {
      result.current.logout()
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.tenant).toBeNull()
    expect(result.current.accessToken).toBeNull()
    expect(result.current.refreshToken).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('should check auth with valid token', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set a future expiry date
    const futureDate = new Date()
    futureDate.setHours(futureDate.getHours() + 1)
    
    act(() => {
      result.current.setTokens('access-token', 'refresh-token', futureDate.toISOString())
    })
    
    act(() => {
      result.current.checkAuth()
    })
    
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should check auth with expired token', () => {
    const { result } = renderHook(() => useAuthStore())
    
    // Set a past expiry date
    const pastDate = new Date()
    pastDate.setHours(pastDate.getHours() - 1)
    
    act(() => {
      result.current.setTokens('access-token', 'refresh-token', pastDate.toISOString())
    })
    
    act(() => {
      result.current.checkAuth()
    })
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.accessToken).toBeNull()
    expect(result.current.refreshToken).toBeNull()
  })
})