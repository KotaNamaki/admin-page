import {Menu} from 'react-admin';
import type {MenuProps} from 'react-admin';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReviewsIcon from '@mui/icons-material/RateReview';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';

// Terima props dan sebarkan (spread) ke komponen Menu
export const MyMenu = (props: MenuProps) => (
    <Menu {...props}>
        <Menu.DashboardItem />
        <Menu.Item to="/products" primaryText="Produk" leftIcon={<InventoryIcon />} />
        <Menu.Item to="/orders" primaryText="Pesanan" leftIcon={<ShoppingCartIcon />} />
        <Menu.Item to="/layanan" primaryText="Layanan" leftIcon={<MiscellaneousServicesIcon />} />
        <Menu.Item to="/users" primaryText="Pengguna" leftIcon={<PeopleIcon />} />
        <Menu.Item to="/ulasan" primaryText="Ulasan" leftIcon={<ReviewsIcon />} />
    </Menu>
);