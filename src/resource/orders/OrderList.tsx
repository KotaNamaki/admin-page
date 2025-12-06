import { useState, useCallback } from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    ChipField,
    useUpdate,
    useNotify,
    Button,
    useRecordContext,

} from 'react-admin';
import { Tabs, Tab, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// 1. Komponen Tombol Custom (Tetap sama)
const ApproveButton = () => {
    const record = useRecordContext();
    const notify = useNotify();

    if (!record) return null;

    const [update, { isLoading }] = useUpdate(
        'orders',
        { id: record.id, data: { status_pesanan: 'diproses' }, previousData: record },
        {
            onSuccess: () => notify('Status pesanan diubah menjadi diproses', { type: 'success' }),
            onError: () => notify('Gagal mengubah status', { type: 'warning' })
        }
    );

    if (record.status_pesanan !== 'pending') return null;

    return (
        <Button label="Proses" onClick={(e) => { e.stopPropagation(); update(); }} disabled={isLoading}>
            <CheckCircleIcon sx={{ color: '#2ecc71', mr: 1 }} />
        </Button>
    );
};

const SelesaiButton = () => {
    const record = useRecordContext();
    const notify = useNotify();
    if (!record) return null;
    const [update, { isLoading }] = useUpdate(
        'orders',
        { id: record.id, data: {status_pesanan:'selesai'}, previousData: record },
        {
            onSuccess: () => notify('Status pesanan selesai', { type: 'success' }),
            onError: () => notify('Gagal mengubah selesai', { type: 'warning' }),
        }
    );
    if (record.status_pesanan !== 'diproses') return null;
    return (
        <Button label="Selesai" onClick={(e) => { e.stopPropagation(); update(); }} disabled={isLoading}>
            <CheckCircleIcon sx={{ color: '#2ecc71', mr: 1 }} />
        </Button>
    )
}

// 2. Definisi Tab
const tabs = [
    { id: 'pending', name: 'Pending' },
    { id: 'diproses', name: 'Diproses' },
    { id: 'dikirim', name: 'Dikirim' },
    { id: 'selesai', name: 'Selesai' },
    { id: 'dibatalkan', name: 'Dibatalkan' },
];

export const OrderList = () => {
    const [filterValue, setFilterValue] = useState('pending');

    const handleChange = useCallback((_event: any, newValue: string) => {
        setFilterValue(newValue);
    }, []);

    return (
        <>
            {/* Bagian Tab Navigasi */}
            <Tabs
                value={filterValue}
                indicatorColor="primary"
                textColor="primary"
                onChange={handleChange}
                sx={{ marginBottom: 2, marginTop: 1 }}
            >
                {tabs.map(choice => (
                    <Tab key={choice.id} label={choice.name} value={choice.id} />
                ))}
            </Tabs>
            <Divider />

            {/* Bagian List - Filter otomatis berubah sesuai Tab */}
            <List
                sort={{ field: 'createdAt', order: 'DESC' }}
                filter={{ status_pesanan: filterValue }} // Filter ke backend
                perPage={25}
            >
                <Datagrid rowClick="show">
                    <TextField source="id" />
                    <TextField source="id_user" label="User ID" />
                    <NumberField source="total_harga" options={{ style: 'currency', currency: 'IDR' }} />

                    {/* ChipField dengan warna custom sederhana */}
                    <ChipField
                        source="status_pesanan"
                        sx={{
                            '& .MuiChip-label': { textTransform: 'uppercase', fontWeight: 'bold' }
                        }}
                    />

                    <DateField source="createdAt" label="Tanggal Pesan" showTime />
                    <ApproveButton />
                    <SelesaiButton />
                </Datagrid>
            </List>
        </>
    );
};