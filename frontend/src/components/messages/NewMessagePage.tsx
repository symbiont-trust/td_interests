import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NewMessageDialog } from './NewMessageDialog';

export const NewMessagePage: React.FC = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/messages');
  };

  return <NewMessageDialog open={true} onClose={handleClose} />;
};