import { Button } from "@twilio-paste/core";
import { useHistory } from "react-router-dom";

const Navigation: React.FC = () => {
  const history = useHistory();

  return (
    <Button variant="link" onClick={() => history.push("/settings")}>
      Settings
    </Button>
  );
};

export default Navigation;
