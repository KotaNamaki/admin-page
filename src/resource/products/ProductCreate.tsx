import { Create, SimpleForm, TextInput, NumberInput, ImageInput, ImageField, SelectInput } from 'react-admin';

// Ganti (value: any) menjadi (value: unknown)
const required = () => (value: unknown) => value ? undefined : 'Wajib diisi';

export const ProductCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="nama" validate={[required()]} fullWidth />
            <SelectInput source="kategori" choices={[
                { id: 'sparepart', name: 'Sparepart' },
                { id: 'aksesoris', name: 'Aksesoris' },
                { id: 'oli', name: 'Oli' },
            ]} validate={[required()]} />
            <TextInput source="deskripsi" multiline rows={3} fullWidth />
            <NumberInput source="harga" validate={[required()]} />
            <NumberInput source="stok" validate={[required()]} />
            <ImageInput source="gambar" label="Upload Gambar" accept={{ 'image/*': ['.jpg', '.jpeg', '.png'] }}>
                <ImageField source="src" title="title" />
            </ImageInput>
        </SimpleForm>
    </Create>
);