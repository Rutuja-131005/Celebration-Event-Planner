import React, { useState } from 'react';
import { authService } from '../services/auth.ts';
import { User } from '../../server/models/types.ts';
import { Modal } from './Modal.tsx';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onAuthSuccess,
  onLogout,
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('rutuja@atelier.com');
  const [password, setPassword] = useState('atelier2025');
  const [role, setRole] = useState('Lead Planner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        const res = await authService.register(name, email, password, role);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        }
      } else {
        const res = await authService.login(email, password);
        if (res.success && res.user) {
          onAuthSuccess(res.user);
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const titleText = currentUser
    ? 'Atelier Lead Account'
    : isRegister
    ? 'Planner Registration'
    : 'Atelier Sign In';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="auth-modal-title"
      descriptionId="auth-modal-desc"
      maxWidthClass="max-w-md"
    >
      <div className="flex items-center justify-between pb-space-xs border-b border-outline-variant/30">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[24px]" aria-hidden="true">
            shield_person
          </span>
          <h3 id="auth-modal-title" className="font-headline-sm text-headline-sm text-primary">
            {titleText}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-outline hover:text-primary transition-colors cursor-pointer rounded-lg p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          type="button"
          aria-label="Close authentication dialog"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            close
          </span>
        </button>
      </div>

      {currentUser ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-low">
            <img
              src={currentUser.avatarUrl}
              alt={`${currentUser.name}'s profile avatar`}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <p className="font-title-md text-title-md text-primary font-bold">{currentUser.name}</p>
              <p className="text-xs text-outline font-medium">{currentUser.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-tertiary-fixed text-on-tertiary-fixed">
                Role: {currentUser.role}
              </span>
            </div>
          </div>

          <p id="auth-modal-desc" className="text-xs text-on-surface-variant">
            You are authenticated with local RBAC and session token stored securely.
          </p>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-error-container text-on-error-container hover:bg-error hover:text-on-error text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-error"
            >
              Log Out
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate={false}>
          <p id="auth-modal-desc" className="sr-only">
            Sign in to access planning tools or register a new planner account.
          </p>

          {error && (
            <div
              id="auth-error-msg"
              role="alert"
              aria-live="polite"
              className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-medium"
            >
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label htmlFor="auth-name" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                placeholder="e.g. Rutuja Jadhav"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'auth-error-msg' : undefined}
              placeholder="e.g. rutuja@atelier.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              aria-invalid={!!error}
              aria-describedby={error ? 'auth-error-msg' : undefined}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm"
            />
          </div>

          {isRegister && (
            <div>
              <label htmlFor="auth-role" className="block text-xs font-semibold uppercase tracking-wider text-outline mb-1">
                Planner Specialty Role
              </label>
              <select
                id="auth-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-surface-container-low px-3 py-2 rounded-xl text-on-surface border border-outline-variant/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-sm cursor-pointer"
              >
                <option value="Event Planner">Event Planner</option>
                <option value="Client">Client / Host</option>
              </select>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-xs text-primary hover:underline font-semibold cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New to Atelier? Register'}
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-primary text-on-primary text-sm font-semibold transition-all hover:bg-primary-container disabled:opacity-50 cursor-pointer shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {loading ? 'Validating...' : isRegister ? 'Register' : 'Sign In'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
