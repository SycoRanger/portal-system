import { initials, cn } from '../../utils/format';

const PALETTE = [
  'bg-indigo-100 text-indigo-700',
  'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
];

function hashColor(str) {
  let h = 0;
  for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return PALETTE[Math.abs(h) % PALETTE.length];
}

export default function Avatar({ name, size = 36, className }) {
  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full font-semibold', hashColor(name), className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(name)}
    </div>
  );
}
