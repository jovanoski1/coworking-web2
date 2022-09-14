import React from 'react'
import {useRef} from "react";

const Form = ({eventFunc, isEmailProvided}) => {
    const form = useRef();
  return (
    <>
        <form onSubmit={eventFunc} ref={form}>
            <div className="input-group input-group-lg">
            <input type="text" id="userEmail" name='user_email' placeholder = {isEmailProvided? 'Verification code': 'Email'} className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-lg" />
            <button className="btn btn-primary" type="submit" value="Submit" onClick={() => document.getElementById("userEmail").value=""}>{isEmailProvided?'Submit Code':'Submit Email'}</button>
            </div>
        </form>
    </>
  )
}
export default Form
