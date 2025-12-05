import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    ChipField,
    useUpdate,
    useNotify,
    Button
} from 'react-admin';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Komponen Tombol Custom
const ApproveButton = ({ record }: any) => {
    const notify = useNotify();
    const [update, { isLoading }] = useUpdate(
        'orders',
        { id: record.id, data: { status: 'diproses' }, previousData: record },
        {
            onSuccess: () => notify('Status pesanan diubah menjadi diproses', { type: 'success' }),
            onError: () => notify('Gagal mengubah status', { type: 'warning' })
        }
    );

    // Hanya tampilkan tombol jika status 'pending'
    if (record.status !== 'pending') return null;

    return (
        <Button
            label="Proses"
            onClick={(e) => {
                e.stopPropagation(); // Mencegah rowClick="show" terpanggil
                update();
            }}
            disabled={isLoading}
        >
            <CheckCircleIcon sx={{ color: '#2ecc71', mr: 1 }} />
        </Button>
    );
};

export const OrderList = () => (
    <List sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="user_id" label="User ID" />
            <NumberField source="total_harga" options={{ style: 'currency', currency: 'IDR' }} />

            {/* Status dengan warna otomatis bawaan ChipField */}
            <ChipField source="status" />

            <DateField source="createdAt" label="Tanggal Pesan" showTime />

            {/* Tombol Aksi Custom */}
            <ApproveButton />
        </Datagrid>
    </List>
);