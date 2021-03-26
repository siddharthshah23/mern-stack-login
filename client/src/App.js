import "./App.css";
import { Route, Switch } from "react-router-dom";
import Navbar from "./core/Navbar";
import Home from "./components/Home";
import Signup from "./components/auth/Signup";

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/signup" component={Signup} />
      </Switch>
    </div>
  );
};

export default App;
