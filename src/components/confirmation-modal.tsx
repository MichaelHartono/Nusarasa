import { Modal, Button } from "flowbite-react";

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string; 
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, onClose, onConfirm, itemName }) => {
  return (
    <Modal dismissible={false} show={show} onClose={onClose}>
      <Modal.Header>Delete Confirmation</Modal.Header>
      <Modal.Body>Are you sure you want to delete <span className="text-nusa-red font-semibold italic">{itemName}</span> ?</Modal.Body>
      <Modal.Footer className="justify-end">
        <Button onClick={onClose} color="failure">Cancel</Button>
        <Button onClick={onConfirm} color="success">Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
