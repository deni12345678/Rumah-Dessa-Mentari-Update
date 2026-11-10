import React from 'react';
import { ShieldCheck, BookOpen, AlertCircle, Sparkles, Scale, FileText, CheckCircle2, UserCheck } from 'lucide-react';

interface PolicyPagesProps {
  pageType:
    | 'tentang'
    | 'pedoman-penulisan'
    | 'ketentuan-publikasi'
    | 'kebijakan-privasi'
    | 'ketentuan-penggunaan'
    | 'hak-cipta-dan-koreksi';
  onNavigate: (view: string, param?: string) => void;
}

export const PolicyPages: React.FC<PolicyPagesProps> = ({ pageType, onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-6 sm:p-12 border border-slate-200 shadow-xs space-y-8">
        {/* TENTANG KAMI */}
        {pageType === 'tentang' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Profil Resmi Media & Komunitas
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900 mt-1">
                Tentang Rumah Dessa Mentari
              </h1>
              <p className="text-base text-amber-800 font-serif-editorial italic mt-2">
                “Inspirasi untuk Semua, Karya untuk Dunia.”
              </p>
            </div>

            <div className="prose text-slate-700 space-y-4 text-sm sm:text-base leading-relaxed">
              <p>
                <strong>Rumah Dessa Mentari</strong> adalah platform digital terpadu yang didirikan sebagai ruang berbagi inspirasi, informasi, pengetahuan, gagasan, dan karya tulis masyarakat. Kami menggabungkan media artikel berkualitas, ekosistem kontributor terbuka, gerakan literasi, serta layanan profesional penulisan dan penyuntingan buku.
              </p>

              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h3 className="font-serif-editorial font-bold text-amber-950 text-base">Visi Kami</h3>
                <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
                  Menjadi ruang digital yang mendorong masyarakat untuk berbagi inspirasi, memperluas wawasan, dan melahirkan karya yang bermanfaat bagi banyak orang.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-lg">Misi Resmi RDM:</h3>
                <ul className="space-y-2 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">1.</span>
                    <span>Menyebarkan kisah inspiratif dan informasi yang bermanfaat dan terverifikasi.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">2.</span>
                    <span>Membuka kesempatan bagi seluruh lapisan masyarakat untuk mengirimkan tulisan dan gagasan bermutu.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">3.</span>
                    <span>Mendukung budaya membaca mendalam (deep reading), menulis terstruktur, dan literasi kritis.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">4.</span>
                    <span>Menyediakan layanan profesional dalam pendampingan penulisan naskah dan tata letak buku.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">5.</span>
                    <span>Mengembangkan ekosistem media dan karya tulis yang kredibel, inklusif, dan berkelanjutan.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-lg mb-3">
                  Susunan Meja Redaksi & Dewan Pengelola:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="font-bold text-slate-900 text-sm">Deni Santoso, M.M.</p>
                    <p className="text-slate-500">Pemimpin Redaksi & Penanggung Jawab Platform</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
                    <p className="font-bold text-slate-900 text-sm">Siti Rahmawati, M.Hum.</p>
                    <p className="text-slate-500">Editor Senior Naskah & Kurator Kebahasaan</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PEDOMAN PENULISAN */}
        {pageType === 'pedoman-penulisan' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Panduan Bagi Penulis
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900 mt-1">
                Pedoman Penulisan Kontributor
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Kaidah, etika, dan tata cara penulisan artikel sebelum diajukan ke meja kurasi redaksi.
              </p>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <section className="space-y-2">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-base">
                  1. Prinsip Orisinalitas & Hak Moral
                </h3>
                <p>
                  Setiap naskah yang dikirimkan wajib merupakan karya asli kontributor. Segala bentuk penjiplakan (plagiarisme), penggunaan teks orang lain tanpa atribusi kutipan yang jelas, atau pembuatan naskah otomatis tanpa pertanggungjawaban nalar dilarang keras di Rumah Dessa Mentari.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-base">
                  2. Standar Bahasa & Kesantunan Tutur
                </h3>
                <p>
                  Gunakan kaidah bahasa Indonesia yang baik, mengacu pada Pedoman Umum Ejaan Bahasa Indonesia (PUEBI/EYD). Tulisan tidak boleh memuat ujaran kebencian, pencemaran nama baik, fitnah, perundungan, maupun prasangka berbasis suku, agama, ras, dan antargolongan (SARA).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-base">
                  3. Standar Khusus Rubrik Kesehatan
                </h3>
                <p>
                  Tulisan kesehatan ditujukan untuk edukasi dan gaya hidup sehat. Penulis dilarang membuat klaim diagnosis klinis sepihak atau menjanjikan kesembuhan instan. Rujukan wajib mengutip publikasi medis terpercaya, Kemenkes, atau jurnal ilmiah resmi.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-base">
                  4. Standar Rubrik Berita & Informasi Umum
                </h3>
                <p>
                  Wajib memisahkan secara tegas antara fakta peristiwa yang telah terkonfirmasi dengan interpretasi atau opini pribadi. Cantumkan tanggal kejadian dan nama pihak narasumber.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="font-serif-editorial font-bold text-slate-900 text-base">
                  5. Hak Cipta Gambar & Media Pendukung
                </h3>
                <p>
                  Gambar sampul yang disertakan harus merupakan foto dokumentasi pribadi penulis atau gambar berlisensi penggunaan bebas (seperti Unsplash, Creative Commons zero, atau domain publik). Sertakan atribusi sumber secara jujur.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* KETENTUAN PUBLIKASI */}
        {pageType === 'ketentuan-publikasi' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Hak & Kewajiban Editorial
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900 mt-1">
                Ketentuan Publikasi Redaksi
              </h1>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Dengan mengirimkan tulisan ke Rumah Dessa Mentari (RDM), penulis menyetujui ketentuan berikut:
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">A. Hak Penyuntingan Redaksi</h4>
                  <p>
                    Editor RDM berhak menyunting judul, ringkasan, tanda baca, serta memperbaiki struktur kalimat naskah tanpa mengubah substansi pokok atau makna yang dimaksudkan oleh penulis.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">B. Tidak Ada Penerbitan Otomatis</h4>
                  <p>
                    Setiap naskah melalui proses kurasi manusia secara teliti. Redaksi berhak meminta revisi atau menolak naskah yang tidak selaras dengan visi literasi dan standar etika RDM.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm">C. Hak Cipta Tetap Milik Penulis</h4>
                  <p>
                    Hak cipta moral atas tulisan tetap berada pada penulis. Penulis memberikan hak non-eksklusif kepada Rumah Dessa Mentari untuk menayangkan, mengarsipkan, dan membagikan tulisan tersebut di media digital RDM.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KEBIJAKAN PRIVASI */}
        {pageType === 'kebijakan-privasi' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Perlindungan Data Pribadi
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900 mt-1">
                Kebijakan Privasi
              </h1>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Rumah Dessa Mentari menghormati dan berkomitmen melindungi privasi pengunjung dan kontributor kami:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  <strong>Pengumpulan Data Terbatas:</strong> Kami hanya mengumpulkan data yang Anda berikan secara sadar, seperti nama, email, bio kepenulisan saat membuat akun, serta data kontak saat mengisi formulir konsultasi naskah buku.
                </li>
                <li>
                  <strong>Keamanan Kata Sandi:</strong> Kata sandi Anda tidak pernah disimpan dalam bentuk teks biasa. Sistem menerapkan fungsi enkripsi kriptografis (salted cryptographic hash) untuk melindungi keamanan akun.
                </li>
                <li>
                  <strong>Tidak Menjual Data:</strong> Kami tidak pernah menjual, menyewakan, atau membagikan informasi kontak Anda kepada pihak ketiga pengiklan.
                </li>
                <li>
                  <strong>Penyimpanan Lokal:</strong> Preferensi tampilan dan draf tulisan yang Anda simpan dikelola secara aman untuk menjamin kenyamanan Anda dalam menulis.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* KETENTUAN PENGGUNAAN */}
        {pageType === 'ketentuan-penggunaan' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Syarat & Ketentuan Layanan
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900 mt-1">
                Ketentuan Penggunaan Platform
              </h1>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Selamat datang di platform Rumah Dessa Mentari. Penggunaan portal ini tunduk pada syarat dan ketentuan yang berlaku:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>
                  Pengunjung dipersilakan membaca, membagikan kutipan tulisan dengan tetap mencantumkan tautan aktif ke situs resmi RDM dan nama penulis.
                </li>
                <li>
                  Dilarang melakukan tindakan yang dapat mengganggu keutuhan infrastruktur situs, seperti pengiriman spam formulir, percobaan peretasan, atau scraping data tanpa izin tertulis.
                </li>
                <li>
                  Pengguna bertanggung jawab penuh atas keamanan kredensial akun masing-masing.
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* KEBIJAKAN HAK CIPTA DAN KOREKSI KONTEN */}
        {pageType === 'hak-cipta-dan-koreksi' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Hak Jawab & Integritas Publikasi
              </span>
              <h1 className="text-3xl font-serif-editorial font-bold text-slate-900 mt-1">
                Kebijakan Hak Cipta dan Koreksi Konten
              </h1>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                Sebagai media yang menjunjung tinggi kebenaran informasi dan penghormatan terhadap kekayaan intelektual orang lain, Rumah Dessa Mentari menyediakan mekanisme terbuka bagi koreksi naskah dan hak jawab:
              </p>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Prosedur Pengajuan Koreksi Fakta</h4>
                <p>
                  Jika Anda menemukan kekeliruan data penulisan, nama, tanggal, kutipan, atau konteks pada salah satu artikel kami, Anda dapat menggunakan tombol <strong>“Ajukan Koreksi”</strong> yang berada di bagian bawah setiap artikel, atau mengirimkan email resmi ke: <strong className="text-slate-900">dessamentarilangit@gmail.com</strong>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Penanganan Pelanggaran Hak Cipta</h4>
                <p>
                  Bila Anda adalah pemegang hak cipta sah atas teks atau karya foto yang digunakan tanpa izin atau atribusi yang pantas, sampaikan bukti kepemilikan Anda kepada kami. Redaksi akan segera melakukan verifikasi dan mencabut atau memperbarui atribusi materi tersebut dalam waktu paling lambat 2x24 jam kerja.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">Catatan Koreksi Transparan</h4>
                <p>
                  Bila sebuah artikel mengalami revisi faktual yang berarti pasca-publikasi, kami akan mencantumkan catatan pembaruan (Editorial Update Note) di badan tulisan demi keterbukaan terhadap publik pembaca.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
