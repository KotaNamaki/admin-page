import { useEffect, useState } from 'react';
import { fetchUtils, Title, useDataProvider } from 'react-admin';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.motodiv.store';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const Dashboard = () => {
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);

    // State Date Range
    const [dateRange, setDateRange] = useState({
        from: new Date(new Date().getFullYear(), 0, 1).toISOString().slice(0, 10),
        to: new Date().toISOString().slice(0, 10)
    });

    const [kpi, setKpi] = useState<any>({});
    const [salesData, setSalesData] = useState<any[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [lowStock, setLowStock] = useState<any[]>([]);

    // --- 1. Helper Format Waktu (WHERE: Letakkan di sini, di dalam component) ---
    const formatDateIndo = (date: string | Date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. KPI & Status Distribution
                const kpiRes = await fetchUtils.fetchJson(`${API_BASE}/analytics/orders/counters`, { credentials: 'include' });
                setKpi(kpiRes.json);

                // 2. Sales Chart (Dynamic Date)
                const salesRes = await fetchUtils.fetchJson(
                    `${API_BASE}/analytics/sales/by-month?from=${dateRange.from}&to=${dateRange.to}`,
                    { credentials: 'include' }
                );
                setSalesData(salesRes.json.buckets || []);

                // 3. Low Stock
                const stockRes = await fetchUtils.fetchJson(`${API_BASE}/analytics/inventory/low-stock`, { credentials: 'include' });
                setLowStock(stockRes.json || []);

                // 4. Recent Orders (via DataProvider)
                const orders = await dataProvider.getList('orders', {
                    pagination: { page: 1, perPage: 5 },
                    sort: { field: 'created_at', order: 'DESC' },
                    filter: {}
                });
                setRecentOrders(orders.data);

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dataProvider, dateRange]);

    if (loading) return <CircularProgress />;

    return (
        <Box p={2}>
            <Title title="Dashboard" />

            {/* Date Picker */}
            <Box mb={2} display="flex" gap={2}>
                <TextField label="Dari" type="date" value={dateRange.from} onChange={(e) => setDateRange({...dateRange, from: e.target.value})} InputLabelProps={{ shrink: true }} />
                <TextField label="Sampai" type="date" value={dateRange.to} onChange={(e) => setDateRange({...dateRange, to: e.target.value})} InputLabelProps={{ shrink: true }} />
            </Box>

            <Grid container spacing={2}>
                {/* KPI Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <Card><CardContent><Typography variant="overline">Order 7 Hari Terakhir</Typography><Typography variant="h4">{kpi.last7DaysOrders}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card><CardContent><Typography variant="overline">Pesanan Pending</Typography><Typography variant="h4">{kpi.pendingOrders}</Typography></CardContent></Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card><CardContent><Typography variant="overline">Total Customer</Typography><Typography variant="h4">{kpi.totalCustomers}</Typography></CardContent></Card>
                </Grid>

                {/* Charts Row */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6">Tren Penjualan</Typography>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    {/* --- 2. Format di XAxis Chart --- */}
                                    <XAxis
                                        dataKey="period"
                                        tickFormatter={(val) => new Date(val).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    />
                                    <YAxis />
                                    {/* --- 3. Format di Tooltip Chart --- */}
                                    <Tooltip labelFormatter={(val) => formatDateIndo(val)} />
                                    <Line type="monotone" dataKey="total" stroke="#8884d8" />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ height: 400 }}>
                        <CardContent>
                            <Typography variant="h6">Status Pesanan</Typography>
                            <ResponsiveContainer width="100%" height={320}>
                                <PieChart>
                                    <Pie data={kpi.statusDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                        // Ganti baris ini:
                                        {kpi.statusDistribution?.map((_ : any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bottom Row: Tables */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">Pesanan Terbaru</Typography>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Tanggal</TableCell><TableCell>ID</TableCell><TableCell>Total</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {recentOrders.map(o => (
                                        <TableRow key={o.id}>
                                            {/* --- 4. Format di Tabel --- */}
                                            <TableCell>{formatDateIndo(o.created_at)}</TableCell>
                                            <TableCell>{o.id}</TableCell>
                                            <TableCell>Rp {Number(o.total_harga).toLocaleString('id-ID')}</TableCell>
                                            <TableCell>{o.status_pesanan}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" color="error">Stok Menipis</Typography>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Produk</TableCell><TableCell>Stok</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {lowStock.map((p: any) => (
                                        <TableRow key={p.id}>
                                            <TableCell>{p.nama_produk}</TableCell>
                                            <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>{p.stok}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;