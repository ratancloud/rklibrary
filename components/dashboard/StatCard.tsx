import React from "react";

export function StatCard({ title, value, subtitle, icon, bgColor, hide }: any) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-xl ${bgColor}`}>
        {React.cloneElement(icon, {
          className: `h-5 w-5 ${icon.props.className}`,
        })}
      </div>
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        
        <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-none">
          {hide ? "••••••" : value}
        </h3>
        
        <div className="text-xs text-zinc-500 mt-1.5 font-medium">
          {hide ? "••••••" : subtitle}
        </div>
      </div>
    </div>
  );
}