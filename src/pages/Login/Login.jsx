import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets';
import { signup, login, resetPass } from '../../config/firebase';

const Login = () => {

  const [currState, setCurrState] = useState("Sign up");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitHandler = (event) => {
    event.preventDefault();
    if (currState === "Sign up") {
      signup(userName, email, password);
    } else {
      login(email, password);
    }
  }

  return (
    <div className='login'>
      <img className='logo' src={assets.logo_big} alt="" />
      <form onSubmit={onSubmitHandler} className='login-form'>
        <h2>{currState}</h2>
        {currState === "Sign up" ? (
          <input
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
            className='form-input'
            type="text"
            placeholder='Username'
            required
          />
        ) : null}

        <input
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          className='form-input'
          type="email"
          placeholder='Email address'
          required
        />

        <div className="password-container">
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className='form-input'
            type={showPassword ? "text" : "password"}
            placeholder='Password'
            required
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7.5 4.5 3.5 7.5 1.5 12C3.5 16.5 7.5 19.5 12 19.5C16.5 19.5 20.5 16.5 22.5 12C20.5 7.5 16.5 4.5 12 4.5ZM12 17C9 17 6.5 14.5 6.5 12C6.5 9.5 9 7 12 7C15 7 17.5 9.5 17.5 12C17.5 14.5 15 17 12 17ZM12 9C10.5 9 9 10.5 9 12C9 13.5 10.5 15 12 15C13.5 15 15 13.5 15 12C15 10.5 13.5 9 12 9Z"
                  fill="#999"
                />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 4.5C7.5 4.5 3.5 7.5 1.5 12C3.5 16.5 7.5 19.5 12 19.5C16.5 19.5 20.5 16.5 22.5 12C20.5 7.5 16.5 4.5 12 4.5ZM12 17C9 17 6.5 14.5 6.5 12C6.5 9.5 9 7 12 7C15 7 17.5 9.5 17.5 12C17.5 14.5 15 17 12 17ZM12 9C10.5 9 9 10.5 9 12C9 13.5 10.5 15 12 15C13.5 15 15 13.5 15 12C15 10.5 13.5 9 12 9Z"
                  fill="#999"
                />
                <path
                  d="M2 2L22 22"
                  stroke="#999"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        </div>

        <button type='submit'>
          {currState === "Sign up" ? "Create account" : "Login now"}
        </button>

        <div className='login-term'>
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy.</p>
        </div>

        <div className='login-forgot'>
          {currState === "Sign up" ? (
            <p className='login-toggle'>
              Already have an account?{" "}
              <span onClick={() => setCurrState("Login")}>Login here</span>
            </p>
          ) : (
            <p className='login-toggle'>
              Create an account{" "}
              <span onClick={() => setCurrState("Sign up")}>Click here</span>
            </p>
          )}
          {currState === "Login" ? (
            <p className='login-toggle'>
              Forgot Password? <span onClick={() => resetPass(email)}>Click here</span>
            </p>
          ) : null}
        </div>
      </form>
    </div>
  )
}

export default Login
