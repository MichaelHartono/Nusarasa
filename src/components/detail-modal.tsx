import { Modal, Label, TextInput, Button } from "flowbite-react";
import { useState, useEffect } from "react";

interface DetailModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (detailName: string) => void;
  detailType: "Ingredient" | "Utensil" | "Category";
  modalType: "Add" | "Update";
  currentDetailName?: string;
  existingDetails: string[];
}

const DetailModal: React.FC<DetailModalProps> = ({
  show,
  onClose,
  onSubmit,
  detailType,
  modalType,
  currentDetailName,
  existingDetails,
}) => {
  const [detailName, setDetailName] = useState("");
  const [updatedDetails, setUpdatedDetails] = useState<string[]>([])
  const [error, setError] = useState("");

  useEffect(() => {
    if (existingDetails){
      setUpdatedDetails(existingDetails)
    } else {
      setUpdatedDetails([])
    }
  },[existingDetails])

  useEffect(() => {
    if (currentDetailName) {
      setDetailName(currentDetailName);
    } else {
      setDetailName("");
    }
  }, [currentDetailName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailName.trim()) {
      setError(`${detailType} Name is required`);
      return;
    }
    if (existingDetails.includes(detailName.trim())) {
      setError(`${detailType} already existed`);
      return;
    }
    onSubmit(detailName);
  };

  return (
    <Modal
      dismissible
      show={show}
      onClose={() => {
        onClose();
        setError("");
        setDetailName("");
      }}
    >
      <form onSubmit={handleSubmit}>
        <Modal.Header>
          {modalType} {detailType}
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2 block">
            <Label htmlFor={detailType} value={`${detailType} Name`} />
          </div>
          <TextInput
            id={detailType}
            type="text"
            value={detailName}
            onChange={(e) => {
              setDetailName(e.target.value);
              setError("");
            }}
            placeholder={`Input ${detailType} Name`}
          />
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </Modal.Body>
        <Modal.Footer className="justify-end">
          <Button type="submit">{modalType}</Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default DetailModal;
