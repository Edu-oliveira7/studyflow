import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0B0F0A] border-t border-[#C0F53D]/20 mt-20">
            <div className="max-w-6xl mx-auto px-6 py-16 text-center">

                <div className="flex flex-col items-center mb-12">
                    <Link to="/" className="text-2xl font-bold mb-4 hover:opacity-80 transition-opacity">
                        <span className="text-white">Study</span>
                        <span className="text-[#C0F53D]">Flow</span>
                    </Link>
                    <p className="text-white/60 text-sm leading-relaxed max-w-sm">
                        Transforme sua rotina de estudos em um sistema inteligente e organizado.
                    </p>
                </div>


                <div className="flex flex-col items-center justify-center">
                    <p className="text-white/50 text-sm">
                        © {currentYear} StudyFlow. Todos os direitos reservados.
                    </p>

                </div>
            </div>
        </footer>
    );
}