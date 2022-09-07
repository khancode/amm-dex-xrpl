import React from 'react'
import Modal from 'react-bootstrap/Modal'

interface TransactionSubmissionModalProps {
  show: boolean
}

export const TransactionSubmissionModal: React.FC<
  TransactionSubmissionModalProps
> = ({ show }: TransactionSubmissionModalProps) => {
  return (
    <Modal show={show} aria-labelledby="contained-modal-title-vcenter">
      <Modal.Header>
        <Modal.Title id="contained-modal-title-vcenter">
          Submitting transaction...
        </Modal.Title>
      </Modal.Header>
      <Modal.Body></Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  )
}
