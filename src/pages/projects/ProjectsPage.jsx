import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder, FiSearch, FiAlertTriangle } from 'react-icons/fi';
import { useProjects } from '../../context/ProjectContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import ProjectForm from '../../components/projects/ProjectForm';

export default function ProjectsPage() {
  const { projects, loading, fetchProjects, createProject } = useProjects();
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter ? p.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (data) => {
    setSubmitting(true);
    try {
      await createProject(data);
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Projects</h1>
          <p className="text-slate-400 text-sm mt-0.5">{projects.length} total projects</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field sm:w-44"
        >
          <option value="">All statuses</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse space-y-3">
              <div className="flex justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="w-16 h-5 rounded-full bg-slate-800" />
              </div>
              <div className="h-4 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-full" />
              <div className="h-3 bg-slate-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16">
          <FiFolder size={40} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-300 font-medium">No projects found</p>
          <p className="text-slate-500 text-sm mt-1">
            {search || statusFilter
              ? 'Try adjusting your filters.'
              : isAdmin
              ? 'Create your first project to get started.'
              : 'No projects have been assigned to you yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const pct =
              project.taskCount > 0
                ? Math.round((project.completedCount / project.taskCount) * 100)
                : 0;
            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="card hover:border-slate-700 hover:bg-slate-800/50 transition-all group flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                    <FiFolder size={18} className="text-blue-400" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap justify-end">
                    <Badge label={project.status} type={project.status} />
                    <Badge label={project.priority} type={project.priority} />
                  </div>
                </div>

                <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors mb-1 truncate">
                  {project.name}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3 flex-1">
                  {project.description || 'No description provided.'}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>{project.taskCount ?? 0} tasks · {project.completedCount ?? 0} done</span>
                  {project.overdueCount > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                      <FiAlertTriangle size={10} /> {project.overdueCount} overdue
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{pct}% complete</p>
              </Link>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Project">
          <ProjectForm
            onSubmit={handleCreate}
            loading={submitting}
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
}
