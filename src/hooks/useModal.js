import { useState } from 'react';

export default function useModal(initialOpen = false) {
  const [open, setOpen] = useState(initialOpen);
  const [data, setData] = useState(null);
  const openModal = (modalData = null) => {
    setData(modalData);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setData(null);
  };
  return { open, data, openModal, closeModal };
}