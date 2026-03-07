function Home() {

    const handleFetch = async () => {
        try {
            const res = await fetch("http://localhost:3000/");
            const data = await res.text();
            alert(data);
        } catch (error) {
            alert("Sunucuyu çalıştırmayı unuttun");
            console.error(error);
        }
    };

    return (
        <div className="flex justify-center min-h-screen pt-8">
            <div className="max-w-6xl w-full px-4">
                <h1 className="text-3xl font-bold">Home Sayfası</h1>
                <p className="mt-4">bu sayfa kullanıcının siteye girince ilk göreceği reklam kısmı</p>
                <button
                    onClick={handleFetch}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Backendi çağır
                </button>
            </div>
        </div>
    );
}

export default Home;