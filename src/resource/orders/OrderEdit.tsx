import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    DateTimeInput, // <--- Ganti DateInput jadi ini
    NumberField,
    ReferenceField,
    TextField
} from 'react-admin';

export const OrderEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled label="Order ID" />

            {/* PERBAIKAN DI SINI: Gunakan DateTimeInput tanpa prop showTime */}
            <DateTimeInput source="created_at" disabled label="Tanggal Dibuat" />

            <ReferenceField source="user_id" reference="users" label="Pelanggan">
                <TextField source="nama" />
            </ReferenceField>

            <NumberField
                source="total_harga"
                options={{ style: 'currency', currency: 'IDR' }}
                label="Total Harga"
            />

            <SelectInput
                source="status_pesanan"
                label="Status Pesanan"
                choices={[
                    { id: 'pending', name: 'Pending' },
                    { id: 'diproses', name: 'Diproses' },
                    { id: 'dikirim', name: 'Dikirim' },
                    { id: 'selesai', name: 'Selesai' },
                    { id: 'dibatalkan', name: 'Dibatalkan' },
                ]}
                optionText="name"
                optionValue="id"
                fullWidth
            />
        </SimpleForm>
    </Edit>
);