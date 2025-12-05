import { List, Datagrid, TextField, NumberField, DateField } from 'react-admin';

// Daftar ulasan sederhana. Sesuaikan field sesuai API backend.
export const UlasanList = () => (
    <List>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="user_id" label="User ID" />
            <NumberField source="rating" />
            <TextField source="komentar" />
            <DateField source="createdAt" label="Dibuat" showTime />
        </Datagrid>
    </List>
);
