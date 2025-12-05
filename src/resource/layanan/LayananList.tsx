import { List, Datagrid, TextField, NumberField } from 'react-admin';

// Daftar layanan sederhana. Sesuaikan field dengan API backend Anda bila perlu.
export const LayananList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="nama_layanan" label="Nama Layanan" />
            <TextField source="deskripsi" label="Deskripsi" />
            <TextField source="jenis_modifikasi" label="Jenis Modifikasi" />
            <NumberField source="estimasi_harga" label="Harga" options={{ style: 'currency', currency: 'IDR' }} />
        </Datagrid>
    </List>
);
