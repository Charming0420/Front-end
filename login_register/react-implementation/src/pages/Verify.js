import React from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Layout from 'Layout';


export default function Login(props) {
  const { register, handleSubmit, formState:{errors} } = useForm();

  const onSubmit = async data => {
    // 3. 处理登录逻辑
    try {
      const { token } = data;
      const res = await axios.post('http://localhost:3001/api/token', { token });
      const jwToken = res.data;
      global.auth.setToken(jwToken);
      toast.success('verify Success');
      // 4. 跳转到首页视图
      props.history.push('/');
    } catch (error) {
      const message = error.response.data.message;
      toast.error(message);
    }
  };

  return (
    <Layout>
    
      <form className="w80per registerposition mart40px" onSubmit={handleSubmit(onSubmit)}>
          <label className="fontbold">verify :</label>
          <input
            className={`loginitem h40px ${errors.email && 'is-danger'}`}
            type="text"
            placeholder=""
            name="token"
            {...register('token',{
              required: 'token is required',
            })}
          />
          {errors.email && (
            <p className="helper has-text-danger">{errors.email.message}</p>
          )}
          <button className="loginbtn martb30px">送出</button>
      </form>
    
    </Layout>
  );
}