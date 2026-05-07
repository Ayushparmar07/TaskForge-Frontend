import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFolder, FiCheckSquare, FiClock, FiCheckCircle,
  FiAlertTriangle, FiUser, FiTrendingUp, FiActivity,
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { getDashboardStatsApi } from '../api/task.api';
import { getProjectsApi } from '../api/project.api';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { format, parseISO } from 'date-fns';

const PIE_COLORS = ['#64748b', '#eab308', '#a855f7', '#22c55e'];

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const inner = (
    <div className={`card flex items-center gap-4 ${to ? 'hover:border-slate-700 transition-colors cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value ?? 0}</p>
        <p className="text-sm text-slate-400">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

const SkeletonCard = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-slate-800" />
      <div className="space-y-2">
        <div className="h-6 w-16 bg-slate-800 rounded" />
        <div className="h-4 w-24 bg-slate-800 rounded" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          getDashboardStatsApi(),
          getProjectsApi(),
        ]);
        setStats(statsRes.data.data);
        setRecentProjects(projectsRes.data.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build pie chart data from stats
  const pieData = stats
    ? [
        { name: 'To Do', value: stats.todoTasks },
        { name: 'In Progress', value: stats.inProgressTasks },
        { name: 'In Review', value: stats.inReviewTasks },
        { name: 'Done', value: stats.doneTasks },
      ].filter((d) => d.value > 0)
    : [];

  // Build bar chart from completion trend — guard against empty/invalid dates
  const barData = (stats?.completionTrend ?? []).map((d) => {
    try {
      return { date: format(parseISO(d._id), 'MMM d'), completed: d.count };
    } catch {
      return { date: d._id, completed: d.count };
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          {isAdmin ? 'Admin overview — all projects and tasks.' : 'Your personal task overview.'}
        </p>
      </div>

      {/* Primary stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={FiFolder} label="Total Projects" value={stats?.totalProjects} color="bg-blue-600/20 text-blue-400" to="/projects" />
            <StatCard icon={FiCheckSquare} label="Total Tasks" value={stats?.totalTasks} color="bg-purple-600/20 text-purple-400" />
            <StatCard icon={FiClock} label="In Progress" value={stats?.inProgressTasks} color="bg-yellow-600/20 text-yellow-400" />
            <StatCard icon={FiCheckCircle} label="Completed" value={stats?.doneTasks} color="bg-green-600/20 text-green-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={FiFolder} label="Active Projects" value={stats?.activeProjects} color="bg-green-600/20 text-green-400" />
            <StatCard icon={FiUser} label="Assigned to Me" value={stats?.myTasks} color="bg-orange-600/20 text-orange-400" to="/tasks" />
            <StatCard
              icon={FiAlertTriangle}
              label="Overdue Tasks"
              value={stats?.overdueTasks}
              color={stats?.overdueTasks > 0 ? 'bg-red-600/20 text-red-400' : 'bg-slate-600/40 text-slate-400'}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Task status pie */}
            <div className="card">
              <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <FiActivity size={16} className="text-blue-400" />
                Task Status Breakdown
              </h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f1f5f9' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No tasks yet</div>
              )}
            </div>

            {/* Completion trend bar */}
            <div className="card">
              <h2 className="text-base font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <FiTrendingUp size={16} className="text-green-400" />
                Tasks Completed (Last 7 Days)
              </h2>
              {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f1f5f9' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No completions in last 7 days</div>
              )}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-100">Recent Projects</h2>
              <Link to="/projects" className="text-sm text-blue-400 hover:text-blue-300">
                View all →
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FiFolder size={32} className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-400 text-sm">No projects yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentProjects.map((project) => {
                  const pct = project.taskCount > 0
                    ? Math.round((project.completedCount / project.taskCount) * 100)
                    : 0;
                  return (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                        <FiFolder size={14} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-100 truncate">{project.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-slate-500 flex-shrink-0">{pct}%</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <Badge label={project.status} type={project.status} />
                        {project.overdueCount > 0 && (
                          <span className="badge bg-red-900/50 text-red-400">
                            {project.overdueCount} overdue
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
