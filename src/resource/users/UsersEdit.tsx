import { Edit, SimpleForm, TextInput, PasswordInput, required, email } from 'react-admin';

export const UsersEdit = () => (
    <Edit>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="nama" validate={[required()]} fullWidth />
            <TextInput source="email" validate={[required(), email()]} fullWidth />
            <TextInput source="no_hp" label="No. Handphone" />
            <PasswordInput source="password" label="Password (opsional)" />
        </SimpleForm>
    </Edit>
);