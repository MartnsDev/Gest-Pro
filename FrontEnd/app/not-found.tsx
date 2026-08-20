import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-5 text-center text-[#303a35]">
      <div className="max-w-lg">
        <p className="text-sm font-bold uppercase tracking-[.14em] text-[#258c53]">Erro 404</p>
        <h1 className="mt-4 text-4xl font-light tracking-[-.04em] sm:text-5xl">Página não encontrada</h1>
        <p className="mt-5 leading-7 text-[#66736c]">O endereço informado não existe ou não está mais disponível.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-[#258c53] px-7 py-4 text-sm font-bold text-white hover:bg-[#1d7544]">Voltar à página inicial</Link>
      </div>
    </main>
  );
}
