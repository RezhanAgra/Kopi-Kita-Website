const Footer = () => (
  <footer className="border-t border-base-border mt-16">
    <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between gap-6">
      <div className="flex items-center gap-2">
        <span className="w-9 h-9 rounded-full bg-brand flex items-center justify-center text-lg">☕</span>
        <div>
          <p className="font-bold">KopiKita</p>
          <p className="text-sm text-gray-500">Racikan Kopi Nusantara & Boba Kekinian</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 max-w-md">
        Proyek portofolio — dibangun dengan React, Tailwind CSS, Node.js, Express &amp;
        MongoDB (MERN stack), Midtrans Sandbox. Jl. Kenangan No. 1, Jakarta · Buka
        setiap hari 08.00–22.00 WIB.
      </p>
    </div>
  </footer>
);

export default Footer;
