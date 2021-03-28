import "./App.css";
import { Route, Switch } from "react-router-dom";
import Navbar from "./core/Navbar";
import Home from "./components/Home";
import Signup from "./components/auth/Signup";
import Signin from "./components/auth/Signin";
import ActivateAccount from "./components/auth/ActivateAccount";

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/signup" component={Signup} />
        <Route exact path="/signin" component={Signin} />
        <Route exact path="/auth/activate/:token" component={ActivateAccount} />
      </Switch>
    </div>
  );
};

export default App;

// import React from "react";
// import Layout from "./core/Layout";

// const App = () => {
//   return (
//     <Layout>
//       <h1>Hello React</h1>
//     </Layout>
//   );
// };

// export default App;
