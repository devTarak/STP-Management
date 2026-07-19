import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export default function RejectDialog({ open, onClose, onConfirm }) {
  const [feedback, setFeedback] = useState('');

  const handleClose = () => {
    setFeedback('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(feedback.trim());
    setFeedback('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Reject Application</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          multiline
          rows={4}
          fullWidth
          label="Rejection Feedback"
          placeholder="Provide a reason for rejection..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleConfirm} disabled={!feedback.trim()}>
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
