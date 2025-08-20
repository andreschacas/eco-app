import React from 'react';
import Avatar from '../assets/andres.jpg'; // Replace with the actual path to your avatar image
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

const UserAvatar = ({ avatar, name, role }) => (
  <Stack direction="row" alignItems="center" spacing={1}>
    <Avatar src={avatar} alt={name} sx={{ width: 24, height: 24 }} />
    <Typography variant="caption">{name} ({role})</Typography>
  </Stack>
);

export default UserAvatar;