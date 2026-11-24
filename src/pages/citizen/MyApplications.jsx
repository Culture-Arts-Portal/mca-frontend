import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function MyApplications() {
  const { user } = useAuth();

  return (
    <section>
      <h1>My applications</h1>
      <p className="lead">
        Applications you’ve started or submitted will appear here, {user.fullName.split(" ")[0]}.
      </p>
      <div className="notice">
        <strong>You haven’t applied for anything yet.</strong>{" "}
        <Link to="/services">Browse services</Link> to get started.
      </div>
    </section>
  );
}