import { useEffect, useMemo, useState } from 'react';
import { fetchUtils, Title, useDataProvider } from 'react-admin';
import { Box, Grid, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ScatterChart,
    Scatter,
} from 'recharts';

type CounterResponse = {
    last7DaysOrders: number;
    pendingOrders: number;
    windowDays?: number;
};

type MonthBucket = { period: string; total: number };

const API_BASE = import.meta.env.VITE_API_URL || 'https://api.motodiv.store';

const toISO = (d: Date) => d.toISOString();

const startOfYear = (now = new Date()) => new Date(now.getFullYear(), 0, 1);
const endOfYear = (now = new Date()) => new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
const daysAgo = (n: number, now = new Date()) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

export const Dashboard = () => {
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [counters, setCounters] = useState<CounterResponse | null>(null);
    const [monthly, setMonthly] = useState<MonthBucket[]>([]);
    const [scatter, setScatter] = useState<{ x: Date; y: number }[]>([]);

    const rangeYear = useMemo(() => {
        const now = new Date();
        return {
            from: startOfYear(now),
            to: endOfYear(now),
        };
    }, []);

    const range30Days = useMemo(() => {
        const to = new Date();
        const from = daysAgo(30, to);
        return { from, to };
    }, []);

    useEffect(() => {
        let cancelled = false;
        const run = async () => {
            setLoading(true);
            setError(null);
            try {
                // 1) Counters (last 7 days + pending)
                const countersRes = await fetchUtils.fetchJson(
                    `${API_BASE}/analytics/orders/counters?lastDays=7`,
                    { credentials: 'include' }
                );
                if (!cancelled) setCounters(countersRes.json as CounterResponse);

                // 2) Monthly sales buckets for current year
                const salesRes = await fetchUtils.fetchJson(
                    `${API_BASE}/analytics/sales/by-month?from=${
                        toISO(rangeYear.from).slice(0, 10)
                    }&to=${toISO(rangeYear.to).slice(0, 10)}`,
                    { credentials: 'include' }
                );
                const buckets: MonthBucket[] = (salesRes.json && salesRes.json.buckets) || [];
                if (!cancelled) setMonthly(buckets);

                // 3) Scatter data: fetch orders last 30 days, map to points
                type Order = { createdAt: string | number | Date; total_harga?: number | string };
                const ordersRes = await dataProvider.getList('orders', {
                    pagination: { page: 1, perPage: 1000 },
                    sort: { field: 'createdAt', order: 'ASC' },
                    filter: {
                        createdAt_gte: toISO(range30Days.from),
                        createdAt_lte: toISO(range30Days.to),
                    },
                });
                const points = (ordersRes.data as Order[]).map(o => ({
                    x: new Date(o.createdAt),
                    y: Number(o.total_harga ?? 0) || 0,
                }));
                if (!cancelled) setScatter(points);
            } catch (e: unknown) {
                const message = e instanceof Error ? e.message : String(e);
                if (!cancelled) setError(message || 'Failed to load dashboard data');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        run();
        return () => {
            cancelled = true;
        };
    }, [dataProvider, rangeYear.from, rangeYear.to, range30Days.from, range30Days.to]);

    // Recharts tooltip formatters with explicit types (no `any`)
    const tooltipFormatter = (val: number | string, name: string): [number | string, string] => [val, name];
    const tooltipLabelFormatter = (label: number | string): string => {
        const n = typeof label === 'number' ? label : Number(label);
        return Number.isFinite(n) ? new Date(n).toLocaleString() : String(label);
    };

    return (
        <Box p={2}>
            <Title title="Dashboard" />
            {loading ? (
                <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Card>
                    <CardContent>
                        <Typography color="error">{error}</Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {/* KPIs */}
                    <Grid item xs={12} md={6} lg={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="overline">Orders (last 7 days)</Typography>
                                <Typography variant="h4">{counters?.last7DaysOrders ?? 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6} lg={3}>
                        <Card>
                            <CardContent>
                                <Typography variant="overline">Pending Orders</Typography>
                                <Typography variant="h4">{counters?.pendingOrders ?? 0}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Line Chart - Monthly Sales */}
                    <Grid item xs={12} lg={8}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Monthly Sales (IDR)
                                </Typography>
                                <Box height={320}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={monthly} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="total" stroke="#1976d2" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Scatter - Order Value over Time */}
                    <Grid item xs={12} lg={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Orders (last 30 days)
                                </Typography>
                                <Box height={320}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                                            <CartesianGrid />
                                            <XAxis
                                                dataKey="x"
                                                domain={[range30Days.from.getTime(), range30Days.to.getTime()]}
                                                name="Date"
                                                tickFormatter={(v: number) => new Date(v).toLocaleDateString()}
                                                type="number"
                                            />
                                            <YAxis dataKey="y" name="Total (IDR)" />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                formatter={tooltipFormatter}
                                                labelFormatter={tooltipLabelFormatter}
                                            />
                                            <Scatter data={scatter.map(p => ({ ...p, x: p.x.getTime() }))} fill="#9c27b0" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default Dashboard;
