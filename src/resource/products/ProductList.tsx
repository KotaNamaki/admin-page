import {
    List,
    Datagrid,
    TextField,
    NumberField,
    EditButton,
    DeleteButton,
    TextInput,
    FunctionField
} from 'react-admin';

const productFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
];

export const ProductList = () => (
    <List filters={productFilters}>
        <Datagrid rowClick="edit">
            <TextField source="nama" />
            <TextField source="kategori" />
            <NumberField source="harga" options={{ style: 'currency', currency: 'IDR' }} />

            {/* LOGIKA BARU: Peringatan Stok Rendah */}
            <FunctionField
                label="Stok"
                render={(record: any) => (
                    <span style={{
                        color: record.stok < 5 ? '#d32f2f' : 'inherit',
                        fontWeight: record.stok < 5 ? 'bold' : 'normal'
                    }}>
                        {record.stok} {record.stok < 5 && '(!)'}
                    </span>
                )}
            />

            <FunctionField
                label="Gambar"
                render={(record: any) => {
                    if (!record.gambar || record.gambar.length === 0) return null;
                    const imgUrl = Array.isArray(record.gambar) ? record.gambar[0] : record.gambar;
                    return (
                        <img
                            src={imgUrl}
                            alt={record.nama}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                    );
                }}
            />

            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);