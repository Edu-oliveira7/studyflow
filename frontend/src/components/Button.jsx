export default function Button({ children }) {
  return (
    <button
      className="px-6 py-3 rounded-full border border-[#C0F53D]/60 text-[#C0F53D] hover:bg-[#C0F53D] hover:text-black transition-all duration-300 shadow-[0_0_25px_rgba(192,245,61,0.15)]"
    >
      {children}
    </button>
  );
}
