import React from 'react';

export function PrintSpb({ data }) {
  return (
    <div className="font-serif text-sm leading-relaxed">
       <div className="mb-6 text-center">
        <h2 className="text-lg font-bold uppercase">Surat Permintaan Barang (SPB)</h2>
        <p>Nomor: {data.nomorSpb}</p>
      </div>

      <div className="mb-6">
        <table className="w-full">
           <tbody>
             <tr>
               <td className="w-32">Tanggal</td>
               <td className="w-4">:</td>
               <td>{new Date(data.tanggalSpb).toLocaleDateString('id-ID')}</td>
             </tr>
             <tr>
               <td>Unit Kerja</td>
               <td>:</td>
               <td>{data.pemohon?.unitKerja || '-'}</td>
             </tr>
             <tr>
               <td>Pemohon</td>
               <td>:</td>
               <td>{data.pemohon?.nama}</td>
             </tr>
           </tbody>
        </table>
      </div>

      <div className="mb-6">
        <p>Mohon dapat dikeluarkan barang-barang sebagai berikut:</p>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-black p-1 w-10">No</th>
              <th className="border border-black p-1">Nama Barang</th>
              <th className="border border-black p-1 w-24">Jumlah Diminta</th>
              <th className="border border-black p-1 w-24">Satuan</th>
              <th className="border border-black p-1">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{item.barang.namaBarang}</td>
                <td className="border border-black p-1 text-center">{item.jumlah}</td>
                <td className="border border-black p-1 text-center">{item.barang.satuan}</td>
                <td className="border border-black p-1"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center mt-12">
        <div>
            {/* Space for approval if needed */}
        </div>
        <div>
          <p className="mb-16">Pemohon,</p>
          <p className="font-bold underline">{data.pemohon?.nama}</p>
          <p>NIP. {data.pemohon?.nip}</p>
        </div>
      </div>
    </div>
  );
}
