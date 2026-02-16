import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Button from "../components/Button";

export default function Home() {
    return (
        <div className="min-h-screen bg-[#0B0F0A] relative overflow-hidden font-sans text-white">

            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C0F53D] blur-[150px] opacity-10 rounded-full" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#1A2209] blur-[120px] opacity-80 w-full h-64" />

            <Navbar />

            <main className="relative z-10">
                {/* HERO SECTION */}
                <section className="max-w-6xl mx-auto px-6 py-32 text-center">
                    <div className="inline-block px-4 py-1.5 mb-6 border border-[#C0F53D]/30 rounded-full bg-[#C0F53D]/5">
                        <span className="text-[#C0F53D] text-sm font-medium tracking-wide uppercase">
                            ✨ O fim da desorganização nos estudos
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight font-['Playfair_Display'] mb-8">
                        Vença o <span className="text-white/40 underline decoration-[#C0F53D]/30">caos</span>. <br />
                        <span className="block text-[#C0F53D] mt-4 italic font-serif">Garanta sua aprovação.</span>
                    </h1>

                    <p className="mt-8 max-w-3xl mx-auto text-xl text-white/60 leading-relaxed mb-12">
                        O <strong>StudyFlow</strong> é a plataforma inteligente que organiza sua rotina de estudos de forma automática, permitindo que você foque no que realmente importa: aprender e se desenvolver.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/login">
                            <Button className="bg-[#C0F53D] text-black px-10 py-4 rounded-lg text-lg font-bold hover:bg-[#a8d629] transition-all shadow-lg shadow-[#C0F53D]/30 hover:shadow-[#C0F53D]/50">
                                Começar Agora
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* PROBLEMA SECTION */}
                <section className="max-w-6xl mx-auto px-6 py-24">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-5xl font-bold leading-snug mb-6">
                                O <span className="text-[#ff4d4d]">caos</span> mental é o inimigo da sua <span className="text-[#C0F53D]">aprovação</span>.
                            </h2>
                            <p className="text-white/70 text-lg leading-relaxed mb-6">
                                Estudos desorganizados geram ansiedade. Quando você não sabe por onde começar, o cérebro escolhe procrastinar. Você quer estudar, mas acaba perdido no meio de tantas matérias, prazos e responsabilidades.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#C0F53D] text-xl mt-1">⚠️</span>
                                    <span className="text-white/80">Sem organização, você estuda sem propósito</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#C0F53D] text-xl mt-1">⚠️</span>
                                    <span className="text-white/80">Tempo desperdiçado em decisões sobre o que estudar</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#C0F53D] text-xl mt-1">⚠️</span>
                                    <span className="text-white/80">Procrastinação por não ter um plano claro</span>
                                </li>
                            </ul>
                        </div>
                        
                        <div className="relative from-[#C0F53D]/10 to-transparent border border-[#C0F53D]/30 rounded-3xl p-8 overflow-hidden">
                            <div className="space-y-6">
                                <div className="bg-[#0B0F0A] border border-red-500/30 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xl">✗</div>
                                    <div>
                                        <p className="text-[10px] text-red-400 uppercase font-bold">Cenário Atual</p>
                                        <p className="text-sm font-medium text-white">Sem organização = Sem resultados</p>
                                    </div>
                                </div>
                                
                                <div className="text-center text-white/40 py-4">
                                    <p className="italic">Mas isso pode mudar...</p>
                                </div>

                                <div className="bg-[#0B0F0A] border border-[#C0F53D]/30 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 rounded bg-[#C0F53D]/20 flex items-center justify-center text-[#C0F53D] font-bold text-xl">✓</div>
                                    <div>
                                        <p className="text-[10px] text-[#C0F53D] uppercase font-bold">Com StudyFlow</p>
                                        <p className="text-sm font-medium text-white">Melhor organização = Menos estresse e mais produtividade</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                
                <section id="features" className="max-w-6xl mx-auto px-6 py-24 from-transparent via-[#C0F53D]/5 to-transparent rounded-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">Para Que Serve StudyFlow?</h2>
                        <p className="text-white/60 text-xl max-w-2xl mx-auto">
                            Transformamos sua rotina de estudos em um sistema inteligente e automático
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: "📋",
                                title: "Plano Personalizado",
                                desc: "Cria um plano de estudos único baseado nas suas matérias, prioridades e tempo disponível"
                            },
                            {
                                icon: "⏰",
                                title: "Gestão de Tempo",
                                desc: "Distribui automaticamente o tempo entre suas matérias de forma inteligente e eficiente"
                            },
                            
                            {
                                icon: "🎯",
                                title: "Foco no Importante",
                                desc: "Prioriza as matérias mais difíceis e importantes para você"
                            },
                            {
                                icon: "🚀",
                                title: "Sem Perda de Tempo",
                                desc: "Elimina a ansiedade de não saber por onde começar cada dia"
                            },
                            {
                                icon: "💡",
                                title: "Estratégia Inteligente",
                                desc: "Usa inteligência artificial para otimizar seu método de estudos"
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-[#2a2a2a] border border-[#C0F53D]/20 rounded-xl p-8 hover:border-[#C0F53D]/60 hover:bg-[#2a2a2a]/80 transition-all group">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#C0F53D] transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-white/70 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="benefits" className="max-w-6xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">Como Vamos Te Ajudar?</h2>
                        <p className="text-white/60 text-xl max-w-2xl mx-auto">
                            Desde o primeiro dia até sua aprovação, estamos ao seu lado
                        </p>
                    </div>

                    <div className="space-y-8">
                        {[
                            {
                                step: "01",
                                title: "Responda um Questionário Rápido",
                                desc: "Em apenas 2 minutos, nos conte sobre suas matérias, prioridades e tempo disponível"
                            },
                            {
                                step: "02",
                                title: "Receba Seu Plano Personalizado",
                                desc: "Um plano 100% customizado aparecerá no seu dashboard, pronto para começar"
                            },
                            {
                                step: "03",
                                title: "Siga Seu Roteiro",
                                desc: "Cada dia você saberá exatamente o que estudar, por quanto tempo e quando fazer pausa"
                            },
                            {
                                step: "04",
                                title: "Acompanhe e Vença",
                                desc: "Veja seu progresso crescer e conquiste suas metas de aprovação"
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-8 items-center group">
                                <div className="w-20 h-20 rounded-full bg-[#C0F53D]/20 border border-[#C0F53D]/40 flex items-center justify-center  group-hover:bg-[#C0F53D] group-hover:text-black transition-all">
                                    <span className="text-3xl font-bold text-[#C0F53D] group-hover:text-black transition-colors">
                                        {item.step}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#C0F53D] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-white/70 text-lg">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}