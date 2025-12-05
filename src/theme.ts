import {defaultTheme, type RaThemeOptions} from 'react-admin';

export const MyTheme: RaThemeOptions = {
    ...defaultTheme,
    palette: {
        mode: 'light',
        primary: {
            main:'#b35151'
        },
        secondary:{
            main:'#4a1d1d'
        },
        background: {
            default:'#ffffff'
        },
    },
    typography: {
        fontFamily:[
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
    components:{
        MuiButton: {
            styleOverrides: {
                root:{
                    borderRadius: 8,
                },
            },
        },
    },
};
