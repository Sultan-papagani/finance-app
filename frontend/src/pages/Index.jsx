import { Link } from "react-router-dom";

function Index(){
    return(
        // Ekranı tam kaplayan, koyu lacivert/mavi finansal bir arka plan
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-[#04009A] to-blue-900 text-white px-6 text-center">
            
            {/* İçeriği ortalayan ve daraltan ana kutu */}
            <div className="max-w-4xl space-y-8">
                
                {/* Ana Başlık */}
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                    Burası sitenin ana ana sayfası ne kadar havalı özelliklerimizin olduğunu anlatıcağımız yer <span className="text-blue-400">birde işte giriş yap tuşu var o kadar.</span>
                </h1>

                {/* Alt Başlık */}
                <h2 className="text-2xl md:text-3xl font-medium text-gray-300">
                    merhaba bakın nasıl havalı bir finans uygulamamız var.
                </h2>

                {/* Açıklama */}
                <p className="text-lg text-gray-400">
                    giriş yapın o yüzden bence
                </p>

                {/* Buton Alanı */}
                <div className="pt-8">
                    <Link 
                        to="/login" 
                        className="inline-block px-10 py-4 bg-white text-[#04009A] font-bold text-lg rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:bg-gray-100 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300"
                    > 
                        GİRİŞ YAP 
                    </Link>
                </div>

            </div>
        </div>
    );
}

export default Index;