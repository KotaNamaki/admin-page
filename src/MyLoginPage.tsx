import { useState } from 'react';
import { useLogin, useNotify, Notification } from 'react-admin';
import { Box, Card, CardContent, Button, Avatar, Typography, TextField } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export const MyLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const login = useLogin();
    const notify = useNotify();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // authProvider mengharapkan 'username' & 'password'
        login({ username: email, password }).catch(() =>
            notify('Login gagal: Email atau password salah')
        );
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2c3e50', // Warna Primary Theme
                backgroundImage: 'radial-gradient(circle at 50% 14em, #34495e 0%, #2c3e50 60%, #2c3e50 100%)',
            }}
        >
            <Card sx={{ minWidth: 300, maxWidth: 350, boxShadow: 6 }}>
                <Box sx={{ margin: '1em', display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <Avatar sx={{ m: 1, bgcolor: '#e67e22' }}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography variant="h5">MotoDiv Admin</Typography>
                </Box>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email"
                            type="email"
                            fullWidth
                            margin="normal"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            margin="normal"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button
                            variant="contained"
                            type="submit"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2, py: 1.2 }}
                        >
                            Masuk
                        </Button>
                    </form>
                </CardContent>
            </Card>
            <Notification />
        </Box>
    );
};