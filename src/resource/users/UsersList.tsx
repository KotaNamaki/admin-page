import {List, Datagrid, TextField, EmailField, TextInput} from 'react-admin';

const UserFilters = [
    <TextInput source="q" label="Search" alwaysOn/>
]
export const UsersList = () => (
    <List filters={UserFilters} sort={{field: 'id', order:'DESC'}}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="nama" />
            <EmailField source="email" />
            <TextField source="no_hp" label="No. Handphone" />
            <TextField source="role" label="Role" />
        </Datagrid>
    </List>
);