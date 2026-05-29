export default function DarkToggle({ darkMode, toggle }) {
  return (
    <button
      onClick={toggle}
      className="relative w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-teal-400"
      aria-label="Toggle dark mode"
    >
      <div
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-all duration-300 flex items-center justify-center text-xs shadow-md ${
          darkMode
            ? "translate-x-6 bg-teal-500"
            : "translate-x-0 bg-yellow-400"
        }`}
      >
        {darkMode ? "🌙" : "☀️"}
      </div>
    </button>
  );
}