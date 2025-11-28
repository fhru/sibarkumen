import React from 'react';

export function PrintBastKeluar({ data }) {
  return (
    <div className="font-serif text-sm leading-relaxed">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold uppercase">Berita Acara Serah Terima Barang (Keluar)</h2>
        <p>Nomor: {data.nomorBast}</p>
      </div>

      <div className="mb-4">
        <p>Pada hari ini, <strong>{new Date(data.tanggalBast).toLocaleDateString('id-ID', { weekday: 'long' })}</strong> tanggal <strong>{new Date(data.tanggalBast).getDate()}</strong> bulan <strong>{new Date(data.tanggalBast).toLocaleDateString('id-ID', { month: 'long' })}</strong> tahun <strong>{new Date(data.tanggalBast).getFullYear()}</strong>, kami yang bertanda tangan di bawah ini:</p>
      </div>

      <div className="mb-4 pl-4">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-8 align-top">1.</td>
              <td className="w-40 align-top">Nama</td>
              <td className="w-4 align-top">:</td>
              <td>{data.pihakMenyerahkan?.pegawai?.nama}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">NIP</td>
              <td className="align-top">:</td>
              <td>{data.pihakMenyerahkan?.pegawai?.nip}</td>
            </tr>
             <tr>
              <td></td>
              <td className="align-top">Jabatan</td>
              <td className="align-top">:</td>
              <td>{data.pihakMenyerahkan?.pegawai?.jabatan} ({data.pihakMenyerahkan?.jenisJabatan})</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Selanjutnya disebut</td>
              <td className="align-top">:</td>
              <td><strong>PIHAK PERTAMA</strong></td>
            </tr>
            <tr className="h-4"></tr>
            <tr>
              <td className="w-8 align-top">2.</td>
              <td className="w-40 align-top">Nama</td>
              <td className="w-4 align-top">:</td>
              <td>{data.pihakMenerima?.nama}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">NIP</td>
              <td className="align-top">:</td>
              <td>{data.pihakMenerima?.nip}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Jabatan</td>
              <td className="align-top">:</td>
              <td>{data.pihakMenerima?.jabatan}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Selanjutnya disebut</td>
              <td className="align-top">:</td>
              <td><strong>PIHAK KEDUA</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <p className="text-justify">
          PIHAK PERTAMA menyerahkan barang kepada PIHAK KEDUA berdasarkan Surat Perintah Penyaluran Barang (SPPB) Nomor {data.sppb?.nomorSppb}, dan PIHAK KEDUA menerima barang dengan rincian sebagai berikut:
        </p>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-black p-1 w-10">No</th>
              <th className="border border-black p-1">Nama Barang</th>
              <th className="border border-black p-1 w-20">Volume</th>
              <th className="border border-black p-1 w-20">Satuan</th>
              <th className="border border-black p-1 w-28">Harga Satuan</th>
              <th className="border border-black p-1 w-28">Total Harga</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{item.barang.namaBarang}</td>
                <td className="border border-black p-1 text-center">{Number(item.volume)}</td>
                <td className="border border-black p-1 text-center">{item.barang.satuan}</td>
                <td className="border border-black p-1 text-right">
                  {new Intl.NumberFormat('id-ID').format(Number(item.jumlahHarga) / Number(item.volume))}
                </td>
                <td className="border border-black p-1 text-right">
                  {new Intl.NumberFormat('id-ID').format(Number(item.hargaSetelahPpn))}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} className="border border-black p-1 text-right font-bold">Total</td>
              <td className="border border-black p-1 text-right font-bold">
                {new Intl.NumberFormat('id-ID').format(data.details.reduce((a, b) => a + Number(b.hargaSetelahPpn), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <p className="text-justify">
          Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center">
        <div>
          <p className="mb-16">PIHAK PERTAMA</p>
          <p className="font-bold underline">{data.pihakMenyerahkan?.pegawai?.nama}</p>
          <p>NIP. {data.pihakMenyerahkan?.pegawai?.nip}</p>
        </div>
        <div>
          <p className="mb-16">PIHAK KEDUA</p>
          <p className="font-bold underline">{data.pihakMenerima?.nama}</p>
          <p>NIP. {data.pihakMenerima?.nip}</p>
        </div>
      </div>
    </div>
  );
}
