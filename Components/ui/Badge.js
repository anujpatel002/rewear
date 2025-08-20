'use client';
export default function Badge({ color = 'slate', children }) {
  const colorMap = {
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-100 text-yellow-800',
    slate: 'bg-slate-100 text-slate-700',
    blue: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${colorMap[color] || colorMap.slate}`}>
      {children}
    </span>
  );
}


