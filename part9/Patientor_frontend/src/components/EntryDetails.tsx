import { LocalHospital, Work, MedicalServices } from "@mui/icons-material/";

import {
  Entry,
  HealthCheckEntry,
  HospitalEntry,
  OccupationalHealthcareEntry,
} from "../types";
import DiagnosesList from "./DiagnosesList";
import HealthCheckIcon from "./HealthCheckIcon";
import { assertNever } from "../utils/helpers";

const entryStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: "solid",
  borderWidth: 2,
  marginBottom: 5,
};

const HospitalElement = ({ entry }: { entry: HospitalEntry }) => {
  return (
    <div style={entryStyle}>
      {entry.date} <LocalHospital /> <br />
      <em>{entry.description}</em> <br />
      diagnose by {entry.specialist} <br />
      discharged: {entry.discharge?.date || "no"} <br />
      criteria: {entry.discharge?.criteria}
      <DiagnosesList entry={entry} />
    </div>
  );
};

const OccupationalHealthcareElement = ({
  entry,
}: {
  entry: OccupationalHealthcareEntry;
}) => {
  return (
    <div style={entryStyle}>
      {entry.date} <Work /> {entry.employerName} <br />
      <em>{entry.description}</em> <br />
      diagnose by {entry.specialist} <br />
      sickleave: {entry.sickLeave?.startDate || "no"} {entry.sickLeave?.endDate}
      <DiagnosesList entry={entry} />
    </div>
  );
};

const HealthCheckElement = ({ entry }: { entry: HealthCheckEntry }) => {
  return (
    <div style={entryStyle}>
      {entry.date} <MedicalServices /> <br />
      <em>{entry.description}</em> <br />
      <HealthCheckIcon rating={entry.healthCheckRating} /> <br />
      diagnose by {entry.specialist}
      <DiagnosesList entry={entry} />
    </div>
  );
};

const EntryDetails: React.FC<{ entry: Entry }> = ({ entry }) => {
  switch (entry.type) {
    case "Hospital":
      return <HospitalElement entry={entry} />;
    case "OccupationalHealthcare":
      return <OccupationalHealthcareElement entry={entry} />;
    case "HealthCheck":
      return <HealthCheckElement entry={entry} />;
    default:
      return assertNever(entry);
  }
};

export default EntryDetails;
