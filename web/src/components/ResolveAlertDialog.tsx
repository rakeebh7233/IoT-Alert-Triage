"use client";

import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack} from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useResolveAlertMutation } from "../features/alerts/api/alertsApi";

type ResolveAlertDialogProps = {
  alertId: number;
  open: boolean;
  onClose: () => void;
};

const schema = Yup.object({
  resolution_type: Yup.string().required("Resolution type is required"),
  root_cause: Yup.string().required("Root cause is required"),
  action_taken: Yup.string().required("Action taken is required"),
  preventive_measures: Yup.string().optional(),
  time_spent_minutes: Yup.number()
    .typeError("Time spent must be a number")
    .min(0, "Time spent cannot be negative")
    .optional(),
});

const resolutionTypes = [
  { value: "fixed", label: "Fixed" },
  { value: "false_alarm", label: "False Alarm" },
  { value: "known_issue", label: "Known Issue" },
  { value: "deferred", label: "Deferred" },
  { value: "cannot_reproduce", label: "Cannot Reproduce" },
];

export function ResolveAlertDialog({
  alertId,
  open,
  onClose,
}: ResolveAlertDialogProps) {
  const [resolveAlert, { isLoading }] = useResolveAlertMutation();

  return (
    <Formik
      initialValues={{
        resolution_type: "",
        root_cause: "",
        action_taken: "",
        preventive_measures: "",
        time_spent_minutes: "",
      }}
      validationSchema={schema}
      enableReinitialize
      onSubmit={async (values, helpers) => {
        await resolveAlert({
          alertId,
          resolution_type: values.resolution_type,
          root_cause: values.root_cause,
          action_taken: values.action_taken,
          preventive_measures: values.preventive_measures || undefined,
          time_spent_minutes:
            values.time_spent_minutes === ""
              ? undefined
              : Number(values.time_spent_minutes),
        }).unwrap();

        helpers.resetForm();
        onClose();
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isValid,
        dirty,
      }) => (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
          <DialogTitle>Resolve Alert</DialogTitle>

          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                name="resolution_type"
                label="Resolution Type"
                value={values.resolution_type}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.resolution_type && Boolean(errors.resolution_type)}
                helperText={touched.resolution_type && errors.resolution_type}
                fullWidth
              >
                {resolutionTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                name="root_cause"
                label="Root Cause"
                value={values.root_cause}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.root_cause && Boolean(errors.root_cause)}
                helperText={touched.root_cause && errors.root_cause}
                fullWidth
              />

              <TextField
                name="action_taken"
                label="Action Taken"
                value={values.action_taken}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.action_taken && Boolean(errors.action_taken)}
                helperText={touched.action_taken && errors.action_taken}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                name="preventive_measures"
                label="Preventive Measures"
                value={values.preventive_measures}
                onChange={handleChange}
                onBlur={handleBlur}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                name="time_spent_minutes"
                label="Time Spent (minutes)"
                type="number"
                value={values.time_spent_minutes}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.time_spent_minutes &&
                  Boolean(errors.time_spent_minutes)
                }
                helperText={
                  touched.time_spent_minutes && errors.time_spent_minutes
                }
                fullWidth
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => handleSubmit()}
              disabled={!dirty || !isValid || isLoading}
            >
              {isLoading ? "Resolving..." : "Resolve"}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Formik>
  );
}