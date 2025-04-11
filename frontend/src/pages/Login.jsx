/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
 const {token,setToken,navigate,backendUrl} = useContext(ShopContext)
 
 const[name,setName] = useState('')
 const[email,setEmail] = useState('')
 const[password,setPassword] = useState('')

const onSubmitHandler = async (e) => {
  e.preventDefault();
  try {
    if (currentState === "Sign Up") {
const response = await axios.post(backendUrl + '/api/user/register' , {name,email,password})
 if (response.data.success) {
  setToken(response.data.token)
  localStorage.setItem('token',response.data.token)
 } else{
  toast.error(response.data.message)
 }
    }
else{
  const response = await axios.post(backendUrl + '/api/user/login',{email,password})
 if (response.data.success) {
  setToken(response.data.token)
  localStorage.setItem('token',response.data.token)
 }
  else{
    toast.error(response.data.message)
  }
}

  } catch (error) {
    console.error(error);
    toast.error(error.message)
  }
};
useEffect(()=>{
if(token){
  navigate('/')
}
},[token])
  return (
    <form onSubmit={onSubmitHandler} className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-5 text-gray-800">
      {/* Heading */}
      <div className="inline-flex items-center gap-2 mb-4 mt-10">
        <p className="prata-regular text-4xl font-semibold">{currentState}</p>
        <hr className="border-none h-[2px] w-10 bg-gray-800" />
      </div>

      {/* Conditionally Rendered Input Fields */}
      {currentState === "Sign Up" && (
        <input
          type="text"
          placeholder="Full Name"
          required
          className="w-full h-12 px-4 text-lg border border-gray-800 rounded-md focus:ring-2 focus:ring-gray-600"
          onChange={(e)=>setName(e.target.value)}
          value={name}
        />
      )}
      <input
        type="email"
        placeholder="Email"
        required
        className="w-full h-12 px-4 text-lg border border-gray-800 rounded-md focus:ring-2 focus:ring-gray-600"
        onChange={(e)=>setEmail(e.target.value)}
        value={email}
      />
      <input
        type="password"
        placeholder="Password"
        required
        className="w-full h-12 px-4 text-lg border border-gray-800 rounded-md focus:ring-2 focus:ring-gray-600"
        onChange={(e)=>setPassword(e.target.value)}
        value={password}
      />

      {/* Forgot Password (Only for Login) */}
      {currentState === "Login" && (
        <p className="text-sm text-gray-600 self-start cursor-pointer hover:underline">
          Forgot Password?
        </p>
      )}

      {/* Action Button */}
      <button
        type="submit"
        className="mt-4 w-full h-12 bg-gray-800 text-white text-lg font-medium rounded-md hover:bg-gray-700"
      >
        {currentState}
      </button>

      {/* Toggle Link */}
      <p
        onClick={() =>
          setCurrentState(currentState === "Sign Up" ? "Login" : "Sign Up")
        }
        className="mt-3 text-sm text-gray-600 cursor-pointer hover:underline"
      >
        {currentState === "Sign Up"
          ? "Already have an account? Login"
          : "Don't have an account? Sign Up"}
      </p>
    </form>
  );
};

export default Login;
