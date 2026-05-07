import { useEffect, useState } from 'react';
import { FiUsers, FiSearch, FiShield, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { getAllUsersApi, updateUserRoleApi, toggleUserStatusApi } from '../../api/user.api';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsersApi();
      setUsers(data.data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await updateUserRoleApi(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? data.data : u)));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const { data } = await toggleUserStatusApi(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isActive: data.data.isActive } : u))
      );
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter ? u.role === roleFilter : true;
    return matchSearch && matchRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-purple-600/20 flex items-center justify-center">
          <FiShield size={16} className="text-purple-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="input-field sm:w-36"
        >
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FiUsers size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300 font-medium">No users found</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h, i) => (
                    <th
                      key={h}
                      className={`px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider ${
                        i === 4 ? 'text-right' : 'text-left'
                      }`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        className="text-xs bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        aria-label={`Change role for ${u.name}`}
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        label={u.isActive ? 'Active' : 'Inactive'}
                        type={u.isActive ? 'active' : 'cancelled'}
                      />
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u._id)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${
                          u.isActive
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-green-400 hover:text-green-300'
                        }`}
                        aria-label={u.isActive ? `Deactivate ${u.name}` : `Activate ${u.name}`}
                      >
                        {u.isActive ? (
                          <><FiToggleRight size={14} /> Deactivate</>
                        ) : (
                          <><FiToggleLeft size={14} /> Activate</>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
