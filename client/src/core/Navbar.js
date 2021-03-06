import React, { Fragment } from "react";
import { Link, withRouter } from "react-router-dom";
import { isAuth, signout } from "../components/auth/Helper";

const Navbar = ({ children, match, history }) => {
  const nav = () => (
    <ul className="nav nav-tabs bg-primary">
      <li className="nav-item">
        <Link to="/" className="nav-link text-light">
          Home
        </Link>
      </li>

      {!isAuth() && (
        <Fragment>
          <li className="nav-item ">
            <Link to="/signin" className="nav-link text-light">
              Signin
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/signup" className="nav-link text-light">
              Signup
            </Link>
          </li>
        </Fragment>
      )}

      {isAuth() && (
        <li className="nav-item">
          <span className="nav-link">{isAuth().name}</span>
        </li>
      )}

      {isAuth() && (
        <li className="nav-item">
          <span
            className="nav-link"
            style={{ cursor: "pointer", color: "#fff" }}
            onClick={() => {
              signout(() => {
                console.log("Signout");
              });
            }}
          >
            Signout
          </span>
        </li>
      )}
    </ul>
  );

  return (
    <Fragment>
      {nav()}
      <div className="container">{children}</div>
    </Fragment>
  );
};

export default Navbar;
