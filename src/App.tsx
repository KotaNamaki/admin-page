import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { MyTheme } from './theme';
import { MyLayout } from './layout/MyLayout';
import {ProductCreate } from './resource/products/ProductCreate.tsx';
import {ProductList} from "./resource/products/ProductList.tsx";
import {ProductEdit} from "./resource/products/ProductEdit.tsx";
import {OrderList} from "./resource/orders/OrderList.tsx";
import {UsersList} from "./resource/users/UsersList.tsx";
import {MyLoginPage} from "./MyLoginPage.tsx";
import {LayananList} from './resource/layanan/LayananList.tsx';
import {UlasanList} from './resource/ulasan/UlasanList.tsx';
import { Dashboard } from './dashboard/Dashboard';
import {LayananEdit} from "./resource/layanan/LayananEdit.tsx";
import {LayananCreate} from "./resource/layanan/LayananCreate.tsx";
import {UsersEdit} from "./resource/users/UsersEdit.tsx";
import {UsersCreate} from "./resource/users/UsersCreate.tsx";
import {OrderEdit} from "./resource/orders/OrderEdit.tsx";
import {OrderShow} from "./resource/orders/OrderShow.tsx";

// Import resource lain...

export const App = () => (
    <Admin
        dataProvider={dataProvider}
        authProvider={authProvider}
        theme={MyTheme}
        layout={MyLayout}
        loginPage={MyLoginPage}
        dashboard={Dashboard}
    >
        <Resource
            name="products"
            list={ProductList}
            edit={ProductEdit}
            create={ProductCreate}
        />
        <Resource
            name="orders"
            list={OrderList}
            edit={OrderEdit}
            show={OrderShow}
        />
        <Resource
            name="users"
            list={UsersList}
            edit={UsersEdit}
            create={UsersCreate}
        />
        <Resource
            name="layanan"
            list={LayananList}
            edit={LayananEdit}
            create={LayananCreate}
        />
        <Resource
            name="ulasan"
            list={UlasanList}
        />

    </Admin>
);