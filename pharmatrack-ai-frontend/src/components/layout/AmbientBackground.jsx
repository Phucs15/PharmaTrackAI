export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden">
      <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary/10 opacity-50 mix-blend-screen blur-[120px] dark:opacity-30" />
      <div className="absolute -bottom-[10%] -right-[5%] h-[50%] w-[30%] rounded-full bg-tertiary/10 opacity-30 mix-blend-screen blur-[100px] dark:opacity-20" />
    </div>
  );
}
