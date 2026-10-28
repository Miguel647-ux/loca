export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Grille subtile */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* Orbes lumineux */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--brand)]/10 mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-orange-500/10 mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-32 left-1/2 w-[600px] h-[600px] rounded-full bg-[var(--brand)]/10 mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
    </div>
  );
}