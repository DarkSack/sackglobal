import TopBar from "@/components/TopBar";
import Router from "@/routes/Router";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <TopBar />
      <main className="flex-1 pt-16">
        <Router />
      </main>
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Hecho con 💻 y ☕ por <span className="text-primary font-semibold">Sack</span>.
      </footer>
    </div>
  );
}
