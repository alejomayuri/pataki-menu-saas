export default function CategorySelector({ categories }) {
  return (
    <div className="sticky top-0 z-10 bg-stone-100/80 backdrop-blur-md py-4 my-2 px-4 overflow-x-auto scrollbar-none flex gap-2">
      {categories.map((category) => (
        <a
          key={category}
          href={`#${category.toLowerCase().replace(/\s+/g, "-")}`}
          className="whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-bold text-stone-700 shadow-sm border border-stone-200 active:bg-stone-900 active:text-white transition-colors"
        >
          {category}
        </a>
      ))}
    </div>
  );
}