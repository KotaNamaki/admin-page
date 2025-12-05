import {Create, SimpleForm, TextInput, PasswordInput, required, email, SelectInput} from 'react-admin';

export const UsersCreate = () => (
    <Create redirect="list">
        <SimpleForm>
            <TextInput source="nama" validate={[required()]} fullWidth />
            <TextInput source="email" validate={[required(), email()]} fullWidth />
            <PasswordInput source="password" validate={[required()]} fullWidth />
            <TextInput source="no_hp" label="No. Handphone" />
            <SelectInput source="kategori" choices={[
                { id: 'admin', name: 'admin' },
                { id: 'customer', name: 'customer' },
            ]} validate={[required()]} />
        </SimpleForm>
    </Create>
);