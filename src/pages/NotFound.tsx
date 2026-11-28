import { Link } from "react-router-dom";
import { Empty } from "../components/ui";

export default function NotFound() {
  return <Empty title="Page not found" action={<Link className="btn primary" to="/">Browse jobs</Link>}>That link doesn't go anywhere on Portfolio Maldives.</Empty>;
}
