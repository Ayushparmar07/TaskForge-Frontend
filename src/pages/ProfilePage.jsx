import { useState } from 'react';
import { FiUser, FiMail, FiSave, FiShield, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { updateProfileApi } from '../api/user.api';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';
import { format } from 'date-fns';

export default function ProfilePage() {
  const { user, loadUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setLoading(true);
    try {
      await updateProfileApi(form);
      await loadUser();
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Profile</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account information.</p>
      </div>

      {/* Avatar card */}
      <div className="card flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-slate-100 text-lg">{user?.name}</p>
          <p className="text-slate-400 text-sm">{user?.email}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge label={user?.role} type={user?.role} />
            <Badge label={user?.isActive ? 'Active' : 'Inactive'} type={user?.isActive ? 'active' : 'cancelled'} />
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-100 mb-4">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                className="input-field pl-9"
                maxLength={50}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="email"
                value={user?.email}
                disabled
                className="input-field pl-9 opacity-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Email cannot be changed.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            <FiSave size={15} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-100 mb-3">Account Info</h2>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-2"><FiShield size={14} /> Role</span>
            <Badge label={user?.role} type={user?.role} />
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-800">
            <span className="text-slate-400 flex items-center gap-2"><FiCalendar size={14} /> Member since</span>
            <span className="text-slate-300 text-xs">
              {user?.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">User ID</span>
            <span className="text-slate-500 text-xs font-mono truncate max-w-[160px]">{user?._id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
