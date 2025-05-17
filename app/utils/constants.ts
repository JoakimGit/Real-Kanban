export const colorSelections = [
  { name: 'Lime', value: 'bg-lime-600' },
  { name: 'Green', value: 'bg-green-600' },
  { name: 'Emerald', value: 'bg-emerald-600' },
  { name: 'Teal', value: 'bg-teal-600' },
  { name: 'Cyan', value: 'bg-cyan-600' },
  { name: 'Sky', value: 'bg-sky-600' },
  { name: 'Blue', value: 'bg-blue-600' },
  { name: 'Indigo', value: 'bg-indigo-600' },
  { name: 'Purple', value: 'bg-purple-600' },
  { name: 'Violet', value: 'bg-violet-600' },
  { name: 'Fuchsia', value: 'bg-fuchsia-600' },
  { name: 'Yellow', value: 'bg-yellow-600' },
  { name: 'Amber', value: 'bg-amber-600' },
  { name: 'Orange', value: 'bg-orange-600' },
  { name: 'Brown', value: 'bg-amber-800' },
  { name: 'Red', value: 'bg-red-600' },
  { name: 'Rose', value: 'bg-rose-600' },
  { name: 'Pink', value: 'bg-pink-600' },
  { name: 'Gray', value: 'bg-gray-500' },
  { name: 'Slate', value: 'bg-slate-600' },
  { name: 'Zinc', value: 'bg-zinc-700' },
  { name: 'Neutral', value: 'bg-neutral-600' },
];

export type Color = (typeof colorSelections)[number];

export const inputLikeClasses =
  'flex w-full rounded-md border border-input bg-transparent text-base transition-colors md:text-sm';
