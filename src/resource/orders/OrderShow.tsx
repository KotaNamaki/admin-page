import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
    ArrayField,
    Datagrid,
    ReferenceField,
    ChipField,
    TabbedShowLayout,
    Tab,
    useRecordContext
} from 'react-admin';

// Komponen helper untuk menampilkan label status dengan warna
const StatusChip = ({ source }: { source: string }) => (
    <ChipField
        source={source}
        sx={{
            '& .MuiChip-label': { textTransform: 'uppercase', fontWeight: 'bold' }
        }}
    />
);

// Komponen untuk menampilkan bagian Pembayaran jika ada
const PaymentSection = () => {
    const record = useRecordContext();
    if (!record || !record.pembayaran) {
        return <p style={{ color: '#888', fontStyle: 'italic' }}>Belum ada data pembayaran</p>;
    }
    return (
        <SimpleShowLayout record={record.pembayaran}>
            <TextField source="method" label="Metode Pembayaran" />
            <NumberField source="jumlah_bayar" label="Jumlah Dibayar" options={{ style: 'currency', currency: 'IDR' }} />
            <TextField source="status_bayar" label="Status Bayar" />
            <DateField source="created_at" label="Waktu Bayar" showTime />
        </SimpleShowLayout>
    );
};

export const OrderShow = () => (
    <Show>
        <TabbedShowLayout>
            {/* TAB 1: Detail Utama */}
            <Tab label="Ringkasan">
                <TextField source="id" label="Order ID" />
                <DateField source="created_at" label="Tanggal Pesanan" showTime />

                <ReferenceField source="user_id" reference="users" label="Pelanggan" link="show">
                    <TextField source="nama" />
                </ReferenceField>
                <TextField source="customer_email" label="Email Pelanggan" />

                <StatusChip source="status_pesanan" />

                <NumberField
                    source="total_harga"
                    options={{ style: 'currency', currency: 'IDR' }}
                    sx={{ fontSize: '1.2em', fontWeight: 'bold', mt: 2 }}
                />
            </Tab>

            {/* TAB 2: Item Produk */}
            <Tab label="Item Pesanan">
                <ArrayField source="items">
                    <Datagrid bulkActionButtons={false} sx={{ width: '100%' }}>
                        <TextField source="id_produk" label="ID Produk" />
                        <TextField source="nama" label="Nama Produk" />
                        <NumberField source="harga_satuan" label="Harga" options={{ style: 'currency', currency: 'IDR' }} />
                        <NumberField source="jumlah" label="Qty" />
                        <NumberField source="subtotal" label="Subtotal" options={{ style: 'currency', currency: 'IDR' }} sx={{ fontWeight: 'bold' }} />
                    </Datagrid>
                </ArrayField>
            </Tab>

            {/* TAB 3: Pembayaran */}
            <Tab label="Pembayaran">
                <PaymentSection />
            </Tab>
        </TabbedShowLayout>
    </Show>
);