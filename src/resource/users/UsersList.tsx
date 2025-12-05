import { List, Datagrid, TextField, EmailField} from 'react-admin';

export const UsersList = () => (
    <List>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="nama" />
            <EmailField source="email" />
            <TextField source="no_hp" label="No. Handphone" />
            <TextField source="role" label="Role" />
        </Datagrid>
    </List>
);