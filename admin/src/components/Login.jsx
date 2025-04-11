import axios from 'axios';
import React, { useState } from 'react'
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Login = ({setToken}) => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');

const onSubmitHandler = async (e) =>{
    try {
        e.preventDefault();
       const response = await axios.post(backendUrl + '/api/user/admin',{email,password});
       if (response.data.success) {
     setToken(response.data.token)
       }
       else{
        toast.error(response.data.message);
       }
        
    } catch (error) {
        console.error(error);
        toast.error(error.message)
    }
}
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Panel</h1>
        <form onSubmit={onSubmitHandler} className="bg-white shadow-md rounded-lg p-6 w-80">
            <div className="mb-4">
                <p className="text-gray-700 font-semibold">Email Address</p>
                <input onChange={(e) =>setEmail(e.target.value)} value={email} type="email" placeholder='your@email.com' required 
                  className="w-full px-3 py-2 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <div className="mb-4">
                <p className="text-gray-700 font-semibold">Password</p>
                <input onChange={(e) =>setPassword(e.target.value)} value={password} type="password" placeholder='Enter your password' required 
                  className="w-full px-3 py-2 mt-1 border rounded-md outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
            <button type='submit' 
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
              Login
            </button>
        </form>
    </div>
  )
}

export default Login
