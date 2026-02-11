import Navbar from "../components/Navbar";
import Button from "../components/Button";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0B0F0A] relative overflow-hidden font-sans text-white">

            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C0F53D] blur-[150px] opacity-10 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#1A2209] blur-[120px] opacity-80 w-full h-64" />

            <Navbar />

            <main className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-32">

                {/* HERO SECTION */}
                <section className="text-center mb-40">
                    <div className="inline-block px-4 py-1.5 mb-6 border border-[#C0F53D]/30 rounded-full bg-[#C0F53D]/5">
                        <span className="text-[#C0F53D] text-sm font-medium tracking-wide uppercase">
                            ✨ O fim da desorganização nos estudos
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight font-['Playfair_Display']">
                        Vença o <span className="text-white/40 underline decoration-[#C0F53D]/30">caos</span>. <br />
                        <span className="block text-[#C0F53D] mt-2 italic font-serif">Garanta sua aprovação.</span>
                    </h1>

                    <p className="mt-8 max-w-2xl mx-auto text-xl text-white/60 leading-relaxed">
                        O <strong>StudyFlow</strong> organiza sua rotina de estudos com inteligência, para que você possa focar no que realmente importa. Menos tempo planejando, mais tempo dominando o conteúdo que importa.
                    </p>

                    <div className="mt-12 flex justify-center">
                        <Button className="bg-[#C0F53D] text-black px-10 py-5 rounded-full text-xl font-bold hover:scale-105 transition-transform shadow-[0_0_30px_#C0F53D33]">
                            Começar
                        </Button>
                    </div>
                </section>

                {/* SECTION: CAOS VS ORDEM */}
                <section className="grid md:grid-cols-2 gap-20 items-center mb-48">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-bold leading-snug">
                            O <span className="text-[#ff4d4d] uppercase tracking-tighter">caos</span> mental é o sabotador da sua <span className="text-[#C0F53D]">aprovação</span>.
                        </h2>
                        <p className="mt-6 text-white/70 text-lg leading-relaxed">
                            Estudos desorganizados geram ansiedade. Quando você não sabe por onde começar, o cérebro escolhe procrastinar.
                        </p>
                    </div>

                    
                    <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 overflow-hidden group">
                        <div className="space-y-8">
                            
                            {/* Card de Meta */}
                            <div className="bg-[#0B0F0A] border border-white/10 p-4 rounded-xl flex items-center gap-4 transform group-hover:-translate-y-1 transition-transform">
                                <div className="w-10 h-10 rounded bg-[#C0F53D]/10 flex items-center justify-center text-[#C0F53D] font-bold">✓</div>
                                <div>
                                    <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Meta do Dia</p>
                                    <p className="text-sm font-medium italic text-white/90">Estudar Português e Matemática</p>
                                </div>
                            </div>

                            
                            <div className="text-center">
                                <span className="text-sm text-white/40 italic font-light tracking-tight">
                                    "Esse esforço todo vai sim valer a pena."
                                </span>
                            </div>

                        </div>
                    </div>
                </section>

            </main>
        </div>
    );
}