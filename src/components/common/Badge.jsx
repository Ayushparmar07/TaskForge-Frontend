const colorMap = {
  // Project / Task status
  planning:      'bg-slate-700 text-slate-300',
  active:        'bg-green-900/50 text-green-400',
  'on-hold':     'bg-yellow-900/50 text-yellow-400',
  completed:     'bg-blue-900/50 text-blue-400',
  cancelled:     'bg-red-900/50 text-red-400',
  todo:          'bg-slate-700 text-slate-300',
  'in-progress': 'bg-yellow-900/50 text-yellow-400',
  'in-review':   'bg-purple-900/50 text-purple-400',
  done:          'bg-green-900/50 text-green-400',
  // Priority
  low:           'bg-slate-700 text-slate-400',
  medium:        'bg-blue-900/50 text-blue-400',
  high:          'bg-red-900/50 text-red-400',
  // Role / misc
  admin:         'bg-purple-900/50 text-purple-400',
  member:        'bg-slate-700 text-slate-300',
  owner:         'bg-purple-900/50 text-purple-400',
  // Status flags
  Active:        'bg-green-900/50 text-green-400',
  Inactive:      'bg-red-900/50 text-red-400',
};

export default function Badge({ label, type }) {
  const key = type || label;
  const colorClass = colorMap[key] || colorMap[label] || 'bg-slate-700 text-slate-300';
  return (
    <span className={`badge ${colorClass}`}>
      {label}
    </span>
  );
}
