export default function AppLoading() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: "#7c6af750", borderTopColor: "#7c6af7" }}
      />
      <p className="text-[11px] text-[#484f58] font-medium tracking-wide">Loading...</p>
    </div>
  );
}
