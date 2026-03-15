/**
 * @fileoverview Auth Service - User Authentication
 * @module @kernel/services/auth
 */

import type { IService, ServiceStatus, Subscription } from '../types';

export interface User {
  id: string;
  username: string;
  displayName: string;
  role: 'root' | 'admin' | 'user' | 'guest';
  homeDir: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Session {
  id: string;
  userId: string;
  loginTime: Date;
  expiresAt?: Date;
  isTemporary: boolean;
}

export interface LoginResult {
  success: boolean;
  session?: Session;
  error?: string;
}

/**
 * AuthService handles user authentication
 */
export class AuthService implements IService {
  readonly name = 'auth';
  readonly version = '1.0.0';
  
  private status: ServiceStatus = 'stopped';
  private currentUser: User | null = null;
  private currentSession: Session | null = null;
  private users = new Map<string, User>();
  private sessions = new Map<string, Session>();
  private listeners: Set<() => void> = new Set();
  
  async init(): Promise<void> {
    this.status = 'starting';
    // Initialize from storage
    this.status = 'running';
  }
  
  async destroy(): Promise<void> {
    this.status = 'stopping';
    this.logout();
    this.status = 'stopped';
  }
  
  isReady(): boolean {
    return this.status === 'running';
  }
  
  getStatus(): ServiceStatus {
    return this.status;
  }
  
  // User management
  createUser(username: string, password: string, options?: Partial<User>): User {
    const user: User = {
      id: `user-${Date.now()}`,
      username,
      displayName: options?.displayName ?? username,
      role: options?.role ?? 'user',
      homeDir: options?.homeDir ?? `/home/${username}`,
      createdAt: new Date(),
    };
    
    this.users.set(user.id, user);
    this.notifyListeners();
    
    return user;
  }
  
  getUser(userId: string): User | null {
    return this.users.get(userId) ?? null;
  }
  
  getUserByUsername(username: string): User | null {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return null;
  }
  
  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }
  
  deleteUser(userId: string): boolean {
    const result = this.users.delete(userId);
    if (result) this.notifyListeners();
    return result;
  }
  
  // Authentication
  async login(username: string, password: string): Promise<LoginResult> {
    const user = this.getUserByUsername(username);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // In real implementation, verify password hash
    const session: Session = {
      id: `session-${Date.now()}`,
      userId: user.id,
      loginTime: new Date(),
      isTemporary: false,
    };
    
    this.currentSession = session;
    this.currentUser = user;
    this.sessions.set(session.id, session);
    
    user.lastLogin = new Date();
    this.notifyListeners();
    
    return { success: true, session };
  }
  
  logout(): void {
    if (this.currentSession) {
      this.sessions.delete(this.currentSession.id);
    }
    this.currentSession = null;
    this.currentUser = null;
    this.notifyListeners();
  }
  
  getCurrentUser(): User | null {
    return this.currentUser;
  }
  
  getCurrentSession(): Session | null {
    return this.currentSession;
  }
  
  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }
  
  // Events
  subscribe(listener: () => void): Subscription {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    this.listeners.forEach(l => {
      try { l(); } catch (e) { console.error('[AuthService] Listener error:', e); }
    });
  }
}

// Singleton instance
export const authService = new AuthService();
