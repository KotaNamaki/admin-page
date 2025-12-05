/* eslint-disable @typescript-eslint/no-explicit-any */
import simpleRestProvider from 'ra-data-simple-rest';
import { fetchUtils, type DataProvider } from 'react-admin';
import queryString from 'query-string';

const apiUrl = import.meta.env.VITE_API_URL || 'https://api.motodiv.store';

// Centralized error logger for dataProvider/httpClient
const logHttpError = (
    err: any,
    ctx: {
        url?: string;
        method?: string;
        resource?: string;
        action?: string;
        payload?: any;
    } = {}
) => {
    const time = new Date().toISOString();
    const status = err?.status ?? err?.response?.status;
    const message = err?.message ?? 'Unknown error';
    const body = err?.body ?? err?.response?.body ?? err?.response?.data;
    // eslint-disable-next-line no-console
    console.error('[dataProvider error]', {
        time,
        status,
        message,
        body,
        ...ctx,
    });
};

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
    // Always include credentials for session-based auth
    (options as any).credentials = 'include';

    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    return fetchUtils.fetchJson(url, options).catch((err: any) => {
        logHttpError(err, {
            url,
            method: (options as any)?.method,
            action: 'httpClient',
        });
        // Rethrow as HttpError if not already
        if (err && (err.name === 'HttpError' || typeof err.status === 'number')) {
            throw err;
        }
        const status = err?.status ?? 0;
        const message = err?.message ?? 'Network/Unknown error';
        const body = err?.body;
        throw new (fetchUtils as any).HttpError(message, status, body);
    });
};

const baseDataProvider = simpleRestProvider(apiUrl, httpClient);

// Peta nama resource (frontend) ke endpoint backend
const resourcePathMap: Record<string, string> = {
    orders: 'orders',
    users: 'users',
    layanan: 'layanan',
    ulasan: 'ulasan',
    products: 'products',
};

const mapResource = (resource: string) => resourcePathMap[resource] || resource;

// Try to pull a stable React-Admin `id` from various shapes
const normalizeRecord = (rec: any) => {
    if (rec && typeof rec === 'object') {
        if ('id' in rec) return rec;

        // Common alternative id fields used by various backends
        const idCandidates = [
            '_id',
            'user_id',
            'id_user',
            'pengguna_id',
            'id_pengguna',
            // layanan specific
            'layanan_id',
            'id_layanan',
            // generic variants frequently returned by SQL drivers or services
            'insertId',
            'userId',
        ];
        for (const key of idCandidates) {
            if (key in rec) {
                const { [key]: anyId, ...rest } = rec as Record<string, any>;
                return { id: anyId, ...rest };
            }
        }

        // Generic fallback: if exactly one key matches *_id or id_* pattern, use it
        const keys = Object.keys(rec);
        const patternMatches = keys.filter(k => /(^id_.+)|(.+_id$)/i.test(k));
        if (patternMatches.length === 1) {
            const k = patternMatches[0];
            const { [k]: anyId, ...rest } = rec as Record<string, any>;
            return { id: anyId, ...rest };
        }
    }
    return rec;
};

const normalizeArray = (items: any[]): any[] => items.map(normalizeRecord);

export const dataProvider: DataProvider = {
    ...baseDataProvider,

    getList: async (resource, params) => {
        const endpoint = mapResource(resource);
        const { page, perPage } = params.pagination || { page: 1, perPage: 10 };
        const { field, order } = params.sort || { field: 'id', order: 'ASC' };

        const query = {
            sort: JSON.stringify([field, order]),
            range: JSON.stringify([(page - 1) * perPage, page * perPage - 1]),
            filter: JSON.stringify(params.filter),
        };
        const url = `${apiUrl}/${endpoint}?${queryString.stringify(query)}`;

        try {
            const { headers, json } = await httpClient(url);

            if (headers.has('content-range')) {
                const arr = Array.isArray(json) ? normalizeArray(json) : Array.isArray(json?.data) ? normalizeArray(json.data) : [];
                const data = resource === 'layanan' ? arr.map(r => ({
                    ...(r || {}),
                    nama_layanan: (r as any).nama_layanan ?? (r as any).nama,
                })) : arr;
                return {
                    data,
                    total: parseInt(headers.get('content-range')!.split('/').pop() || '0', 10),
                };
            }

            if (Array.isArray(json)) {
                const start = (page - 1) * perPage;
                const end = page * perPage;
                const dataSlice = json.length > perPage ? json.slice(start, end) : json;
                const norm = normalizeArray(dataSlice);
                const data = resource === 'layanan' ? norm.map(r => ({
                    ...(r || {}),
                    nama_layanan: (r as any).nama_layanan ?? (r as any).nama,
                })) : norm;
                return {
                    data,
                    total: json.length,
                };
            }

            if (json && typeof json === 'object') {
                const container = json as Record<string, any>;
                const listKey = ['data', 'items', 'rows', 'result', endpoint, resource].find(k => Array.isArray(container[k]));
                const totalKey = ['total', 'count', 'totalCount'].find(k => typeof container[k] === 'number');

                if (listKey) {
                    const all = container[listKey] as any[];
                    const start = (page - 1) * perPage;
                    const end = page * perPage;
                    const sliced = all.length > perPage ? all.slice(start, end) : all;
                    const norm = normalizeArray(sliced);
                    const data = resource === 'layanan' ? norm.map(r => ({
                        ...(r || {}),
                        nama_layanan: (r as any).nama_layanan ?? (r as any).nama,
                    })) : norm;
                    return {
                        data,
                        total: typeof totalKey === 'string' ? container[totalKey] : all.length,
                    };
                }
            }

            return { data: [], total: 0 };

        } catch (error) {
            console.error(`Error fetching ${resource}:`, error);
            logHttpError(error, { resource, action: 'getList', url });
            return { data: [], total: 0 };
        }
    },

    create: (resource, params) => {
        const endpoint = mapResource(resource);
        const data = params.data as any;

        // Special-case: users
        if (endpoint === 'users') {
            const payload: any = {
                nama: data.nama,
                email: data.email,
                password: data.password,
                no_hp: data.no_hp,
                role: data.kategori,
            };
            return httpClient(`${apiUrl}/auth/register`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
            })
                .then(({ json }) => {
                    const container: any = json;
                    const rec = (container?.user ?? container?.data ?? container) as any;
                    let norm = normalizeRecord(rec);
                    if (!norm || typeof norm !== 'object' || !('id' in norm)) {
                        const coalescedId = container?.id ?? container?.insertId ?? container?.user_id ?? container?._id ?? container?.userId;
                        if (coalescedId != null) {
                            norm = { ...(norm && typeof norm === 'object' ? norm : {}), id: coalescedId };
                        }
                    }
                    return { data: norm };
                })
                .catch((err) => {
                    logHttpError(err, {
                        url: `${apiUrl}/auth/register`,
                        method: 'POST',
                        resource: 'users',
                        action: 'create',
                        payload,
                    });
                    throw err;
                });
        }

        // Special-case: layanan
        if (endpoint === 'layanan') {
            // FIX: Mengirim semua field yang dibutuhkan backend
            const payload: any = {
                nama_layanan: data.nama_layanan ?? data.nama,
                // Pastikan estimasi_harga terkirim
                estimasi_harga: data.estimasi_harga ? Number(data.estimasi_harga) : Number(data.harga),
                jenis_modifikasi: data.jenis_modifikasi,
                deskripsi: data.deskripsi,
                estimasi_waktu: data.estimasi_waktu,
            };
            return httpClient(`${apiUrl}/${endpoint}`, {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
            })
                .then(({ json }) => {
                    const container: any = json;
                    let base = normalizeRecord(container?.data ?? container);
                    if (!('id' in (base || {}))) {
                        const coalescedId = container?.id ?? container?.insertId ?? container?.layanan_id ?? container?.id_layanan;
                        if (coalescedId != null) {
                            base = { ...(base || {}), id: coalescedId };
                        }
                    }
                    const withAlias = {
                        ...base,
                        nama_layanan: (base as any).nama_layanan ?? (base as any).nama,
                    };
                    return { data: withAlias };
                })
                .catch((err) => {
                    logHttpError(err, {
                        url: `${apiUrl}/${endpoint}`,
                        method: 'POST',
                        resource: 'layanan',
                        action: 'create',
                        payload,
                    });
                    throw err;
                });
        }

        // Default handler (products etc)
        if (endpoint !== 'products' || !data.gambar) {
            return baseDataProvider.create(endpoint, params).then((res) => ({
                ...res,
                data: normalizeRecord(res.data),
            }));
        }

        // File upload handler
        const formData = new FormData();
        for (const key in data) {
            const value = data[key];
            if (key === 'gambar' && value && typeof value === 'object' && 'rawFile' in value) {
                formData.append(key, value.rawFile);
            } else {
                formData.append(key, String(value));
            }
        }

        return httpClient(`${apiUrl}/${endpoint}`, {
            method: 'POST',
            body: formData,
        }).then(({ json }) => ({ data: normalizeRecord(json) }));
    },

    update: (resource, params) => {
        const endpoint = mapResource(resource);
        const data = params.data as any;

        // Special-case: users
        if (endpoint === 'users') {
            const { id, ...rest } = data;
            return httpClient(`${apiUrl}/users/update/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify(rest),
                headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
            })
                .then(({ json }) => {
                    const container: any = json;
                    const rec = (container?.user ?? container?.data ?? container) as any;
                    let norm = normalizeRecord(rec);
                    if (!norm || typeof norm !== 'object' || !('id' in norm)) {
                        const coalescedId = container?.id ?? container?.insertId ?? container?.user_id ?? container?._id ?? container?.userId ?? params.id;
                        if (coalescedId != null) {
                            norm = { ...(norm && typeof norm === 'object' ? norm : {}), id: coalescedId };
                        }
                    }
                    return { data: norm };
                })
                .catch((err) => {
                    logHttpError(err, {
                        url: `${apiUrl}/users/update/${params.id}`,
                        method: 'PATCH',
                        resource: 'users',
                        action: 'update',
                        payload: rest,
                    });
                    throw err;
                });
        }

        // Special-case: layanan
        if (endpoint === 'layanan') {
            // FIX: Mengirim semua field yang dibutuhkan backend untuk update
            const payload: any = {
                nama_layanan: data.nama_layanan ?? data.nama,
                // Pastikan estimasi_harga terkirim
                estimasi_harga: data.estimasi_harga ? Number(data.estimasi_harga) : Number(data.harga),
                jenis_modifikasi: data.jenis_modifikasi,
                deskripsi: data.deskripsi,
                estimasi_waktu: data.estimasi_waktu,
            };
            return httpClient(`${apiUrl}/${endpoint}/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify(payload),
                headers: new Headers({ 'Content-Type': 'application/json', Accept: 'application/json' }),
            })
                .then(({ json }) => {
                    const container: any = json;
                    let base = normalizeRecord(container?.data ?? container);
                    if (!('id' in (base || {}))) {
                        const coalescedId = container?.id ?? container?.insertId ?? container?.layanan_id ?? container?.id_layanan ?? params.id;
                        if (coalescedId != null) {
                            base = { ...(base || {}), id: coalescedId };
                        }
                    }
                    const withAlias = {
                        ...base,
                        nama_layanan: (base as any).nama_layanan ?? (base as any).nama,
                    };
                    return { data: withAlias };
                })
                .catch((err) => {
                    logHttpError(err, {
                        url: `${apiUrl}/${endpoint}/${params.id}`,
                        method: 'PATCH',
                        resource: 'layanan',
                        action: 'update',
                        payload,
                    });
                    throw err;
                });
        }

        // Default handler
        if (endpoint !== 'products' || !data.gambar) {
            return baseDataProvider.update(endpoint, params).then((res) => ({
                ...res,
                data: normalizeRecord(res.data),
            }));
        }

        // File upload handler
        const formData = new FormData();
        for (const key in data) {
            const value = data[key];
            if (key === 'gambar' && value && typeof value === 'object' && 'rawFile' in value) {
                formData.append(key, value.rawFile);
            } else if (key === 'gambar' && typeof value === 'string') {
                continue;
            } else {
                formData.append(key, String(value));
            }
        }

        return httpClient(`${apiUrl}/${endpoint}/${params.id}`, {
            method: 'PATCH',
            body: formData,
        }).then(({ json }) => ({ data: normalizeRecord(json) }));
    },

    getOne: (resource, params) =>
        baseDataProvider.getOne(mapResource(resource), params).then((res) => ({
            ...res,
            data: normalizeRecord(res.data),
        })),

    getMany: (resource, params) =>
        baseDataProvider.getMany(mapResource(resource), params).then((res) => ({
            ...res,
            data: normalizeArray(res.data),
        })),

    getManyReference: (resource, params) =>
        baseDataProvider.getManyReference(mapResource(resource), params).then((res) => ({
            ...res,
            data: normalizeArray(res.data),
        })),

    delete: (resource, params) =>
        baseDataProvider.delete(mapResource(resource), params).then((res) => ({
            ...res,
            data: normalizeRecord(res.data),
        })),
    deleteMany: (resource, params) =>
        baseDataProvider.deleteMany(mapResource(resource), params),
    updateMany: (resource, params) =>
        baseDataProvider.updateMany(mapResource(resource), params),
};