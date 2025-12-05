import { Layout} from 'react-admin';
import type {LayoutProps}  from 'react-admin';
import { MyMenu } from './MyMenu';

export const MyLayout = (props: LayoutProps) => (
    <Layout {...props} menu={MyMenu} />
);