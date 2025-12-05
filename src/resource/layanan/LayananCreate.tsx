import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';

export const LayananCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="nama_layanan" label="Nama Layanan" validate={[required()]} fullWidth />
            <NumberInput source="estimasi_harga" label="Harga" validate={[required()]} />
            <TextInput source="jenis_modifikasi" label="Jenis Modifikasi" />
            <TextInput source="deskripsi" label="Deskripsi" multiline fullWidth />
            <TextInput source="estimasi_waktu" label="Estimasi Waktu" />
        </SimpleForm>
    </Create>
);