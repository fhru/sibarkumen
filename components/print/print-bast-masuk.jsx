import React from 'react';

export function PrintBastMasuk({ data }) {
  return (
    <div className="font-serif text-sm leading-relaxed">
      <div className="mb-6 text-center">
        <h2 className="text-lg font-bold uppercase">Berita Acara Serah Terima Barang</h2>
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
              <td>{data.pihakKetiga}</td>
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
              <td>{data.pptkPpk?.nama}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">NIP</td>
              <td className="align-top">:</td>
              <td>{data.pptkPpk?.nip}</td>
            </tr>
            <tr>
              <td></td>
              <td className="align-top">Jabatan</td>
              <td className="align-top">:</td>
              <td>{data.pptkPpk?.jabatan}</td>
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
          PIHAK PERTAMA menyerahkan barang kepada PIHAK KEDUA, dan PIHAK KEDUA menerima barang dari PIHAK PERTAMA dengan rincian sebagai berikut:
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
              <th className="border border-black p-1 w-28">Jumlah Harga</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{item.barang.namaBarang}</td>
                <td className="border border-black p-1 text-center">{item.jumlah}</td>
                <td className="border border-black p-1 text-center">{item.barang.satuan}</td>
                <td className="border border-black p-1 text-right">
                  {new Intl.NumberFormat('id-ID').format(item.hargaSatuan)}
                </td>
                <td className="border border-black p-1 text-right">
                  {new Intl.NumberFormat('id-ID').format(item.totalHarga)}
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={5} className="border border-black p-1 text-right font-bold">Total</td>
              <td className="border border-black p-1 text-right font-bold">
                {new Intl.NumberFormat('id-ID').format(data.details.reduce((a, b) => a + Number(b.totalHarga), 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-8">
        <p className="text-justify">
          Barang tersebut telah diterima dalam keadaan baik dan cukup. Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center">
        <div>
          <p className="mb-16">PIHAK PERTAMA</p>
          <p className="font-bold underline">{data.pihakKetiga}</p>
        </div>
        <div>
          <p className="mb-16">PIHAK KEDUA</p>
          <p className="font-bold underline">{data.pptkPpk?.nama}</p>
          <p>NIP. {data.pptkPpk?.nip}</p>
        </div>
      </div>
    </div>
  );
}
