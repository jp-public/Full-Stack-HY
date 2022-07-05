import { useStateValue } from "../state";
import {
  Entry,
  HealthCheckEntry,
  HospitalEntry,
  OccupationalHealthcareEntry,
  HealthCheckRating,
} from "../types";
import {
  Work,
  MedicalServices,
  LocalHospital,
  Favorite,
} from "@mui/icons-material/";

const entryStyle = {
  paddingTop: 10,
  paddingLeft: 2,
  border: "solid",
  borderWidth: 2,
  marginBottom: 5,
};

const listDiagnoses = (entry: Entry) => {
  const [{ diagnoses }] = useStateValue();
  return (
    <div>
      <ul>
        {entry.diagnosisCodes?.map((code) => (
          <li key={code}>
            {code} {diagnoses[code]?.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

const HospitalElement = ({ entry }: { entry: HospitalEntry }) => {
  return (
    <div style={entryStyle}>
      {entry.date} <LocalHospital /> <br />
      <em>{entry.description}</em> <br />
      diagnose by {entry.specialist} <br />
      discharged: {entry.discharge?.date || "no"} <br />
      criteria: {entry.discharge?.criteria || "not available"}
      {listDiagnoses(entry)}
    </div>
  );
};

const HealthCheckIcon = ({ rating }: { rating: HealthCheckRating }) => {
  switch (rating) {
    case 0:
      return <Favorite style={{ fill: "green" }} />;
    case 1:
      return <Favorite style={{ fill: "yellow" }} />;
    case 2:
      return <Favorite style={{ fill: "orange" }} />;
    case 3:
      return <Favorite style={{ fill: "red" }} />;
    default:
      throw new Error("bad rating value");
  }
};

const HealthCheckElement = ({ entry }: { entry: HealthCheckEntry }) => {
  return (
    <div style={entryStyle}>
      {entry.date} <MedicalServices /> <br />
      <em>{entry.description}</em> <br />
      <HealthCheckIcon rating={entry.healthCheckRating} /> <br />
      diagnose by {entry.specialist}
      {listDiagnoses(entry)}
    </div>
  );
};

const OccupationalElement = ({
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
      {listDiagnoses(entry)}
    </div>
  );
};

const assertNever = (value: never): never => {
  throw new Error(
    `Unhandled discriminated union member: ${JSON.stringify(value)}`
  );
};

const EntryDetails: React.FC<{ entry: Entry }> = ({ entry }) => {
  switch (entry.type) {
    case "Hospital":
      return <HospitalElement entry={entry} />;
    case "OccupationalHealthcare":
      return <OccupationalElement entry={entry} />;
    case "HealthCheck":
      return <HealthCheckElement entry={entry} />;
    default:
      return assertNever(entry);
  }
};

export default EntryDetails;
