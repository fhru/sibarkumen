import React from 'react';

export function PrintSppb({ data }) {
  return (
    <div className="font-serif text-sm leading-relaxed">
       <div className="mb-6 text-center">
        <h2 className="text-lg font-bold uppercase">Surat Perintah Penyaluran Barang (SPPB)</h2>
        <p>Nomor: {data.nomorSppb}</p>
      </div>

      <div className="mb-6">
         <p>Dasar: Surat Permintaan Barang Nomor {data.spb?.nomorSpb} Tanggal {data.spb?.tanggalSpb ? new Date(data.spb.tanggalSpb).toLocaleDateString('id-ID') : '-'}</p>
      </div>

      <div className="mb-4">
        <p>Diperintahkan kepada Penyimpan Barang untuk menyerahkan barang kepada:</p>
      </div>

      <div className="mb-6 pl-4">
         <table className="w-full">
           <tbody>
             <tr>
               <td className="w-32">Nama</td>
               <td className="w-4">:</td>
               <td>{data.penerima?.nama}</td>
             </tr>
             <tr>
               <td>NIP</td>
               <td>:</td>
               <td>{data.penerima?.nip}</td>
             </tr>
             <tr>
               <td>Jabatan</td>
               <td>:</td>
               <td>{data.penerima?.jabatan}</td>
             </tr>
             <tr>
               <td>Unit Kerja</td>
               <td>:</td>
               <td>{data.penerima?.unitKerja}</td>
             </tr>
           </tbody>
        </table>
      </div>

      <div className="mb-4">
        <p>Rincian Barang:</p>
      </div>

      <div className="mb-6">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100 text-center">
              <th className="border border-black p-1 w-10">No</th>
              <th className="border border-black p-1">Nama Barang</th>
              <th className="border border-black p-1 w-24">Jumlah Disalurkan</th>
              <th className="border border-black p-1 w-24">Satuan</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-black p-1 text-center">{index + 1}</td>
                <td className="border border-black p-1">{item.barang.namaBarang}</td>
                <td className="border border-black p-1 text-center">{item.jumlahDisalurkan}</td>
                <td className="border border-black p-1 text-center">{item.barang.satuan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-8 text-center mt-12">
        <div>
          <p className="mb-16">Pejabat Penatausahaan Barang,</p>
          <p className="font-bold underline">{data.pejabatPenatausahaan?.pegawai?.nama}</p>
          <p>NIP. {data.pejabatPenatausahaan?.pegawai?.nip}</p>
        </div>
        <div>
          <p className="mb-16">Pengurus Barang,</p>
          <p className="font-bold underline">{data.pengelolaBarang?.pegawai?.nama}</p>
          <p>NIP. {data.pengelolaBarang?.pegawai?.nip}</p>
        </div>
      </div>
    </div>
  );
}
