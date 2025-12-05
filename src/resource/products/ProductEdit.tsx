import { Edit, SimpleForm, TextInput, NumberInput, ImageInput, ImageField, SelectInput } from 'react-admin';

export const ProductEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="nama" fullWidth />
            <SelectInput source="kategori" choices={[
                { id: 'sparepart', name: 'Sparepart' },
                { id: 'aksesoris', name: 'Aksesoris' },
                { id: 'oli', name: 'Oli' },
            ]} />
            <TextInput source="deskripsi" multiline rows={3} fullWidth />
            <NumberInput source="harga" />
            <NumberInput source="stok" />

            {/* Tampilkan gambar lama jika ada, atau input baru */}
            <ImageField source="gambar" label="Gambar Saat Ini" sx={{ '& img': { maxWidth: 200 } }} />

            <ImageInput source="gambar" label="Ganti Gambar (Opsional)" accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>
        </SimpleForm>
    </Edit>
);