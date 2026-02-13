import PropTypes from 'prop-types';
import { createContext, useEffect, useReducer, useCallback } from 'react';

// third-party
import { Chance } from 'chance';
import jwtDecode from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT, INITIALIZE } from 'store/reducers/actions';
import authReducer from 'store/reducers/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'axios';
import { APP_PATH_BASE_URL } from 'config';
import Cookies from 'js-cookie';

const chance = new Chance();

// constant
const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null,
  token: null
};

const verifyToken = (token) => {
  if (!token) {
    return false;
  }
  try {
    const decoded = jwtDecode(token);
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};

// Function to get token expiration time
const getTokenExpiration = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 

  const setSession = useCallback((token, user = null) => {
    if (token) {
      // Store token in cookie with HttpOnly flag if possible (more secure)
      Cookies.set('token', token, {
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: 1
      });

      // Also keep in memory for immediate access
      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      dispatch({
        type: LOGIN,
        payload: {
          isLoggedIn: true,
          user,
          token
        }
      });
    } else {
      // Remove token from cookies and memory
      Cookies.remove('token', { path: '/' });
      delete axios.defaults.headers.common.Authorization;
      dispatch({
        type: LOGOUT
      });
    }
  }, []);

  // Function to check token expiration and logout if expired
  const checkTokenExpiration = useCallback(() => {
    const token = Cookies.get('token');
    if (token && !verifyToken(token)) {
      setSession(null);
      localStorage.removeItem('auth');
    }
  }, [setSession]);

  const initializeAuth = useCallback(async () => {
    try {
      const token = Cookies.get('token');
      const authData = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : null;

      if (token && verifyToken(token)) {
        // Set the token in axios headers
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;

        // Try to get user data from localStorage or make an API call to get user info
        const user = authData?.user;

        dispatch({
          type: LOGIN,
          payload: {
            isLoggedIn: true,
            token,
            user
          }
        });

        // Set up token expiration check
        const expirationTime = getTokenExpiration(token);
        if (expirationTime) {
          const timeUntilExpiration = expirationTime - Date.now();
          if (timeUntilExpiration > 0) {
            setTimeout(() => {
              checkTokenExpiration();
            }, timeUntilExpiration);
          } else {
            // Token already expired
            checkTokenExpiration();
          }
        }
      } else {
        // Token is invalid or doesn't exist
        setSession(null);
      }
    } catch (err) {
      setSession(null);
    } finally {
      const authData = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')) : null;
      const user = authData?.user;
      dispatch({
        type: INITIALIZE,
        payload: {
          isInitialized: true,
          user: user
        }
      });
    }
  }, [setSession, checkTokenExpiration]);

  // Check token expiration periodically (every minute)
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isLoggedIn) {
        checkTokenExpiration();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isLoggedIn, checkTokenExpiration]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${APP_PATH_BASE_URL}api/login`,
        { username: email, password },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      // console.log('response :', response.data);
      if (response.data.success) {
        const { token, user } = response.data;

        setSession(token, user);
        const authData = {
          token:token,
          loginType: user.user_type,
          user: user
        };

        localStorage.setItem('auth', JSON.stringify(authData));


        // Set up expiration check for the new token
        const expirationTime = getTokenExpiration(token);
        if (expirationTime) {
          const timeUntilExpiration = expirationTime - Date.now();
          if (timeUntilExpiration > 0) {
            setTimeout(() => {
              checkTokenExpiration();
            }, timeUntilExpiration);
          }
        }

        // window.location.reload();
        return { success: true, message: 'Login successful' };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      let errorMessage = 'Login failed';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.Error) {
        errorMessage = error.Error.message || error.Error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      throw new Error(errorMessage);
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      const id = chance.bb_pin();
      const response = await axios.post('/api/account/register', {
        id,
        email,
        password,
        firstName,
        lastName
      });

      if (response.data.success) {
        // Optionally login user after registration
        // await login(email, password);
        return { success: true, message: 'Registration successful' };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      let errorMessage = 'Registration failed';

      if (error.response?.data) {
        const errorData = error.response.data;
        const firstError = Object.values(errorData)[0]?.[0];
        if (firstError) {
          errorMessage = firstError;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }

      throw new Error(errorMessage);
    }
  };

  const logout = useCallback(() => {
    setSession(null);
    localStorage.removeItem('auth');
  }, [setSession]);

  if (!state.isInitialized) {
    return <Loader />;
  }

  return (
    <JWTContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
        setSession,
        user: state.user,
        loginType: state.loginType,
        checkTokenExpiration // Export if you want to manually check from components
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;
